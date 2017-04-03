/**
* @fileoverview Collector that uses the Chrome Debugging protocol to load a site and do the traversing. It also uses [request](https:/github.com/request/request) to
* download the external resources (JS, CSS, images). *
*/

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

import * as d from 'debug';
const debug = d('sonar:collector:cdp');

import * as cdp from 'chrome-remote-interface';
import * as r from 'request';
import * as pify from 'pify';

import { redirectManager } from '../helpers/redirects';
import { CDPAsyncHTMLDocument, CDPAsyncHTMLElement } from './cdp-async-html';
import { launchChrome } from './cdp-launcher';
import { Sonar } from '../../sonar'; // eslint-disable-line no-unused-vars

import { ICollector, ICollectorBuilder, IElementFoundEvent, INetworkData, URL } from '../../interfaces'; // eslint-disable-line no-unused-vars

class CDPCollector implements ICollector {
    /** The final set of options resulting of merging the users, and default ones. */
    private _options;
    /** The default headers to do any request. */
    private _headers;
    /** The original URL to collect. */
    private _href;
    /** The instance of Sonar that is using this collector. */
    private _server: Sonar;
    /** The CDP client to talk to the browser. */
    private _client;
    /** A set of requests done by the collector to retrieve initial information more easily. */
    private _requests: Map<number, object>;
    /** The parsed and original HTML. */
    private _html: string;
    private _dom: CDPAsyncHTMLDocument;
    /** A handy tool to calculate the `hop`s for a given url */
    private _redirects = redirectManager();

    constructor(server: Sonar, config: object) {
        const defaultOptions = { waitFor: 5000 };

        this._server = server;

        this._options = Object.assign({}, defaultOptions, config);
        this._headers = this._options.headers;

        //TODO: setExtraHTTPHeaders with _headers in an async way

        this._requests = new Map();
    }

    // ------------------------------------------------------------------------------
    // Private methods
    // ------------------------------------------------------------------------------

    private async getElementFromRequest(request) {
        const { initiator } = request;
        const { DOM } = this._client;

        // TODO: Check what happens with prefetch, etc.
        if (initiator.type === 'parser') {
            // const { lineNumber } = initiator;
            await DOM.querySelectorAll('[src]');

            // do a query selector to get the asset that has this url and then do some magic
        }
    }

    /** Event handler for when the browser is about to make a request */
    private async onRequestWillBeSent(params) {
        const requestUrl = params.request.url;

        this._requests.set(params.requestId, params);

        if (!this._headers) {
            // TODO: do some clean up, we probably don't want all the headers as the "defaults"
            this._headers = params.request.headers;
        }

        if (params.redirectResponse) {
            debug(`Redirect found for ${requestUrl}`);
            // We store the redirects with the finalUrl as a key to do a reverse search in onResponseReceived
            this._redirects.add(requestUrl, params.redirectResponse.url);

            return;
        }

        const eventName = this._href === requestUrl ? 'targetfetch::start' : 'fetch::start';

        debug(`About to start fetching ${requestUrl}`);
        await this._server.emitAsync(eventName, requestUrl);
    }

    /** Event handler fired when HTTP request fails for some reason. */
    private onLoadingFailed(params) {
        //TODO: implement this for `fetch::error` and `targetfetch::error`
        console.error(params);
    }

    /** Event handler fired when HTTP response is available. */
    private async onResponseReceived(params) {
        const resourceUrl = params.response.url;
        const resourceHeaders = params.response.headers;
        const resourceBody = await this._client.Network.getResponseBody({ requestId: params.requestId });
        const hops = this._redirects.calculate(resourceUrl);
        const originalUrl = hops[0] || resourceUrl;

        const eventName = this._href === originalUrl ? 'targetfetch::end' : 'fetch::end';

        debug(`Content for ${resourceUrl} downloaded`);
        const data = {
            request: {
                headers: {},
                url: originalUrl
            },
            response: {
                body: resourceBody.body,
                headers: resourceHeaders,
                hops,
                originalBytes: null,
                statusCode: 200,
                url: params.response.url
            }
        };

        await this._server.emitAsync(eventName, null, data);
    }

    /** Traverses the DOM notifying when a new element is traversed */
    private async traverseAndNotify(element) {
        const eventName = `element::${element.nodeName.toLowerCase()}`;

        const wrappedElement = new CDPAsyncHTMLElement(element, this._dom, this._client.DOM);

        debug(`emitting ${eventName}`);
        const event: IElementFoundEvent = {
            element: wrappedElement,
            resource: this._href
        };

        await this._server.emitAsync(eventName, event);
        const elementChildren = wrappedElement.children;

        for (const child of elementChildren) {
            debug('next children');
            await this._server.emitAsync(`traversing::down`, this._href);
            await this.traverseAndNotify(child);  // eslint-disable-line no-await-for

        }
        await this._server.emitAsync(`traversing::up`, this._href);
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

            await Network.setCacheDisabled({ cacheDisabled: true });
            await Network.requestWillBeSent(this.onRequestWillBeSent.bind(this));
            await Network.responseReceived(this.onResponseReceived.bind(this));
            await Network.loadingFailed(this.onLoadingFailed.bind(this));

            Page.loadEventFired(async () => {
                // TODO: Wait a few seconds here before traversing or is this event fired when everything is quiet?

                this._dom = new CDPAsyncHTMLDocument(DOM);

                await this._dom.load();

                await this._server.emitAsync('traverse::start', this._href);
                await this.traverseAndNotify(this._dom.root);
                await this._server.emitAsync('traverse::end', this._href);

                callback();
            });
            // We enable all the domains we need to receive events from the CDP
            await Promise.all([
                Network.enable(),
                Page.enable()
            ]);
            await Page.navigate({ url: this._href });
        })();
    }

    async fetchContent(target: URL | string, customHeaders?: object) {
        // TODO: This should create a new tab, navigate to the resource and control what is received somehow via an event
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
                headers: response.headers,
                hops: [], // TODO: populate
                originalBytes: null, // Add original compressed bytes here (originalBytes)
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
