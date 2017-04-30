/**
 * @fileoverview Collector that uses the Chrome Debugging protocol to
 * load a site and do the traversing. It also uses [request](https:/github.com/request/request)
 * to download the external resources (JS, CSS, images).
*/

/* eslint-disable new-cap  */

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

import * as url from 'url';

import * as cdp from 'chrome-remote-interface';
import * as pify from 'pify';
import * as r from 'request';

import { CDPAsyncHTMLDocument, CDPAsyncHTMLElement } from './cdp-async-html';
import { debug as d } from '../../utils/debug';

/* eslint-disable no-unused-vars */
import {
    ICollector, ICollectorBuilder,
    IElementFoundEvent, IFetchEndEvent, IFetchErrorEvent, IManifestFetchEnd, IManifestFetchErrorEvent, ITraverseUpEvent, ITraverseDownEvent,
    INetworkData, URL
} from '../../types';
/* eslint-enable */
import { launchChrome } from './cdp-launcher';
import { getCharset } from '../utils/charset';
import { normalizeHeaders } from '../utils/normalize-headers';
import { RedirectManager } from '../utils/redirects';

import { Sonar } from '../../sonar'; // eslint-disable-line no-unused-vars

const debug = d(__filename);

class CDPCollector implements ICollector {
    /** The final set of options resulting of merging the users, and default ones. */
    private _options;
    /** The default headers to do any request. */
    private _headers;
    /** The original URL to collect. */
    private _href: string;
    /** The final URL after redirects (if they exist) */
    private _finalHref: string;
    /** The instance of Sonar that is using this collector. */
    private _server: Sonar;
    /** The CDP client to talk to the browser. */
    private _client;
    /** Browser's child process */
    private _child: number;
    /** A set of requests done by the collector to retrieve initial information more easily. */
    private _requests: Map<string, any>;
    /** The parsed and original HTML. */
    private _html: string;
    /** The DOM abstraction on top of CDP. */
    private _dom: CDPAsyncHTMLDocument;
    /** A handy tool to calculate the `hop`s for a given url. */
    private _redirects = new RedirectManager();
    /** A collection of requests with their initial data. */
    private _pendingResponseReceived: Array<Function>;
    /** List of all the tabs used by the collector. */
    private _tabs = [];
    /** Tells if the page has specified a manifest or not. */
    private _manifestIsSpecified: boolean = false;

    constructor(server: Sonar, config: object) {
        const defaultOptions = { waitFor: 5000 };

        this._server = server;

        this._options = Object.assign({}, defaultOptions, config);
        this._headers = this._options.headers;

        // TODO: setExtraHTTPHeaders with _headers in an async way.

        this._requests = new Map();
        this._pendingResponseReceived = [];
    }

    // ------------------------------------------------------------------------------
    // Private methods
    // ------------------------------------------------------------------------------

    private async getElementFromParser(parts: Array<string>): Promise<CDPAsyncHTMLElement> {
        let basename: string = null;
        let elements: Array<CDPAsyncHTMLElement> = [];

        while (parts.length > 0) {
            basename = !basename ? parts.pop() : `${parts.pop()}/${basename}`;
            const query = `[src$="${basename}"],[href$="${basename}"]`;
            const newElements = await this._dom.querySelectorAll(query);

            if (newElements.length === 0) {
                if (elements.length > 0) {
                    /* This could happen if the url is relative and we are adding the domain.*/
                    return elements[0];
                }
                // No elements initiated the request. Maybe because of extension?
                return null;
            }

            // Just one element easy peasy
            if (newElements.length === 1) {
                return newElements[0];
            }

            elements = newElements;
        }

        /* If we reach this point, we have several elements that have the same url so we return the first
            because its the one that started the request. */

        return elements[0];
    }

    /** Returns the IAsyncHTMLElement that initiated a request */
    private async getElementFromRequest(requestId: string): Promise<CDPAsyncHTMLElement> {
        const element = this._requests.get(requestId);

        if (!element) {
            return null;
        }

        const { initiator: { type } } = element;
        let { request: { url: requestUrl } } = element;
        // We need to calculate the original url because it might have redirects
        const originalUrl = this._redirects.calculate(requestUrl);

        requestUrl = url.parse(originalUrl[0] || requestUrl);
        const parts = requestUrl.href.split('/');

        // TODO: Check what happens with prefetch, etc.
        // `type` can be "parser", "script", "preload", and "other": https://chromedevtools.github.io/debugger-protocol-viewer/tot/Network/#type-Initiator
        if (type === 'parser' && requestUrl.protocol.indexOf('http') === 0) {
            return await this.getElementFromParser(parts);
        }

        return null;
    }

