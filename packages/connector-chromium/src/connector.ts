import compact = require('lodash/compact');
import * as puppeteer from 'puppeteer-core';

import { chromiumFinder, contentType, debug as d, dom, HTMLElement, network, HTMLDocument, HttpHeaders } from '@hint/utils';
import { normalizeHeaders, Requester } from '@hint/utils-connector-tools';
import { IConnector, Engine, FetchError, FetchEnd, NetworkData, Request } from 'hint';

const { getContentTypeData, getType } = contentType;
const { createHTMLDocument, getElementByUrl, traverse } = dom;
const { isRegularProtocol } = network;
const debug: debug.IDebugger = d(__filename);

type EventName = 'error' | 'pageerror' | 'request' | 'requestfailed' | 'response' | 'close' | 'console' | 'dialog' | 'domcontentloaded' | 'frameattached' | 'framedetached' | 'framenavigated' | 'workerdestroyed'

export default class ChromiumConnector implements IConnector {
    private _options: any; // TODO: scope this a bit more
    private _browser!: puppeteer.Browser;
    private _dom: HTMLDocument | undefined;
    private _engine: Engine;
    private _executable: string;
    /** The default headers to do any request. */
    private _headers: HttpHeaders = {};
    private _html: string | undefined;
    private _listeners: Map<EventName, Function> = new Map();
    private _originalDocument: HTMLDocument | undefined;
    private _page!: puppeteer.Page;
    private _finalHref = '';
    private _pendingRequests: Function[] = [];

    public constructor(engine: Engine, config?: object) {
        try {
            this._engine = engine;
            this._executable = chromiumFinder.getInstallationPath();

            debug(`Browser executable: ${this._executable}`);
        } catch (e) {
            debug(`No executable found`);
            throw e;
        }

        (engine as Engine<import('@hint/parser-html').HTMLEvents>).on('parse::end::html', (event) => {
            // TODO: If there's a navigation we should probably clear this before? We'll need to use `page.on('framenavigated')`
            if (!this._originalDocument) {
                this._originalDocument = event.document;
            }
        });

        this._options = Object.assign({}, config);
    }

    private async createFetchEndPayload(response: puppeteer.Response): Promise<FetchEnd> {
        const resourceUrl = response.url();
        const hops = response.request()
            .redirectChain()
            .map((request) => {
                return request.url();
            });
        const originalUrl = hops[0] || resourceUrl;

        const networkRequest: Request = {
            headers: normalizeHeaders(response.request().headers() as any) as HttpHeaders,
            url: originalUrl
        };

        const element = await this.getElementFromResponse(response);
        const [content, rawContent] = await Promise.all([
            response.text(),
            response.buffer()
        ])
            .catch(() => {
                return ['', Buffer.alloc(0)];
            });

        const body = {
            content,
            rawContent: rawContent || Buffer.alloc(0),
            rawResponse: this.getRawResponse(response)
        };

        const responseHeaders = normalizeHeaders(response.headers() as any) as HttpHeaders;
        const { charset, mediaType } = getContentTypeData(element, originalUrl, responseHeaders, body.rawContent);

        const networkResponse = {
            body,
            charset: charset!,
            headers: responseHeaders,
            hops,
            mediaType: mediaType!,
            statusCode: response.status(),
            url: response.url()
        };

        const data: FetchEnd = {
            element,
            request: networkRequest,
            resource: resourceUrl,
            response: networkResponse
        };

        return data;
    }

    /** Returns the HTMLElement that initiated a request */
    private getElementFromResponse(source: puppeteer.Response | puppeteer.Request): HTMLElement | null {
        const request = 'request' in source ?
            source.request() :
            source;

        const redirectChain = request.redirectChain();
        const requestUrl = redirectChain && redirectChain.length > 0 ?
            redirectChain[0].url() :
            source.url();

        /*
         * TODO: Check what happens with prefetch, etc.
         * `type` can be "parser", "script", "preload", and "other": https://chromedevtools.github.io/debugger-protocol-viewer/tot/Network/#type-Initiator
         */
        // The doesn't seem to be an initiator in puppeteer :/
        if (this._dom && requestUrl.startsWith('http')) {
            return getElementByUrl(this._dom, requestUrl, this._finalHref);
        }

        return null;
    }

