import { URL } from 'url';

import * as isCI from 'is-ci';
import compact = require('lodash/compact');
import * as puppeteer from 'puppeteer-core';

import { Browser, getInstallationPath, debug as d, dom, HTMLElement, network, HTMLDocument, HttpHeaders } from '@hint/utils';
import { normalizeHeaders, Requester } from '@hint/utils-connector-tools';
import { IConnector, Engine, NetworkData } from 'hint';
import { launch, close, LifecycleLaunchOptions } from './lib/lifecycle';

import { getFavicon } from './lib/get-favicon';
import { onRequestHandler, onRequestFailedHandler, onResponseHandler } from './lib/events';

const { createHTMLDocument, traverse } = dom;
const { isRegularProtocol } = network;
const debug: debug.IDebugger = d(__filename);

type EventName = keyof puppeteer.PageEventObj;

type AuthConfig = {
    user: {
        selector: string;
        value: string;
    };
    next?: {
        selector: string;
    };
    password: {
        selector: string;
        value: string;
    };
    submit: {
        selector: string;
    };
};

type HTTPAuthConfig = {
    user: string;
    password: string;
}

// TODO: keep in sync with the schema and take a look at #1594 and #1628
type ConnectorOptions = {
    auth?: AuthConfig | HTTPAuthConfig;
    browser?: Browser;
    detached?: boolean;
    headless?: boolean;
    ignoreHTTPSErrors?: boolean;
    puppeteerOptions?: puppeteer.ConnectOptions;
    waitUntil?: puppeteer.LoadEvent;
};

export default class PuppeteerConnector implements IConnector {
    private _auth: AuthConfig | HTTPAuthConfig | null;
    private _browser!: puppeteer.Browser;
    private _dom: HTMLDocument | undefined;
    private _engine: Engine;
    private _finalHref = '';
    private _headers: HttpHeaders = {};
    private _listeners: Map<EventName, Function> = new Map();
    private _originalDocument: HTMLDocument | undefined;
    private _page!: puppeteer.Page;
    private _options: LifecycleLaunchOptions;
    private _pendingRequests: Function[] = [];
    private _targetBody: string | undefined;
    private _targetReady!: CallableFunction;
    private _targetFailed!: CallableFunction;
    private _targetNetworkData!: NetworkData;
    private _waitUntil: puppeteer.LoadEvent;

    public static schema = {
        additionalProperties: false,
        definitions: {
            authConfig: {
                additionalProperties: false,
                properties: {
                    next: { $ref: '#/definitions/submitInput' },
                    password: { $ref: '#/definitions/fieldInput' },
                    submit: { $ref: '#/definitions/submitInput' },
                    user: { $ref: '#/definitions/fieldInput' }
                },
                required: ['user', 'password', 'submit'],
                type: 'object'
            },
            fieldInput: {
                properties: {
                    selector: { types: 'string' },
                    value: { types: 'string' }
                },
                required: ['selector', 'value'],
                type: 'object'
            },
            httpAuthConfig: {
                additionalProperties: false,
                properties: {
                    password: { types: 'string' },
                    user: { types: 'string' }
                },
                required: ['user', 'password'],
                type: 'object'
            },
            submitInput: {
                properties: { selector: { types: 'string' } },
                required: ['selector'],
                type: 'object'
            }
        },
        properties: {
            auth: { oneOf: [{ $ref: '#/definitions/authConfig' }, { $ref: '#/definitions/httpAuthConfig' }] },
            browser: {
                enum: ['Chrome', 'Chromium', 'Edge'],
                type: 'string'
            },
            detached: { type: 'boolean' },
            headless: { type: 'boolean' },
            ignoreHTTPSErrors: { type: 'boolean' },
            puppeteerOptions: { type: 'object' },
            waitUntil: {
                enum: ['load', 'domcontentloaded', 'networkidle0', 'networkidle2'],
                type: 'string'
            }
        }
    };

    public constructor(engine: Engine, options: ConnectorOptions = {}) {
        this._engine = engine;

        (engine as Engine<import('@hint/parser-html').HTMLEvents>).on('parse::end::html', (event) => {
            // TODO: If there's a navigation we should probably clear this before? We'll need to use `page.on('framenavigated')`
            if (!this._originalDocument) {
                this._originalDocument = event.document;
            }
        });

        this._waitUntil = options && options.waitUntil ? options.waitUntil : 'networkidle2';
        this._options = this.toPuppeteerOptions(options);
        this._auth = options && options.auth ? options.auth : null;
    }