    /** Event handler for when the browser is about to make a request. */
    private async onRequestWillBeSent(params) {
        const requestUrl = params.request.url;

        this._requests.set(params.requestId, params);

        if (!this._headers) {
            // TODO: do some clean up, we probably don't want all the headers as the "defaults".
            this._headers = params.request.headers;
        }

        if (params.redirectResponse) {
            debug(`Redirect found for ${requestUrl}`);
            // We store the redirects with the finalUrl as a key to do a reverse search in onResponseReceived.
            this._redirects.add(requestUrl, params.redirectResponse.url);

            // If needed, update the final URL.
            if (this._redirects.calculate(requestUrl)[0] === this._href) {
                this._finalHref = requestUrl;
            }

            return;
        }

        const eventName = this._href === requestUrl ? 'targetfetch::start' : 'fetch::start';

        debug(`About to start fetching ${requestUrl}`);
        await this._server.emitAsync(eventName, { resource: requestUrl });
    }

    /** Event handler fired when HTTP request fails for some reason. */
    private async onLoadingFailed(params) {
        if (params.type === 'Manifest') {
            const { request: { url: resource } } = this._requests.get(params.requestId);
            const event: IManifestFetchErrorEvent = {
                error: new Error(params.errorText),
                resource
            };

            await this._server.emitAsync('manifestfetch::error', event);

            return;
        }

        // DOM is not ready so we queue up the event for later
        if (!this._dom) {
            this._pendingResponseReceived.push(this.onLoadingFailed.bind(this, params));

            return;
        }

        /* If `requestId` is not in `this._requests` it means that we already processed the request in `onResponseReceived` */
        if (!this._requests.has(params.requestId)) {
            debug(`requestId doesn't exist, skipping this error`);

            return;
        }

        debug(`Error found:\n${JSON.stringify(params)}`);
        const element = await this.getElementFromRequest(params.requestId);
        const { request: { url: resource } } = this._requests.get(params.requestId);
        const eventName = this._href === resource ? 'targetfetch::error' : 'fetch::error';

        const hops = this._redirects.calculate(resource);

        console.log(`Error: ${resource}`);

        const event: IFetchErrorEvent = {
            element,
            error: params,
            hops,
            resource
        };

        await this._server.emitAsync(eventName, event);
    }

    /** Event handler fired when HTTP response is available and DOM loaded. */
    private async onResponseReceived(params) {
        // DOM is not ready so we queue up the event for later
        if (!this._dom) {
            this._pendingResponseReceived.push(this.onResponseReceived.bind(this, params));

            return;
        }

        const resourceUrl = params.response.url;
        const resourceHeaders = normalizeHeaders(params.response.headers);
        let resourceBody = '';
        const hops = this._redirects.calculate(resourceUrl);
        const originalUrl = hops[0] || resourceUrl;

        try {
            resourceBody = (await this._client.Network.getResponseBody({ requestId: params.requestId })).body;
        } catch (e) {
            debug(`Body requested after connection closed for request ${params.requestId}`);
            /* HACK: This is to make https://github.com/MicrosoftEdge/Sonar/pull/144 pass.
                There are some concurrency issues at the moment that are more visible in low powered machines and
                when the CPU is highly used. The problem is most likely related to having pending requests but
                the analysis has finished already. The `setTimeout` in `onLoadEventFired` might be partially
                responsible.
                We should:
                * Wait for all pending requests instead of doing a `setTimeout` (within reason)
                * Cancel all requests/remove all listeners when we do `close()`
            */
        }
        debug(`Content for ${resourceUrl} downloaded`);

        const data: IFetchEndEvent = {
            element: null,
            request: {
                headers: params.response.requestHeaders,
                url: originalUrl
            },
            resource: resourceUrl,
            response: {
                body: {
                    content: resourceBody,
                    contentEncoding: getCharset(resourceHeaders),
                    rawContent: Buffer.alloc(params.response.encodedDataLength), //TODO: get the actual bytes!
                    rawResponse: null //TODO: get the real response bytes
                },
                headers: resourceHeaders,
                hops,
                statusCode: params.response.status,
                url: params.response.url
            }
        };

        if (params.type === 'Manifest') {
            await this._server.emitAsync('manifestfetch::end', data);

            return;
        }

        const eventName = this._href === originalUrl ? 'targetfetch::end' : 'fetch::end';

        if (eventName === 'fetch::end') {
            data.element = await this.getElementFromRequest(params.requestId);
        }

        /* We don't need to store the request anymore so we can remove it and ignore it
         * if we receive it in `onLoadingFailed` (used only for "catastrophic" failures).
         */
        this._requests.delete(params.requestId);

        await this._server.emitAsync(eventName, data);
    }