    /**
     * Manually download the site's favicon:
     *
     * * uses the `src` attribute of `<link rel="icon">` if present.
     * * uses `favicon.ico` and the final url after redirects.
     */
    private async getFavicon(dom: HTMLDocument) {
        const element = (await dom.querySelectorAll('link[rel~="icon"]'))[0];
        const href = (element && element.getAttribute('href')) || '/favicon.ico';

        try {
            debug(`resource ${href} to be fetched`);
            const fullFaviconUrl = this._finalHref + href.substr(1);

            await this._engine.emitAsync('fetch::start', { resource: fullFaviconUrl });

            const content = await this.fetchContent(new URL(fullFaviconUrl));

            const data: FetchEnd = {
                element: null,
                request: content.request,
                resource: content.response.url,
                response: content.response
            };

            await this._engine.emitAsync('fetch::end::image', data);
        } catch (error) {
            const event: FetchError = {
                element,
                error,
                hops: [],
                resource: href
            };

            await this._engine.emitAsync('fetch::error', event);
        }
    }

    private getRawResponse(response: puppeteer.Response) {
        const connector = this; // eslint-disable-line

        return async function (this: any) {

            const that = this; // eslint-disable-line

            if (that._rawResponse) {
                return that._rawResponse;
            }

            const rawContent = await response.buffer();
            const responseHeaders = normalizeHeaders(response.headers())!;

            if (rawContent && rawContent.length.toString() === responseHeaders['content-length']) {
                // Response wasn't compressed so both buffers are the same
                return rawContent;
            }

            const requestHeaders = response.request().headers();
            const responseUrl = response.url();

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

            const validHeaders = Object.entries(requestHeaders).reduce((final, [key, value]) => {
                if (key.startsWith(':')) {
                    return final;
                }

                final[key] = value;

                return final;
            }, {} as puppeteer.Headers);

            return connector.fetchContent(responseUrl, validHeaders)
                .then((result) => {
                    const { response: { body: { rawResponse: rr } } } = result;

                    return rr();
                })
                .then((value) => {
                    that._rawResponse = value;

                    return value;
                });
        };
    }

    private async navigationEnded(response: puppeteer.Response) {
        this._html = await response.text();
        this._originalDocument = createHTMLDocument(this._html);
    }

    private onError(error: Error) {
        debug(`Error: ${error}`);
    }

    private async onRequest(request: puppeteer.Request) {
        const requestUrl = request.url();
        const event = { resource: requestUrl };

        debug(`Request started: ${requestUrl}`);

        if (request.isNavigationRequest()) {
            this._headers = normalizeHeaders(request.headers())!;

            await this._engine.emitAsync('fetch::start::target', event);
        } else {
            await this._engine.emitAsync('fetch::start', event);
        }
    }

    private async onRequestFailed(request: puppeteer.Request) {
        const response = request.response();
        const resource = request.url();

        if (response && response.status() >= 400) {
            // Probably a 404, 503, and such, will be handled via fetch::end
            return;
        }

        if (!this._dom) {
            this._pendingRequests.push(this.onRequestFailed.bind(this, request));

            return;
        }

        debug(`Request failed: ${resource}`);

        const element: HTMLElement | null = this.getElementFromResponse(request);
        const eventName = 'fetch::error';
        const hops: string[] = request.redirectChain()
            .map((redirect) => {
                return redirect.url();
            });

        const event: FetchError = {
            element,
            error: request.failure(),
            hops,
            resource
        };

        await this._engine.emitAsync(eventName, event);
    }

    private async onResponse(response: puppeteer.Response) {
        const resource = response.url();
        const isTarget = response.request().isNavigationRequest();
        const status = response.status();

        debug(`Response received: ${resource}`);


        if (status >= 300 && status < 400) {
            // It's a redirect so it will be handled later
            return;
        }

        if (isTarget) {
            await this.navigationEnded(response);
        } else if (!this._dom) {
            // DOM isn't loaded yet, need to queue up
            this._pendingRequests.push(this.onResponse.bind(this, response));

            return;
        }

        // TODO: Check if it needs to be queue'd up and continue if not

        const fetchEndPayload = await this.createFetchEndPayload(response);
        /*
         * If the target has a weird value like `application/x-httpd-php`
         * (which translates into `unknown`) or is detected as `xml`.
         * (e.g.: because it starts with
         * `<?xml version="1.0" encoding="utf-8"?>` even though it has
         * `<!DOCTYPE html>` declared after),
         * we change the suffix to `html` so hints work properly.
         */
        let suffix = getType(fetchEndPayload.response.mediaType);
        const defaults = ['unknown', 'xml'];

        if (isTarget && defaults.includes(suffix)) {
            suffix = 'html';
        }

        const eventName = `fetch::end::${suffix}` as 'fetch::end::*';

        /** Event is also emitted when status code in response is not 200. */
        await this._engine.emitAsync(eventName, fetchEndPayload);
    }

