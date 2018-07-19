/**
 * @fileoverview Connector that uses the Chrome Debugging protocol
 * to load a site and do the traversing. It also uses request
 * (https:/github.com/request/request) to download the external
 * resources (JS, CSS, images).
 */

/*
 * ------------------------------------------------------------------------------
 * Requirements
 * ------------------------------------------------------------------------------
 */

import { URL } from 'url';
import { promisify } from 'util';

import * as cdp from 'chrome-remote-interface';
import { compact, filter } from 'lodash';

import { CDPAsyncHTMLDocument, AsyncHTMLElement } from 'hint/dist/src/lib/types/cdp-async-html';
import { getContentTypeData, getType } from 'hint/dist/src/lib/utils/content-type';
import { debug as d } from 'hint/dist/src/lib/utils/debug';
import * as logger from 'hint/dist/src/lib/utils/logging';
import cutString from 'hint/dist/src/lib/utils/misc/cut-string';
import delay from 'hint/dist/src/lib/utils/misc/delay';
import hasAttributeWithValue from 'hint/dist/src/lib/utils/network/has-attribute-with-value';
import isHTMLDocument from 'hint/dist/src/lib/utils/network/is-html-document';

import {
    BrowserInfo, IConnector,
    IAsyncHTMLElement, ElementFound, Event, FetchEnd, FetchError, ILauncher, TraverseUp, TraverseDown,
    Response, Request, NetworkData
} from 'hint/dist/src/lib/types';

import { normalizeHeaders } from '@hint/utils-connector-tools/dist/src/normalize-headers';
import { RedirectManager } from '@hint/utils-connector-tools/dist/src/redirects';
import { Requester } from '@hint/utils-connector-tools/dist/src/requester';

import { Engine } from 'hint/dist/src/lib/engine';

const debug: debug.IDebugger = d(__filename);

export class Connector implements IConnector {
    /** The final set of options resulting of merging the users, and default ones. */
    private _options;
    /** The default headers to do any request. */
    private _headers;
    /** The original URL to collect. */
    private _href: string;
    /** The final URL after redirects (if they exist) */
    private _finalHref: string;
    /** The instance of hint that is using this connector. */
    private _server: Engine;
    /** The client to talk to the browser. */
    private _client;
    /** A set of requests done by the connector to retrieve initial information more easily. */
    private _requests: Map<string, any>;
    /** Indicates if there has been an error loading the page (e.g.: it doesn't exists). */
    private _errorWithPage: boolean = false;
    /** The DOM abstraction on top of adapter. */
    private _dom: CDPAsyncHTMLDocument;
    /** A handy tool to calculate the `hop`s for a given url. */
    private _redirects = new RedirectManager();
    /** A collection of requests with their initial data. */
    private _pendingResponseReceived: Array<Function>;
    /** List of all the tabs used by the connector. */
    private _tabs = [];
    /** Tells if a favicon of a page has been downloaded from a link tag. */
    private _faviconLoaded: boolean = false;
    /** The amount of time before an event is going to be timedout. */
    private _timeout: number;
    /** Browser PID */
    private pid: number;
    private _targetNetworkData: NetworkData;
    private launcher: ILauncher;
    /** Promise that gets resolved when the taget is downloaded. */
    private _waitForTarget: Promise<null>;
    /** Function to call when the target is downloaded. */
    private targetReceived: Function;

    public constructor(server: Engine, config: object, launcher: ILauncher) {
        const defaultOptions = {
            /*
             * tabUrl is a empty html site used to avoid edge diagnostics adapter to receive unexpeted onLoadEventFired
             * and onRequestWillBeSent events from the default url opened when you create a new tab in Edge.
             */
            tabUrl: 'https://empty.webhint.io/',
            useTabUrl: false,
            waitFor: 1000
        };

        this._server = server;
        this._timeout = server.timeout;

        this._options = Object.assign({}, defaultOptions, config);
        this._headers = this._options.headers;

        // TODO: setExtraHTTPHeaders with _headers in an async way.

        this._requests = new Map();
        this._pendingResponseReceived = [];

        this.launcher = launcher;

        this._waitForTarget = new Promise((resolve) => {
            this.targetReceived = resolve;
        });
    }