    /** Traverses the DOM notifying when a new element is traversed. */
    private async traverseAndNotify(element) {
        /* CDP returns more elements than the ones we want. For example there
            are 2 HTML elements. One has children and has `nodeType === 1`,
            while the other doesn't have children and `nodeType === 10`.
            We ignore those elements.

            * 10: `HTML` with no children
        */
        const ignoredNodeTypes = [10];

        if (ignoredNodeTypes.includes(element.nodeType)) {
            return;
        }

        const eventName = `element::${element.nodeName.toLowerCase()}`;

        const wrappedElement = new CDPAsyncHTMLElement(element, this._dom, this._client.DOM);

        debug(`emitting ${eventName}`);
        const event: IElementFoundEvent = {
            element: wrappedElement,
            resource: this._finalHref
        };

        await this._server.emitAsync(eventName, event);

        if (eventName === 'element::link' && wrappedElement.getAttribute('rel') === 'manifest') {
            this._manifestIsSpecified = true;
            // CDP will not download the manifest on its own, so we have to "force" it
            // This will trigger the `onRequestWillBeSent`, `OnResponseReceived`, and
            // `onLoadingFailed` for the manifest URL.
            await this._client.Page.getAppManifest();
        }

        const elementChildren = wrappedElement.children;

        for (const child of elementChildren) {
            debug('next children');
            const traverseDown: ITraverseDownEvent = { resource: this._finalHref };

            await this._server.emitAsync(`traverse::down`, traverseDown);
            await this.traverseAndNotify(child);  // eslint-disable-line no-await-for
        }

        const traverseUp: ITraverseUpEvent = { resource: this._finalHref };

        await this._server.emitAsync(`traverse::up`, traverseUp);
    }

    /** Initiates Chrome if needed and a new tab to start the collection. */
    private async initiateComms() {
        const newBrowser = await launchChrome('about:blank');
        let client;

        /* We want a new tab for this session. If it is a new browser, a new tab
            will be created automatically. If it was already there, then we need
            to create it ourselves. */
        if (newBrowser) {
            client = await cdp();
            this._tabs = await cdp.List();
        } else {
            const tab = await cdp.New();

            this._tabs.push(tab);

            client = await cdp({
                tab: (tabs): number => {
                    /* We can return a tab or an index. Also `tab` !== tab[index]
                        even if the have the same `id`. */
                    for (let index = 0; index < tabs.length; index++) {
                        if (tabs[index].id === tab.id) {
                            return index;
                        }
                    }

                    return -1; //We should never reach this point...
                }
            });
        }

        return client;
    }

    /** Handles when there has been an unexpected error talking with the browser. */
    private onError(err) {
        debug(`Error: \n${err}`);
    }

    /** Handles when we have been disconnected from the browser. */
    private onDisconnect() {
        debug(`Disconnected`);
    }

    /** Sets the right configuration and enables all the required CDP features. */
    private async configureAndEnableCDP() {
        const { Network, Page } = this._client;

        this._client.on('error', this.onError);
        this._client.on('disconnect', this.onDisconnect);

        await Promise.all([
            Network.clearBrowserCache(),
            Network.setCacheDisabled({ cacheDisabled: true }),
            Network.requestWillBeSent(this.onRequestWillBeSent.bind(this)),
            Network.responseReceived(this.onResponseReceived.bind(this)),
            Network.loadingFailed(this.onLoadingFailed.bind(this))
        ]);

        await Promise.all([
            Network.enable(),
            Page.enable()
        ]);
    }

    /** Initiates all the proce */
    private onLoadEventFired(callback: Function): Function {
        return async () => {
            const { DOM } = this._client;
            const event = { resource: this._finalHref };
            // TODO: Wait a few seconds here before traversing
            // or is this event fired when everything is quiet?

            this._dom = new CDPAsyncHTMLDocument(DOM);

            await this._dom.load();

            while (this._pendingResponseReceived.length) {
                await this._pendingResponseReceived.shift()();
            }

            await this._server.emitAsync('traverse::start', event);
            await this.traverseAndNotify(this._dom.root);
            await this._server.emitAsync('traverse::end', event);

            await this._server.emitAsync('scan::end', event);

            setTimeout(callback, 1000); //HACK: need to check if there is any pending request, wait for it and timeout after a few seconds
        };
    }

    // ------------------------------------------------------------------------------
    // Public methods
    // ------------------------------------------------------------------------------