    private async launch() {
        debug(`Launching browser`);

        // Check if there's another browser running first

        try {
            // TODO: Do we need to use `userDataDir` or with the flags is not needed? It will polute history though

            // QUESTION: by default puppeteer is headless, do we care?
            this._browser = await puppeteer.launch({
                executablePath: this._executable,
                headless: false
            });
        } catch (e) {
            debug(e);

            throw e;
        }
    }

    private addListeners() {
        debug(`Adding event listeners`);

        const onError = this.onError.bind(this);
        const onRequest = this.onRequest.bind(this);
        const onRequestFailed = this.onRequestFailed.bind(this);
        const onResponse = this.onResponse.bind(this);

        this._listeners.set('error', onError);
        this._listeners.set('pageerror', onError);
        this._listeners.set('request', onRequest);
        this._listeners.set('requestfailed', onRequestFailed);
        this._listeners.set('response', onResponse);

        for (const [eventName, handler] of this._listeners) {
            this._page.on(eventName, (handler as any));
        }
    }

    private removeListeners(name?: EventName | EventName[]) {
        if (!name) {
            debug(`Removing all event listeners`);
            this.removeListeners(Array.from(this._listeners.keys()));

            return;
        }

        if (Array.isArray(name)) {
            for (const eventName of name) {
                this.removeListeners(eventName);
            }

            return;
        }

        const handler = this._listeners.get(name);

        debug(`Removing handler for event "${name}"`);
        if (handler) {
            this._page.off(name, (handler as any));
            this._listeners.delete(name);
        }
    }

    public async close() {
        this.removeListeners();
        // Do magic here around closing or not


        try {
            await this._browser.close();
        } catch (e) {
            debug(`Error closing browser`);
        }

        // this._page.disconnect();
    }

    public evaluate(code: string): Promise<any> {
        return this._page.evaluate(code);
    }

    // TODO: Add options parameter
    public async collect(target: URL): Promise<any> {
        if (!isRegularProtocol(target.href)) {
            const error = new Error(`Target protocol is not valid (is ${target.protocol})`);

            (error as any).type = 'InvalidTarget';

            throw error;
        }

        const event = { resource: target.href };

        await this.launch();
        await this._engine.emit('scan::start', event);

        debug(`Creating new page`);
        this._page = await this._browser.newPage();

        // TODO: Figure out how to execute the user tasks in here and when to subscribe to events

        this.addListeners();

        debug(`Navigating to ${target.href}`);
        await this._page.goto(target.href, { waitUntil: 'networkidle2' });
        // TODO: what happens if there are multiple redirects here?

        // This is the final URL
        this._finalHref = this._page.url();
        event.resource = this._finalHref;

        debug(`Navigation complete`);

        // Check that target is HTML, if it isn't then leave

        // Stop network events after navigation is considered complete so no more issues are reported
        const networkEvents: EventName[] = ['request', 'requestfailed', 'response'];

        // Puppeteer runs in headless mode so favicon needs to be downloaded manually

        // Need to make sure the dom is loaded

        this.removeListeners(networkEvents);

        const html = await this._page.content();
        const dom = createHTMLDocument(html, this._originalDocument);

        await this.getFavicon(dom);

        this._dom = dom;

        // Process pending requests now that the dom is ready
        while (this._pendingRequests.length > 0) {
            const pendingRequest = this._pendingRequests.shift()!;

            await pendingRequest();
        }

        await traverse(dom, this._engine, this._page.url());


        // TODO: Update with the final URL
        await this._engine.emitAsync('can-evaluate::script', event);

        // Some other timeouts or awaits here?

        await this._engine.emitAsync('scan::end', event);
    }

    public fetchContent(target: URL | string, customHeaders?: object): Promise<NetworkData> {
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
            rejectUnauthorized: this._options.ignoreHTTPSErrors,
            strictSSL: this._options.ignoreHTTPSErrors
        };

        const request: Requester = new Requester(options);

        return request.get(href);
    }

    public querySelectorAll(selector: string): HTMLElement[] {
        if (!this._dom) {
            return [];
        }

        return this._dom.querySelectorAll(selector);
    }

    /*
     * ------------------------------------------------------------------------------
     * Getters
     * ------------------------------------------------------------------------------
     */


    // TODO: Are this being used somewhere?

    public get dom(): HTMLDocument | undefined {
        return this._dom;
    }

    public get html(): string {
        if (!this._dom) {
            return '';
        }

        return this._dom.pageHTML();
    }
}
