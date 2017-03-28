/**
* @fileoverview Collector that uses the Chrome Debugging protocol to load a site and do the traversing. It also uses [request](https:/github.com/request/request) to
* download the external resources (JS, CSS, images). *
*/

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

// import * as url from 'url';
import * as cdp from 'chrome-remote-interface';
import * as r from 'request';
import * as pify from 'pify';

const debug = require('debug')('sonar:collector:cdp');

import { CDPAsyncHTMLDocument, CDPAsyncHTMLElement } from './cdp-async-html';
import { launchChrome } from './cdp-launcher';
import { Sonar } from '../../sonar'; // eslint-disable-line no-unused-vars

import { Collector, CollectorBuilder, ElementFoundEvent, NetworkData, URL } from '../../types'; // eslint-disable-line no-unused-vars

class CDPCollector implements Collector {
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
    /** A handy object to make requests until we find how to do them with the CDP. */
    private _request: r;
    private _dom: CDPAsyncHTMLDocument;

    constructor(server: Sonar, config: object) {
        const defaultOptions = { waitFor: 5000 };

        this._server = server;

        this._options = Object.assign({}, defaultOptions, config);
        this._headers = this._options.headers;

        //TODO: setExtraHTTPHeaders with _headers in an async way

        this._request = pify(r, { multiArgs: true });

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

        debug(`About to start fetching ${requestUrl}`);
        await this._server.emitAsync('targetfetch::start', requestUrl);
    }

    /** Event handler fired when HTTP response is available. */
    private async onResponseReceived(params) {
        const resourceUrl = params.response.url;
        const resourceHeaders = params.response.headers;
        const resourceBody = await this._client.Network.getResponseBody({ requestId: params.requestId });
        const resource = null;

        debug(`About to start fetching ${resourceUrl}`);
        await this._server.emitAsync('fetch::end', resourceUrl, resource, resourceBody, resourceHeaders);
    }

    /** Traverses the DOM notifying when a new element is traversed */
    private async traverseAndNotify(element) {
        const eventName = `element::${element.nodeName.toLowerCase()}`;

        const wrappedElement = new CDPAsyncHTMLElement(element, this._dom, this._client.DOM);

        debug(`emitting ${eventName}`);
        const event: ElementFoundEvent = {
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

            await Network.requestWillBeSent(this.onRequestWillBeSent.bind(this));
            await Network.responseReceived(this.onResponseReceived.bind(this));

            Page.loadEventFired(async () => {
                // TODO: Wait a few seconds here before traversing or is this event fired when everything is quiet?

                this._dom = new CDPAsyncHTMLDocument(DOM);

                await this._dom.load();
                await this.traverseAndNotify(this._dom.root);

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

    async fetchContent(target: URL, customHeaders?: object) {
        // TODO: This should create a new tab, navigate to the resource and control what is received somehow via an event
        let req;
        const href = typeof target === 'string' ? target : target.href;

        if (customHeaders) {
            const tempHeaders = Object.assign({}, this._headers, customHeaders);

            req = pify(this._request.defaults({ tempHeaders }), { multiArgs: true });
        } else {
            req = this._request;
        }

        const [response, body] = await req(href);

        return {
            request: { headers: response.request.headers },
            response: {
                body,
                headers: response.headers,
                originalBody: null, // Add original compressed bytes here (originalBytes)
                statusCode: response.statusCode
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

const builder: CollectorBuilder = (server: Sonar, config): Collector => {
    const collector = new CDPCollector(server, config);

    return collector;
};

module.exports = builder;