    public collect(target: URL) {
        return pify(async (callback) => {
            this._href = target.href;
            this._finalHref = target.href; // This value will be updated if we load the site
            const event = { resource: this._href };
            let client;

            await this._server.emit('scan::start', event);

            try {
                client = await this.initiateComms();
            } catch (e) {
                debug('Error connecting to browser');
                debug(e);

                await this._server.emitAsync('scan::end', event);

                callback(e);

                return;
            }

            this._client = client;
            const { Page } = client;

            Page.loadEventFired(this.onLoadEventFired(callback));

            try {
                await this.configureAndEnableCDP();

                await Page.navigate({ url: this._href });
            } catch (e) {
                await this._server.emitAsync('scan::end', event);

                callback(e);

                return;
            }
        })();
    }

    public async close() {
        debug('Closing browsers used by CDP');

        while (this._tabs.length > 0) {
            const tab = this._tabs.pop();

            try {
                await cdp.closeTab(tab);
            } catch (e) {
                debug(`Couldn't close tab ${tab.id}`);
            }
        }

        try {
            this._client.close();
        } catch (e) {
            debug(`Couldn't close the client properly`);
        }
    }

    public async fetchContent(target: URL | string, customHeaders?: object): Promise<INetworkData> {
        // TODO: This should create a new tab, navigate to the
        // resource and control what is received somehow via an event.
        let req;
        const href = typeof target === 'string' ? target : target.href;

        if (customHeaders) {
            const tempHeaders = Object.assign({}, this._headers, customHeaders);

            req = pify(r.defaults({ headers: tempHeaders }), { multiArgs: true });
        } else {
            req = pify(r, { multiArgs: true });
        }

        const [response, body] = await req(href);

        return {
            request: {
                headers: response.request.headers,
                url: href
            },
            response: {
                body: {
                    content: body,
                    contentEncoding: null,
                    rawContent: null,
                    rawResponse: null
                },
                headers: normalizeHeaders(response.headers),
                hops: [], // TODO: populate
                statusCode: response.statusCode,
                url: href
            }
        };
    }

    /**
     * The `exceptionDetails` provided by the debugger protocol does not contain the useful
     * information such as name, message, and stack trace of the error when it's wrapped in a
     * promise. Instead, map to a successful object that contains this information.
     * @param {string|Error} err The error to convert
     * istanbul ignore next
     */
    private wrapRuntimeEvalErrorInBrowser(e) {
        const err = e || new Error();
        const fallbackMessage = typeof err === 'string' ? err : 'unknown error';

        return {
            __failedInBrowser: true,
            message: err.message || fallbackMessage,
            name: err.name || 'Error',
            stack: err.stack || (new Error()).stack
        };
    }

    /** Asynchronoulsy evaluates the given JavaScript code into the browser.
     *
     * This awesomeness comes from lighthouse
     */
    public evaluate(code): Promise<any> {

        return new Promise(async (resolve, reject) => {
            // If this gets to 60s and it hasn't been resolved, reject the Promise.
            const asyncTimeout = setTimeout(
                (() => {
                    reject(new Error('The asynchronous expression exceeded the allotted time of 60s'));
                }), 60000);

            try {
                const expression = `(function wrapInNativePromise() {
          const __nativePromise = window.__nativePromise || Promise;
          return new __nativePromise(function (resolve) {
            return __nativePromise.resolve()
              .then(_ => ${code})
              .catch(function ${this.wrapRuntimeEvalErrorInBrowser.toString()})
              .then(resolve);
          });
        }())`;

                const result = await this._client.Runtime.evaluate({
                    awaitPromise: true,
                    // We need to explicitly wrap the raw expression for several purposes:
                    // 1. Ensure that the expression will be a native Promise and not a polyfill/non-Promise.
                    // 2. Ensure that errors in the expression are captured by the Promise.
                    // 3. Ensure that errors captured in the Promise are converted into plain-old JS Objects
                    //    so that they can be serialized properly b/c JSON.stringify(new Error('foo')) === '{}'
                    expression,
                    includeCommandLineAPI: true,
                    returnByValue: true
                });

                clearTimeout(asyncTimeout);
                const value = result.result.value;

                if (result.exceptionDetails) {
                    // An error occurred before we could even create a Promise, should be *very* rare
                    return reject(new Error('an unexpected driver error occurred'));
                }

                if (value && value.__failedInBrowser) {
                    return reject(Object.assign(new Error(), value));
                }

                return resolve(value);
            } catch (err) {
                clearTimeout(asyncTimeout);

                return reject(err);
            }
        });
    }

    public querySelectorAll(selector: string) {
        return this._dom.querySelectorAll(selector);
    }

    // ------------------------------------------------------------------------------
    // Getters
    // ------------------------------------------------------------------------------

    get headers() {
        return this._headers;
    }

    get html() {
        return this._html;
    }
}

const builder: ICollectorBuilder = (server: Sonar, config): ICollector => {
    const collector = new CDPCollector(server, config);

    return collector;
};

export default builder;