    /*
     * ------------------------------------------------------------------------------
     * Private methods
     * ------------------------------------------------------------------------------
     */

    private async getElementFromParser(parts: Array<string>): Promise<AsyncHTMLElement> {
        let basename: string = null;
        let elements: Array<AsyncHTMLElement> = [];

        while (parts.length > 0) {
            basename = !basename ? parts.pop() : `${parts.pop()}/${basename}`;
            const query: string = `[src$="${basename}"],[href$="${basename}"]`;
            const newElements: Array<AsyncHTMLElement> = await this._dom.querySelectorAll(query);

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

        /*
         * If we reach this point, we have several elements that have the same url so we return the first
         *because its the one that started the request.
         */

        return elements[0];
    }

    /** Returns the IAsyncHTMLElement that initiated a request */
    private async getElementFromRequest(requestId: string): Promise<AsyncHTMLElement> {
        const sourceRequest = this._requests.get(requestId);

        if (!sourceRequest) {
            return null;
        }

        const { initiator: { type } } = sourceRequest;
        let { request: { url: requestUrl } } = sourceRequest;
        // We need to calculate the original url because it might have redirects
        const originalUrl: Array<string> = this._redirects.calculate(requestUrl);

        requestUrl = new URL(originalUrl[0] || requestUrl);
        const parts: Array<string> = requestUrl.href.split('/');

        /*
         * TODO: Check what happens with prefetch, etc.
         * `type` can be "parser", "script", "preload", and "other": https://chromedevtools.github.io/debugger-protocol-viewer/tot/Network/#type-Initiator
         */
        if (['parser', 'other'].includes(type) && requestUrl.protocol.indexOf('http') === 0) {
            return await this.getElementFromParser(parts);
        }

        return null;
    }

    /** Check if a request or response is to or from `/favicon.ico` */
    private rootFaviconRequestOrResponse(params) {
        if (!this._finalHref) {
            return false;
        }
        const faviconUrl = new URL('/favicon.ico', this._finalHref).href;
        const event = params.request || params.response;

        if (!event) {
            return false;
        }

        return this._finalHref && faviconUrl === event.url;
    }

    /** Event handler for when the browser is about to make a request. */
    private async onRequestWillBeSent(params) {
        const requestUrl: string = params.request.url;

        this._requests.set(params.requestId, params);

        if (!this._headers) {
            // TODO: do some clean up, we probably don't want all the headers as the "defaults".
            this._headers = params.request.headers;
        }

        if (params.redirectResponse) {
            debug(`Redirect found for ${cutString(requestUrl)}`);

            if (requestUrl === params.redirectResponse.url) {
                logger.error(`Error redirecting: ${requestUrl} is an infinite loop`);

                return;
            }

            const hops = this._redirects.calculate(requestUrl);

            // We limit the number of redirects
            if (hops.length >= 10) {
                logger.error(`More than 10 redirects found for ${requestUrl}`);

                return;
            }

            // We store the redirects with the finalUrl as a key to do a reverse search in onResponseReceived.
            this._redirects.add(requestUrl, params.redirectResponse.url);

            // If needed, update the final URL.
            if (hops[0] === this._href) {
                this._finalHref = requestUrl;
            }

            return;
        }

        const eventName: string = this._href === requestUrl ? 'fetch::start::target' : 'fetch::start';

        debug(`About to start fetching ${cutString(requestUrl)}`);

        /*
         * `getFavicon` will make attempts to download favicon later.
         * Ignore `cdp` requests to download favicon from the root
         * to avoid emitting duplidate events.
         */
        if (!this.rootFaviconRequestOrResponse(params)) {
            await this._server.emitAsync(eventName, { resource: requestUrl });
        }
    }

    /** Event handler fired when HTTP request fails for some reason. */
    private async onLoadingFailed(params) {
        const request = this._requests.get(params.requestId);

        /*
         * If `requestId` is not in `this._requests` it means that we
         * already processed the request in `onResponseReceived`.
         *
         * Usually `onLoadingFailed` should be fired before but we've
         * had problems with this before.
         */
        if (!request) {
            debug(`requestId doesn't exist, skipping this error`);

            return;
        }

        const requestUrl = request.request.url;

        /* There is a problem loading the website and we should abort any further processing. */
        if (requestUrl === this._href || requestUrl === this._finalHref) {
            this._errorWithPage = true;

            return;
        }

        // DOM is not ready so we queue up the event for later
        if (!this._dom) {
            this._pendingResponseReceived.push(this.onLoadingFailed.bind(this, params));

            return;
        }

        debug(`Error found:\n${JSON.stringify(params)}`);
        const element: AsyncHTMLElement = await this.getElementFromRequest(params.requestId);
        const requestInfo = this._requests.get(params.requestId);

        if (!requestInfo) {
            debug(`Request ${params.requestId} failed but wasn't in the list`);

            return;
        }

        const { request: { url: resource } } = requestInfo;
        const eventName: string = 'fetch::error';

        const hops: Array<string> = this._redirects.calculate(resource);

        const event: FetchError = {
            element,
            error: params,
            hops,
            resource
        };

        this._requests.delete(params.requestId);

        /*
         * `getFavicon` will make attempts to download favicon later.
         * Ignore `cdp` requests to download favicon from the root
         * to avoid emitting duplidate events.
         */
        if (!this.rootFaviconRequestOrResponse(params)) {
            await this._server.emitAsync(eventName, event);
        }
    }

    private async getResponseBody(cdpResponse): Promise<{ content: string, rawContent: Buffer, rawResponse(): Promise<Buffer> }> {
        let content: string = '';
        let rawContent: Buffer = null;
        const rawResponse = (): Promise<Buffer> => {
            return Promise.resolve(null);
        };
        const fetchContent = this.fetchContent.bind(this);

        const defaultBody = { content, rawContent, rawResponse };

        if (cdpResponse.response.status !== 200) {
            // TODO: is this right? no-friendly-error-pages won't have a problem?
            return defaultBody;
        }

        try {
            const { body, base64Encoded } = await this._client.Network.getResponseBody({ requestId: cdpResponse.requestId });
            const encoding = base64Encoded ? 'base64' : 'utf8';

            content = body;
            rawContent = Buffer.from(body, encoding);

            const returnValue = {
                content,
                rawContent,
                rawResponse(): Promise<Buffer> {
                    const self = (this as any);
                    const cached = self._rawResponse;

                    if (cached) {
                        return Promise.resolve(cached);
                    }

                    if (rawContent.length.toString() === cdpResponse.response.headers['Content-Length']) {
                        // Response wasn't compressed so both buffers are the same
                        return Promise.resolve(rawContent);
                    }

                    const { url: responseUrl, requestHeaders: headers } = cdpResponse.response;

                    /*
                     * Real browser connectors automatically request using HTTP2. This spec has
                     * [`Pseudo-Header Fields`](https://tools.ietf.org/html/rfc7540#section-8.1.2.3):
                     * `:authority`, `:method`, `:path` and `:scheme`.
                     *
                     * An example of request with those `Pseudo-Header Fields` to google.com:
                     *
                     * ```
                     * :authority:www.google.com
                     * :method:GET
                     * :path:/images/branding/googlelogo/2x/googlelogo_color_120x44dp.png
                     * :scheme:https
                     * accept:text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*\/*;q=0.8
                     * accept-encoding:gzip, deflate, br
                     * ...
                     * ```
                     *
                     * The `request` module doesn't support HTTP2 yet: https://github.com/request/request/issues/2033
                     * so the request need to be transformed to valid HTTP 1.1 ones, basically removing those headers.
                     *
                     */

                    const validHeaders = Object.entries(headers || {}).reduce((final, [key, value]) => {
                        if (key.startsWith(':')) {
                            return final;
                        }

                        final[key] = value;

                        return final;
                    }, {});

                    return fetchContent(responseUrl, validHeaders)
                        .then((result) => {
                            const { response: { body: { rawResponse: rr } } } = result;

                            return rr();
                        })
                        .then((value) => {
                            self._rawResponse = value;

                            return value;
                        });
                }
            };

            debug(`Content for ${cutString(cdpResponse.response.url)} downloaded`);

            return returnValue;
        } catch (e) {
            debug(`Body requested after connection closed for request ${cdpResponse.requestId}`);
            defaultBody.rawContent = Buffer.alloc(0);

            debug(`Content for ${cutString(cdpResponse.response.url)} downloaded`);

            return defaultBody;
        }
    }

    /** Returns a Response for the given request. */
    private async createResponse(cdpResponse, element: IAsyncHTMLElement): Promise<Response> {
        const resourceUrl: string = cdpResponse.response.url;
        const hops: Array<string> = this._redirects.calculate(resourceUrl);
        const resourceHeaders: object = normalizeHeaders(cdpResponse.response.headers);
        let { content, rawContent, rawResponse } = await this.getResponseBody(cdpResponse);
        let retry = 3;

        /*
         * Sometimes, the content is empty at the beginning, but
         * after few millisecons, it isn't.
         */
        while (!content && (!rawContent || rawContent.length === 0) && retry > 0) {
            await delay(250);

            ({ content, rawContent, rawResponse } = await this.getResponseBody(cdpResponse));

            retry--;
        }

        if (retry === 0) {
            debug(`${resourceUrl} is empty`);
        }

        const response: Response = {
            body: {
                content,
                rawContent,
                rawResponse
            },
            charset: null,
            headers: resourceHeaders,
            hops,
            mediaType: null,
            statusCode: cdpResponse.response.status,
            url: resourceUrl
        };

        const { charset, mediaType } = getContentTypeData(element, resourceUrl, response.headers, response.body.rawContent);

        response.mediaType = mediaType;
        response.charset = charset;

        return response;
    }

    /** Event handler fired when HTTP response is available and DOM loaded. */
    private async onResponseReceived(params) {
        const resourceUrl: string = params.response.url;
        const hops: Array<string> = this._redirects.calculate(resourceUrl);
        const originalUrl: string = hops[0] || resourceUrl;

        let element = null;
        let eventName: string = 'fetch::end';
        const isTarget: boolean = this._href === originalUrl;

        if (!isTarget) {
            // DOM is not ready so we queue up the event for later
            if (!this._dom) {
                this._pendingResponseReceived.push(this.onResponseReceived.bind(this, params));

                return;
            }

            try {
                element = await this.getElementFromRequest(params.requestId);
            } catch (e) {
                debug(`Error finding element for request ${params.requestId}. element will be null`);
            }
        }

        const response: Response = await this.createResponse(params, element);

        const request: Request = {
            headers: params.response.requestHeaders,
            url: originalUrl
        };

        const data: FetchEnd = {
            element,
            request,
            resource: resourceUrl,
            response
        };

        if (isTarget) {
            this._targetNetworkData = {
                request,
                response
            };

            this.targetReceived();
        }

        eventName = `${eventName}::${getType(response.mediaType)}`;

        if (hasAttributeWithValue(data.element, 'link', 'rel', 'icon')) {
            this._faviconLoaded = true;
        }

        /*
         * `getFavicon` will make attempts to download favicon later.
         * Ignore `cdp` requests to download favicon from the root
         * to avoid emitting duplidate events.
         */
        if (!this.rootFaviconRequestOrResponse(params)) {
            /** Event is also emitted when status code in response is not 200. */
            await this._server.emitAsync(eventName, data);
        }

        /*
         * We don't need to store the request anymore so we can remove it and ignore it
         * if we receive it in `onLoadingFailed` (used only for "catastrophic" failures).
         */
        this._requests.delete(params.requestId);
    }

    /** Traverses the DOM notifying when a new element is traversed. */
    private async traverseAndNotify(element) {
        /*
         * CDP returns more elements than the ones we want. For example there
         * are 2 HTML elements. One has children and has `nodeType === 1`,
         * while the other doesn't have children and `nodeType === 10`.
         * We ignore those elements.
         *
         * 10: `HTML` with no children
         */
        const ignoredNodeTypes: Array<number> = [10];

        if (ignoredNodeTypes.includes(element.nodeType)) {
            return;
        }

        const eventName: string = `element::${element.nodeName.toLowerCase()}`;

        const wrappedElement: AsyncHTMLElement = new AsyncHTMLElement(element, this._dom, this._client.DOM);

        debug(`emitting ${eventName}`);
        const event: ElementFound = {
            element: wrappedElement,
            resource: this._finalHref
        };

        await this._server.emitAsync(eventName, event);

        const elementChildren = wrappedElement.children;

        for (const child of elementChildren) {
            debug('next children');
            const traverseDown: TraverseDown = {
                element,
                resource: this._finalHref
            };

            await this._server.emitAsync(`traverse::down`, traverseDown);
            await this.traverseAndNotify(child);
        }

        const traverseUp: TraverseUp = {
            element,
            resource: this._finalHref
        };

        await this._server.emitAsync(`traverse::up`, traverseUp);
    }

    /** Wait until the browser load the first tab */
    private getClient(port, tab): Promise<object> {
        let retries: number = 0;
        const loadCDP = async () => {
            try {
                const client = await cdp({ port, tab });

                return client;
            } catch (err) {
                if (retries > 3) {
                    throw err;
                }

                await delay((retries * 250) + 500);
                retries++;

                return loadCDP();
            }
        };

        return loadCDP();
    }

    /** Initiates Chrome if needed and a new tab to start the collection. */
    private async initiateComms() {
        const launcher: BrowserInfo = await this.launcher.launch(this._options.useTabUrl ? this._options.tabUrl : 'about:blank');
        let client;

        this.pid = launcher.pid;

        /*
         * We want a new tab for this session. If it is a new browser, a new tab
         * will be created automatically. If it was already there, then we need
         * to create it ourselves.
         */
        if (launcher.isNew) {
            // Chrome Launcher return also some extensions tabs but we don't need them.
            const tabs = filter(await cdp.List({ port: launcher.port }), (tab: any) => { // eslint-disable-line new-cap
                return !tab.url.startsWith('chrome-extension');
            });

            client = await this.getClient(launcher.port, tabs[0]);
            this._tabs = tabs;
        } else {
            const tab = await cdp.New({ port: launcher.port, url: this._options.useTabUrl ? this._options.tabUrl : null }); // eslint-disable-line new-cap

            if (!tab) {
                throw new Error('Error trying to open a new tab');
            }

            this._tabs.push(tab);

            client = await cdp({
                port: launcher.port,
                tab: (tabs): number => {
                    /*
                     * We can return a tab or an index. Also `tab` !== tab[index]
                     * even if the have the same `id`.
                     */
                    for (let index = 0; index < tabs.length; index++) {
                        if (tabs[index].id === tab.id) {
                            return index;
                        }
                    }

                    return -1; // We should never reach this point...
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

    /** Enables the handles for all the relevant Networks events sent by the debugging protocol. */
    private async enableNetworkEvents() {
        debug('Binding to Network events');
        const { Network } = this._client;

        await Promise.all([
            Network.clearBrowserCache(),
            Network.setCacheDisabled({ cacheDisabled: true }),
            Network.requestWillBeSent(this.onRequestWillBeSent.bind(this)),
            Network.responseReceived(this.onResponseReceived.bind(this)),
            Network.loadingFailed(this.onLoadingFailed.bind(this))
        ]);
    }

    /** Sets the right configuration and enables all the required CDP features. */
    private async configureAndEnableCDP() {
        const { Network, Page } = this._client;

        this._client.on('error', this.onError);
        this._client.on('disconnect', this.onDisconnect);

        await this.enableNetworkEvents();

        await Promise.all([
            Network.enable(),
            Page.enable()
        ]);
    }

    /**
     * CDP sometimes doesn't download the favicon automatically, this method:
     *
     * * uses the `src` attribute of `<link rel="icon">` if present.
     * * uses `favicon.ico` and the final url after redirects.
     */
    private async getFavicon(element: AsyncHTMLElement) {
        const href = (element && element.getAttribute('href')) || '/favicon.ico';

        try {
            debug(`resource ${href} to be fetched`);
            const fullFaviconUrl = this._finalHref + href.substr(1);

            await this._server.emitAsync('fetch::start', { resource: fullFaviconUrl });

            const content = await this.fetchContent(new URL(fullFaviconUrl));

            const data: FetchEnd = {
                element: null,
                request: content.request,
                resource: content.response.url,
                response: content.response
            };

            await this._server.emitAsync('fetch::end::image', data);
        } catch (error) {
            const hops = this._redirects.calculate(href);

            const event: FetchError = {
                element,
                error,
                hops,
                resource: href
            };

            await this._server.emitAsync('fetch::error', event);
        }
    }

    /** Processes the pending responses received while the DOM wasn't ready. */
    private async processPendingResponses(): Promise<void> {
        while (this._pendingResponseReceived.length) {
            debug(`Pending requests: ${this._pendingResponseReceived.length}`);
            await this._pendingResponseReceived.shift()();
        }
    }

    /** Handler fired when page is loaded. */
    private onLoadEventFired(callback: Function): Function {
        return async () => {
            try {
                if (this._errorWithPage) {
                    return callback(new Error('Problem loading the website'));
                }

                // Sometimes we receive the `onLoadEvent` before the response of the target. See: https://github.com/webhintio/hint/issues/1158
                await this._waitForTarget;

                await delay(this._options.waitFor);
                const { DOM } = this._client;
                const event: Event = { resource: this._finalHref };

                this._dom = new CDPAsyncHTMLDocument(DOM);
                await this._dom.load();

                await this.processPendingResponses();


                /*
                 * If the target is not an HTML we don't need to
                 * traverse it.
                 */
                if (!isHTMLDocument(this._finalHref, this.headers)) {
                    await this._server.emitAsync('scan::end', event);

                    return callback();
                }

                await this._server.emitAsync('traverse::start', event);
                await this.traverseAndNotify(this._dom.root);
                await this._server.emitAsync('traverse::end', event);
                await this._server.emitAsync('can-evaluate', event);

                if (!this._faviconLoaded) {
                    const faviconElement = (await this._dom.querySelectorAll('link[rel~="icon"]'))[0];

                    await this.getFavicon(faviconElement);
                }

                // We let time to any pending things (like error networks and so) to happen in the next second
                return setTimeout(async () => {
                    await this._server.emitAsync('scan::end', event);

                    return callback();
                }, 1000);
            } catch (err) {
                return callback(err);
            }
        };
    }

    /*
     * ------------------------------------------------------------------------------
     * Public methods
     * ------------------------------------------------------------------------------
     */

    public collect(target: URL) {
        if (!target.protocol.match(/https?:/)) {
            const err = {
                message: `Protocol "${target.protocol}" invalid for the current collector`,
                type: 'InvalidTarget'
            };

            throw err;
        }

        return promisify(async (callback) => {
            this._href = target.href.replace(target.hash, '');
            this._finalHref = target.href; // This value will be updated if we load the site
            const event: Event = { resource: target.href };
            let client;

            await this._server.emit('scan::start', event);

            try {
                client = await this.initiateComms();
            } catch (e) {
                debug('Error connecting to browser');
                debug(e);

                callback(e, null);

                return;
            }

            this._client = client;
            const { Page, Security } = client;

            /*
             * Bypassing the "Your connection is not private"
             * certificate error when using self signed certificate
             * in tests.
             *
             * https://github.com/cyrus-and/chrome-remote-interface/wiki/Bypass-certificate-errors-(%22Your-connection-is-not-private%22)
             *
             * Ignore all the certificate errors.
             */

            if (this._options.overrideInvalidCert) {
                Security.certificateError(({ eventId }) => {
                    Security.handleCertificateError({
                        action: 'continue',
                        eventId
                    });
                });

                await Security.enable();

                // Enable the override.
                await Security.setOverrideCertificateErrors({ override: true });
            }

            const loadHandler = this.onLoadEventFired(callback);

            Page.loadEventFired(loadHandler);

            try {
                await this.configureAndEnableCDP();

                await Page.navigate({ url: target.href });
            } catch (e) {
                await this._server.emitAsync('scan::end', event);

                callback(e, null);

                return;
            }
        })();
    }

    private isClosed() {
        return new Promise(async (resolve) => {
            let maxTries = 200;
            let finish = false;

            while (!finish) {
                try {
                    /*
                     * We test if the process is still running or is a leftover:
                     * https://nodejs.org/api/process.html#process_process_kill_pid_signal
                     */

                    process.kill(this.pid, 0);

                    maxTries--;

                    // Wait for 10 seconds to close the browser or continue.
                    if (maxTries === 0) {
                        finish = true;
                    } else {
                        await delay(50);
                    }
                } catch (e) {
                    debug(`Process with ${this.pid} doesn't seem to be running`);
                    finish = true;
                }
            }

            resolve();
        });
    }

    public async close() {
        debug('Closing browsers used by CDP');

        while (this._tabs.length > 0) {
            const tab = this._tabs.pop();

            try {
                await cdp.Close({ id: tab.id, port: this._client.port }); // eslint-disable-line new-cap
            } catch (e) {
                debug(`Couldn't close tab ${tab.id}`);
            }
        }

        try {

            this._client.close();

            /*
             * We need to wait until the browser is close because
             * in tests if we close the client and at the same time
             * the next test tries to open a new tab, an error is
             * * thrown.
             */
            await this.isClosed();
        } catch (e) {
            debug(`Couldn't close the client properly`);
        }
    }

    public async fetchContent(target: URL | string, customHeaders?: object): Promise<NetworkData> {
        /*
         * TODO: This should create a new tab, navigate to the
         * resource and control what is received somehow via an event.
         */
        const assigns = compact([this && this._headers, customHeaders]);
        const headers = Object.assign({}, ...assigns);
        const href: string = typeof target === 'string' ? target : target.href;
        const options = {
            headers,
            // we sync the ignore SSL error options with `request`. This is neeeded for local https tests
            rejectUnauthorized: !this._options.overrideInvalidCert,
            strictSSL: !this._options.overrideInvalidCert
        };

        const request: Requester = new Requester(options);
        const response: NetworkData = await request.get(href);

        return response;
    }

    /**
     * The `exceptionDetails` provided by the debugger protocol
     * does not contain the useful information such as name, message,
     * and stack trace of the error when it's wrapped in a promise.
     * Instead, map to a successful object that contains this information.
     * @param {string|Error} err The error to convert istanbul ignore next
     */
    private wrapRuntimeEvalErrorInBrowser(e) {
        const err = e || new Error();
        const fallbackMessage: string = typeof err === 'string' ? err : 'unknown error';

        return {
            __failedInBrowser: true,
            message: err.message || fallbackMessage,
            name: err.name || 'Error',
            stack: err.stack || (new Error()).stack
        };
    }

    /**
     * Asynchronoulsy evaluates the given JavaScript code into the browser.
     *
     * This awesomeness comes from lighthouse
     */
    public evaluate(code): Promise<any> {

        return new Promise(async (resolve, reject) => {
            // If this gets to 60s and it hasn't been resolved, reject the Promise.
            const asyncTimeout: NodeJS.Timer = setTimeout(
                (() => {
                    reject(new Error('The asynchronous expression exceeded the allotted time of 60s'));
                }), this._timeout);

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
                    /*
                     * We need to explicitly wrap the raw expression for several purposes:
                     * 1. Ensure that the expression will be a native Promise and not a polyfill/non-Promise.
                     * 2. Ensure that errors in the expression are captured by the Promise.
                     * 3. Ensure that errors captured in the Promise are converted into plain-old JS Objects
                     *    so that they can be serialized properly b/c JSON.stringify(new Error('foo')) === '{}'
                     */
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

    public querySelectorAll(selector: string): Promise<Array<AsyncHTMLElement>> {
        return this._dom.querySelectorAll(selector);
    }

    /*
     * ------------------------------------------------------------------------------
     * Getters
     * ------------------------------------------------------------------------------
     */

    public get dom(): CDPAsyncHTMLDocument {
        return this._dom;
    }

    public get headers() {
        return this._targetNetworkData.response && this._targetNetworkData.response.headers ||
            null;
    }

    public get html(): Promise<string> {
        return this._dom.pageHTML();
    }
}
