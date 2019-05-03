import * as isCI from 'is-ci';
import compact = require('lodash/compact');
import * as puppeteer from 'puppeteer-core';

import { debug as d, dom, HTMLElement, network, HTMLDocument, HttpHeaders } from '@hint/utils';
import { normalizeHeaders, Requester } from '@hint/utils-connector-tools';
import { IConnector, Engine, NetworkData } from 'hint';
import { launch, close } from './lib/lifecycle';

import { getFavicon } from './lib/get-favicon';
import { onRequestHandler, onRequestFailedHandler, onResponseHandler } from './lib/events';

const { createHTMLDocument, traverse } = dom;
const { isRegularProtocol } = network;
const debug: debug.IDebugger = d(__filename);

type EventName = keyof puppeteer.PageEventObj;

export default class ChromiumConnector implements IConnector {
    private _options: any; // TODO: scope this a bit more
    private _browser!: puppeteer.Browser;
    private _dom: HTMLDocument | undefined;
    private _engine: Engine;
    /** The default headers to do any request. */
    private _headers: HttpHeaders = {};
    private _targetBody: string | undefined;
    private _listeners: Map<EventName, Function> = new Map();
    private _originalDocument: HTMLDocument | undefined;
    private _page!: puppeteer.Page;
    private _finalHref = '';
    private _pendingRequests: Function[] = [];
    private _targetReady!: CallableFunction;
    private _targetFailed!: CallableFunction;
    private _targetNetworkData!: NetworkData;

    public constructor(engine: Engine, options?: any) {
        this._engine = engine;

        (engine as Engine<import('@hint/parser-html').HTMLEvents>).on('parse::end::html', (event) => {
            // TODO: If there's a navigation we should probably clear this before? We'll need to use `page.on('framenavigated')`
            if (!this._originalDocument) {
                this._originalDocument = event.document;
            }
        });

        const handleSIGs = {
            handleSIGHUP: !(options && options.detached),
            handleSIGINT: !(options && options.detached),
            handleSIGTERM: !(options && options.detached)
        };

        const defaults = { headless: isCI };

        this._options = Object.assign({}, defaults, handleSIGs, options);
    }

    private onError(error: Error) {
        debug(`Error: ${error}`);
    }

    private waitForTarget() {
        if (this._targetBody !== undefined) {
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            this._targetReady = resolve;
            this._targetFailed = reject;
        });
    }

    private async onRequest(request: puppeteer.Request) {
        if (request.isNavigationRequest()) {
            this._headers = normalizeHeaders(request.headers())!;
        }

        const { name, payload } = onRequestHandler(request);

        await this._engine.emitAsync(name, payload);
    }

    private async onRequestFailed(request: puppeteer.Request) {
        const response = request.response();

        if (response && response.status() >= 400) {
            // Probably a 404, 503, and such, will be handled via fetch::end
            return;
        }

        const event = onRequestFailedHandler(request, this._finalHref, this._dom);

        if (request.isNavigationRequest() && this._targetFailed) {
            this._targetFailed();
        }

        if (!event) {
            this._pendingRequests.push(this.onRequestFailed.bind(this, request));

            return;
        }

        await this._engine.emitAsync(event.name, event.payload);
    }

    private async onResponse(response: puppeteer.Response) {
        const resource = response.url();
        const isTarget = response.request().isNavigationRequest();
        const status = response.status();

        debug(`Response received: ${resource}`);

        if (status >= 300 && status < 400) {
            // Redirects are handled later
            return;
        }

        const event = (await onResponseHandler(response, this._finalHref, this.fetchContent.bind(this), this._dom))!;

        if (!event) {
            this._pendingRequests.push(this.onResponse.bind(this, response));

            return;
        }

        const { name, payload } = event;

        if (isTarget) {
            this._targetBody = payload.response.body.content;
            this._targetNetworkData = payload;

            if (name === 'fetch::end::html') {
                this._originalDocument = createHTMLDocument(this._targetBody!);
            }
        }

        await this._engine.emitAsync(name, payload);

        // The `fetch::end` of the target needs to be processed before notifying
        if (isTarget && this._targetReady) {
            this._targetReady();
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

    private async initiate(target: URL) {
        if (!isRegularProtocol(target.href)) {
            const error = new Error(`Target protocol is not valid (is ${target.protocol})`);

            (error as any).type = 'InvalidTarget';

            throw error;
        }

        const { browser, page } = await launch(this._options);

        this._browser = browser;
        this._page = page;
    }

    private async processTarget() {
        await this.waitForTarget();

        const event = { resource: this._finalHref };

        // QUESTION: Even if the content is blank we will receive a minimum HTML with this. Are we OK with the behavior?

        const html = await this._page.content();

        this._dom = createHTMLDocument(html, this._originalDocument);

        // Process pending requests now that the dom is ready
        while (this._pendingRequests.length > 0) {
            const pendingRequest = this._pendingRequests.shift()!;

            await pendingRequest();
        }

        if (this._targetBody) {
            await traverse(this._dom, this._engine, this._page.url());

            await this._engine.emitAsync('can-evaluate::script', event);
        }

        if (this._options.headless) {
            // TODO: Check if browser downloads favicon even if there's no content
            await getFavicon(this._finalHref, this._dom, this.fetchContent.bind(this), this._engine);
        }
    }

    public async close() {
        this.removeListeners();

        await close(this._browser, this._page);
    }

    public evaluate(code: string): Promise<any> {
        return this._page.evaluate(code);
    }

    public async collect(target: URL): Promise<any> {
        await this.initiate(target);

        await this._engine.emit('scan::start', { resource: target.href });

        // TODO: Figure out how to execute the user tasks in here and when to subscribe to events

        this.addListeners();

        debug(`Navigating to ${target.href}`);
        await this._page.goto(target.href, { waitUntil: 'networkidle2' });
        // TODO: what happens if there are multiple redirects here?

        // This is the final URL
        this._finalHref = this._page.url();

        debug(`Navigation complete`);

        // Stop network events after navigation is considered complete so no more issues are reported
        this.removeListeners(['request', 'requestfailed', 'response']);

        await this.processTarget();

        // Some other timeouts or awaits here?

        await this._engine.emitAsync('scan::end', { resource: this._finalHref });
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

    public get dom(): HTMLDocument | undefined {
        return this._dom;
    }

    public get html(): string {
        if (!this._dom) {
            return '';
        }

        return this._dom.pageHTML();
    }

    public get headers() {
        return this._targetNetworkData &&
            this._targetNetworkData.response &&
            normalizeHeaders(this._targetNetworkData.response.headers) ||
            undefined;
    }
}