    /** Transform general options to more specific `puppeteer` ones if applicable. */
    private toPuppeteerOptions(options: ConnectorOptions = {}): LifecycleLaunchOptions {
        const headless = 'headless' in options ? options.headless : isCI;

        const executablePath = 'browser' in options ?
            getInstallationPath({ browser: options.browser }) :
            getInstallationPath();

        const handleSIGs = 'detached' in options ? {
            handleSIGHUP: !options.detached,
            handleSIGINT: !options.detached,
            handleSIGTERM: !options.detached
        } : {};

        const ignoreHTTPSErrors = 'ignoreHTTPSErrors' in options && options.ignoreHTTPSErrors ? {
            // `ignoreHTTPSErrors` sometimes is not enough on headless: https://github.com/GoogleChrome/puppeteer/issues/2377#issuecomment-414147922
            args: ['--enable-features=NetworkService'],
            ignoreHTTPSErrors: true
        } : {};

        const topLevelOptions = {
            detached: !!options.detached,
            executablePath,
            headless,
            ...handleSIGs,
            ...ignoreHTTPSErrors
        };

        const finalOptions = { ...topLevelOptions, ...options.puppeteerOptions };

        debug(`Puppeteer configuration: %O`, finalOptions);

        return finalOptions;
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

        const event = onRequestFailedHandler(request, this._dom);

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

        const event = (await onResponseHandler(response, this.fetchContent.bind(this), this._dom));

        if (!event) {
            this._pendingRequests.push(this.onResponse.bind(this, response));

            return;
        }

        const { name, payload } = event;

        if (isTarget) {
            this._targetBody = payload.response.body.content;
            this._targetNetworkData = payload;

            if (name === 'fetch::end::html') {
                this._originalDocument = createHTMLDocument(this._targetBody!, resource);
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
            debug(`Removing all pending event listeners (${this._listeners.size})`);
            this.removeListeners(Array.from(this._listeners.keys()));

            return;
        }

        if (Array.isArray(name)) {
            debug(`Removing event listeners for ${name}`);
            for (const eventName of name) {
                this.removeListeners(eventName);
            }

            return;
        }

        const handler = this._listeners.get(name);

        debug(`Removing handler for event "${name}"`);
        if (handler) {
            this._page.removeListener(name, (handler as any));
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

        this._dom = createHTMLDocument(html, this._finalHref, this._originalDocument);

        // Process pending requests now that the dom is ready
        while (this._pendingRequests.length > 0) {
            const pendingRequest = this._pendingRequests.shift()!;

            await pendingRequest();
        }

        if (this._options.headless) {
            // TODO: Check if browser downloads favicon even if there's no content
            await getFavicon(this._dom, this.fetchContent.bind(this), this._engine);
        }

        if (this._targetBody) {
            await traverse(this._dom, this._engine, this._page.url());

            await this._engine.emitAsync('can-evaluate::script', event);
        }
    }

    private async authenticateForm(auth: AuthConfig) {
        const { user, password, submit, next } = auth;

        await this._page.type(user.selector, user.value);

        /**
         * Some services do the authentication in 2 steps.
         * E.g.: Azure Pipelines
         *
         * 1. Enter username/phone
         * 2. Click next
         * 3. Enter password (or 2FA)
         * 4. Submit
         *
         * For automation purposes only the password scenario
         * is covered with no redirect to other login pages.
         */
        if (next) {
            /**
             * Example on how to do it available in:
             * https://pptr.dev/#?product=Puppeteer&version=v1.16.0&show=api-pagewaitfornavigationoptions
             */
            await Promise.all([
                this._page.waitForNavigation({ waitUntil: this._waitUntil }),
                this._page.click(next.selector)
            ]);
        }

        await this._page.type(password.selector, password.value);

        await Promise.all([
            this._page.waitForNavigation({ waitUntil: this._waitUntil }),
            this._page.click(submit.selector)
        ]);
    }

    public async close() {
        this.removeListeners();

        await close(this._browser, this._page);
    }

    public evaluate(code: string): Promise<any> {
        return this._page.evaluate(code);
    }

    public async collect(target: URL): Promise<void> {
        await this.initiate(target);

        await this._engine.emit('scan::start', { resource: target.href });

        // TODO: Figure out how to execute the user tasks in here and when to subscribe to events
        this.addListeners();

        debug(`Navigating to ${target.href}`);

        if (this._auth) {
            if (typeof this._auth.user === 'string' && typeof this._auth.password === 'string') {
                await this._page.authenticate({ password: this._auth.password, username: this._auth.user });
                await this._page.goto(target.href, { waitUntil: this._waitUntil });
            } else {
                await this._page.goto(target.href, { waitUntil: this._waitUntil });
                await this.authenticateForm(this._auth as AuthConfig);
            }
        } else {
            await this._page.goto(target.href, { waitUntil: this._waitUntil });
        }

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
        const href = typeof target === 'string' ? target : target.href;
        const options = {
            headers,
            // we sync the ignore SSL error options with `request`. This is neeeded for local https tests
            rejectUnauthorized: !this._options.ignoreHTTPSErrors,
            strictSSL: !this._options.ignoreHTTPSErrors
        };

        const request = new Requester(options);

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
