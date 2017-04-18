/**
 * @fileoverview Collector that uses the Chrome Debugging protocol to
 * load a site and do the traversing. It also uses [request](https:/github.com/request/request)
 * to download the external resources (JS, CSS, images).
*/

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

import * as cdp from 'chrome-remote-interface';
import * as pify from 'pify';
import * as r from 'request';
import * as url from 'url';

import { CDPAsyncHTMLDocument, CDPAsyncHTMLElement } from './cdp-async-html';
import { debug as d } from '../../utils/debug';
/* eslint-disable no-unused-vars */
import {
    ICollector, ICollectorBuilder,
    IElementFoundEvent, IFetchEndEvent, ITraverseUpEvent, ITraverseDownEvent,
    INetworkData, URL
} from '../../interfaces';
/* eslint-enable */
import { launchChrome } from './cdp-launcher';
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
    private _href;
    /** The final URL after redirects (if they exist) */
    private _finalHref;
    /** The instance of Sonar that is using this collector. */
    private _server: Sonar;
    /** The CDP client to talk to the browser. */
    private _client;
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
        let basename: string = parts.pop();
        let elements: Array<CDPAsyncHTMLElement> = [];

        while (parts.length >= 0) {
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
            if (elements.length === 1) {
                return elements[0];
            }

            if (parts.length > 0) {
                basename = `${parts.pop()}/${basename}`;
            }

            elements = newElements;
        }

        /* If we reach this point, we have several elements that have the same url so we return the first
            because its the one that started the request. */

        return Promise.resolve(elements[0]);
    }

    /** Returns the IAsyncHTMLElement that initiated a request */
    private async getElementFromRequest(requestId: string): Promise<CDPAsyncHTMLElement> {
        const element = this._requests.get(requestId);
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

        return Promise.resolve(null);
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
    private onLoadingFailed(params) {
        // TODO: implement this for `fetch::error` and `targetfetch::error`.
        console.error(params);
    }

    /** Event handler fired when HTTP response is available and DOM loaded. */
    private async onResponseReceived(params) {

        // DOM is not ready so we queued up the event for later
        if (!this._dom) {
            this._pendingResponseReceived.push(this.onResponseReceived.bind(this, params));

            return;
        }

        const resourceUrl = params.response.url;
        const resourceHeaders = normalizeHeaders(params.response.headers);
        let resourceBody = '';
        const hops = this._redirects.calculate(resourceUrl);
        const originalUrl = hops[0] || resourceUrl;
        const eventName = this._href === originalUrl ? 'targetfetch::end' : 'fetch::end';

        resourceBody = (await this._client.Network.getResponseBody({ requestId: params.requestId })).body;

        debug(`Content for ${resourceUrl} downloaded`);

        const data: IFetchEndEvent = {
            element: null,
            request: {
                headers: {},
                url: originalUrl
            },
            resource: resourceUrl,
            response: {
                body: resourceBody,
                headers: resourceHeaders,
                hops,
                rawBody: null,
                rawBodyResponse: null,
                statusCode: 200,
                url: params.response.url
            }
        };

        if (eventName === 'fetch::end') {
            data.element = await this.getElementFromRequest(params.requestId);
        }

        await this._server.emitAsync(eventName, data);
    }

    /** Traverses the DOM notifying when a new element is traversed. */
    private async traverseAndNotify(element) {
        const eventName = `element::${element.nodeName.toLowerCase()}`;

        const wrappedElement = new CDPAsyncHTMLElement(element, this._dom, this._client.DOM);

        debug(`emitting ${eventName}`);
        const event: IElementFoundEvent = {
            element: wrappedElement,
            resource: this._finalHref
        };

        await this._server.emitAsync(eventName, event);
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

    // ------------------------------------------------------------------------------
    // Public methods
    // ------------------------------------------------------------------------------

    collect(target: URL) {
        return pify(async (callback) => {
            await launchChrome('about:blank');

            const client = await cdp();
            const { DOM, Network, Page } = client;

            this._client = client;
            this._href = target.href;
            this._finalHref = target.href;

            await Network.setCacheDisabled({ cacheDisabled: true });
            await Network.requestWillBeSent(this.onRequestWillBeSent.bind(this));
            await Network.responseReceived(this.onResponseReceived.bind(this));
            await Network.loadingFailed(this.onLoadingFailed.bind(this));

            Page.loadEventFired(async () => {
                // TODO: Wait a few seconds here before traversing
                // or is this event fired when everything is quiet?

                this._dom = new CDPAsyncHTMLDocument(DOM);

                await this._dom.load();

                while (this._pendingResponseReceived.length) {
                    await this._pendingResponseReceived.shift()();
                }

                await this._server.emitAsync('traverse::start', { resource: this._finalHref });
                await this.traverseAndNotify(this._dom.root);
                await this._server.emitAsync('traverse::end', { resource: this._finalHref });

                callback();
            });

            // We enable all the domains we need to receive events from the CDP.
            await Promise.all([
                Network.enable(),
                Page.enable()
            ]);

            await Page.navigate({ url: this._href });
        })();
    }

    async fetchContent(target: URL | string, customHeaders?: object): Promise<INetworkData> {
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
                body,
                headers: normalizeHeaders(response.headers),
                hops: [], // TODO: populate
                rawBody: null,
                rawBodyResponse: null, // Add original compressed bytes here (originalBytes).
                statusCode: response.statusCode,
                url: href
            }
        };
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
