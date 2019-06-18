/**
 * @fileoverview Connector that uses JSDOM to load a site and do the
 * traversing. It also uses request (https:/github.com/request/request)
 * to * download the external resources (JS, CSS, images).
 *
 * By defautl it has the following configuration:
 *
 * {
 *     gzip: true,
 *     headers: {
 *         'Accept-Language': 'en-US,en;q=0.8,es;q=0.6,fr;q=0.4',
 *         'Cache-Control': 'no-cache',
 *         DNT: 1,
 *         Pragma: 'no-cache',
 *         'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36'
 *     },
 *     jar: true,
 *     waitFor: 5000
 * }
 */

/*
 * ------------------------------------------------------------------------------
 * Requirements
 * ------------------------------------------------------------------------------
 */
import * as path from 'path';
import * as url from 'url';
import { URL } from 'url'; // this is necessary to avoid TypeScript mixes types.
import { fork, ChildProcess } from 'child_process';

import { JSDOM, ResourceLoader, VirtualConsole } from 'jsdom';

import { contentType, debug as d, dom, HTMLElement, HTMLDocument, HttpHeaders, network } from '@hint/utils';
import { Engine, Event, FetchEnd, FetchError, IConnector, NetworkData } from 'hint';
import { Requester } from '@hint/utils-connector-tools';

import CustomResourceLoader from './resource-loader';
import { beforeParse } from './before-parse';

/*
 * ------------------------------------------------------------------------------
 * Defaults
 * ------------------------------------------------------------------------------
 */

const { createHTMLDocument, traverse } = dom;
const { getContentTypeData, getType } = contentType;
const { isHTMLDocument } = network;
const debug: debug.IDebugger = d(__filename);

const defaultOptions = {
    ignoreHTTPSErrors: false,
    waitFor: 5000
};

export default class JSDOMConnector implements IConnector {
    private _options: any;
    private _href: string = '';
    private _targetNetworkData!: NetworkData;
    private _window!: Window;
    private _document!: HTMLDocument;
    private _originalDocument: HTMLDocument | undefined;
    private _timeout: number;
    private _resourceLoader?: ResourceLoader;
    private _subprocesses: Set<ChildProcess>;

    public static schema = {
        additionalProperties: false,
        properties: {
            ignoreHTTPSErrors: { type: 'boolean' },
            requestOptions: { type: 'object' },
            waitFor: {
                minimum: 0,
                type: 'number'
            }
        }
    };

    public request: Requester;
    public server: Engine;
    public finalHref!: string;
    public fetchedHrefs!: Set<string>;

    public constructor(server: Engine, config?: any) {
        this._options = Object.assign({}, defaultOptions, config);

        const requesterOptions = Object.assign(
            {},
            {
                rejectUnauthorized: !this._options.ignoreHTTPSErrors,
                strictSSL: !this._options.ignoreHTTPSErrors
            },
            this._options.requestOptions || {}
        );

        this.request = new Requester(requesterOptions);
        this.server = server;
        this._timeout = server.timeout;
        this._subprocesses = new Set();

        (server as Engine<import('@hint/parser-html').HTMLEvents>).on('parse::end::html', (event) => {
            /* istanbul ignore if */
            if (!this._originalDocument) {
                this._originalDocument = event.document;
            }
        });
    }

    /*
     * ------------------------------------------------------------------------------
     * Private methods
     * ------------------------------------------------------------------------------
     */

    /**
     * Loads a URL (`http(s)`) combining the customHeaders with
     * the configured ones for the connector.
     */

    private _fetchUrl(target: URL, customHeaders?: object): Promise<NetworkData> {
        const uri: string = url.format(target);

        /* istanbul ignore else */
        if (!customHeaders) {
            return this.request.get(uri);
        }

        const r: Requester = new Requester({
            headers: customHeaders,
            rejectUnauthorized: !this._options.ignoreHTTPSErrors,
            strictSSL: !this._options.ignoreHTTPSErrors
        });

        return r.get(uri);
    }

    /**
     * JSDOM doesn't download the favicon automatically, this method:
     *
     * * uses the `src` attribute of `<link rel="icon">` if present.
     * * uses `favicon.ico` and the final url after redirects.
     */
    private async getFavicon(element?: Element | null) {
        const href = (element && element.getAttribute('href')) || '/favicon.ico';

        try {
            await this._resourceLoader!.fetch(new URL(href, this.finalHref).href, { element });
        } catch (e) {
            /* istanbul ignore next */
            debug('Error loading ${href}', e);
        }
    }

    /*
     * ------------------------------------------------------------------------------
     * Public methods
     * ------------------------------------------------------------------------------
     */

    public collect(target: URL) {
        /* istanbul ignore if */
        if (!target.protocol.match(/https?:/)) {
            const err = {
                message: `Protocol "${target.protocol}" is invalid for the current collector`,
                type: 'InvalidTarget'
            };

            throw err;
        }

        /** The target in string format */
        const href: string = this._href = target.href;

        const initialEvent: Event = { resource: href };

        this.fetchedHrefs = new Set();

        this.server.emit('scan::start', initialEvent);

        return new Promise(async (resolve, reject) => {

            debug(`About to start fetching ${href}`);
            await this.server.emitAsync('fetch::start::target', initialEvent);

            try {
                this._targetNetworkData = await this.fetchContent(target);
            } catch (err) /* istanbul ignore next */ {
                const hops: string[] = this.request.getRedirects(err.uri);
                const fetchError: FetchError = {
                    element: null as any,
                    error: err.error ? err.error : err,
                    hops,
                    resource: href
                };

                await this.server.emitAsync('fetch::error', fetchError);
                debug(`Failed to fetch: ${href}\n${err}`);

                await this.server.emitAsync('scan::end', initialEvent);

                reject(fetchError);

                return;
            }

            // Update finalHref to point to the final URL.
            this.finalHref = this._targetNetworkData.response.url;

            debug(`HTML for ${this.finalHref} downloaded`);

            const fetchEnd: FetchEnd = {
                element: null,
                request: this._targetNetworkData.request,
                resource: this.finalHref,
                response: this._targetNetworkData.response
            };

            const { charset, mediaType } = getContentTypeData(fetchEnd.element, fetchEnd.resource, fetchEnd.response.headers, fetchEnd.response.body.rawContent);

            fetchEnd.response.mediaType = mediaType!;
            fetchEnd.response.charset = charset!;

            // Event is also emitted when status code in response is not 200.
            await this.server.emitAsync(`fetch::end::${getType(mediaType!)}` as 'fetch::end::*', fetchEnd);

            /*
             * If the target is not an HTML we don't need to
             * traverse it.
             */
            /* istanbul ignore if */
            if (!isHTMLDocument(this.finalHref, this.headers)) {
                await this.server.emitAsync('scan::end', { resource: this.finalHref });

                resolve();

                return;
            }

            const virtualConsole = new VirtualConsole();

            virtualConsole.on('error', (err: Error) => {
                debug(`Console: ${err}`);
            });

            virtualConsole.on('jsdomError', (err) => {
                debug(`Console: ${err}`);
            });

            const initialDocument = createHTMLDocument(fetchEnd.response.body.content, this.finalHref);

            this._resourceLoader = new CustomResourceLoader(this, initialDocument);

            const jsdom = new JSDOM(this._targetNetworkData.response.body.content, {
                beforeParse: beforeParse(this.finalHref),
                // includeNodeLocations: true, // TODO: re-enable once locations can be copied from snapshot.
                pretendToBeVisual: true,
                resources: this._resourceLoader,
                runScripts: 'dangerously',
                url: this.finalHref,
                virtualConsole
            });
            const window = jsdom.window;

            this._window = window;

            const onLoad = () => {
                /*
                 * Even though `onLoad()` is called on `window.onload`
                 * (so all resoruces and scripts executed), we might want
                 * to wait a few seconds if the site is lazy loading something.
                 */
                setTimeout(async () => {
                    const event: Event = { resource: this.finalHref };

                    debug(`${this.finalHref} loaded, traversing`);
                    try {
                        // TODO: Use a DOM snapshot and copy node locations insead of serializing.
                        const html = this._window.document.documentElement.outerHTML;

                        const htmlDocument = createHTMLDocument(html, this.finalHref, this._originalDocument);

                        this._document = htmlDocument;

                        const evaluateEvent: Event = { resource: this.finalHref };

                        await this.server.emitAsync('can-evaluate::script', evaluateEvent);

                        await traverse(htmlDocument, this.server, this.finalHref);

                        // We download only the first favicon found
                        await this.getFavicon(window.document.querySelector('link[rel~="icon"]'));

                        /*
                         * TODO: when we reach this moment we should wait for all pending request to be done and
                         * stop processing any more.
                         */
                        await this.server.emitAsync('scan::end', event);
                    } catch (e) /* istanbul ignore next */ {
                        reject(e);
                    }
                    resolve();

                }, this._options.waitFor);
            };

            const onError = (error: ErrorEvent) => {
                debug(`onError: ${error}`);
            };

            jsdom.window.addEventListener('load', onLoad, { once: true });
            jsdom.window.addEventListener('error', onError);
        });
    }

    public close() {
        try {
            this._window.close();
        } catch (e) {
            /*
             * We could have some pending network requests and this could fail.
             * Because the process is going to end so we don't care if this fails.
             * https://github.com/webhintio/hint/issues/203
             */
            debug(`Exception ignored while closing JSDOM connector (most likely pending network requests)`);
            debug(e);
        } finally {
            // Kill any subprocess that are still alive.
            this.killAllSubprocesses();
        }

        return Promise.resolve();
    }

    /**
     * Fetches a resource. It could be a file:// or http(s):// one.
     *
     * If target is:
     * * a URL and doesn't have a valid protocol it will fail.
     * * a string, if it starts with // it will treat it as a url, and as a file otherwise.
     */
    public fetchContent(target: URL | string, customHeaders?: object): Promise<NetworkData> {
        let parsedTarget: URL | string = target;

        if (typeof parsedTarget === 'string') {
            /*
             * TODO: We should be using `resource.element.ownerDocument.location`
             * to get the right protocol but it doesn't seem return the right value.
             */
            /* istanbul ignore next */
            parsedTarget = parsedTarget.indexOf('//') === 0 ? `http:${parsedTarget}` : parsedTarget;
            parsedTarget = new URL(parsedTarget);

            return this.fetchContent(parsedTarget, customHeaders);
        }

        return this._fetchUrl(parsedTarget, customHeaders);
    }

    private killProcess(runner: ChildProcess) {
        try {
            runner.kill('SIGKILL');
        } catch (err) {
            /* istanbul ignore next */
            debug('Error closing evaluate process');
        } finally {
            this._subprocesses.delete(runner);
        }
    }

    private killAllSubprocesses() {
        this._subprocesses.forEach((subprocess) => {
            this.killProcess(subprocess);
        });
    }

    public evaluate(source: string): Promise<any> {
        return new Promise((resolve, reject) => {
            /* istanbul ignore next */
            const runner: ChildProcess = fork(path.join(__dirname, 'evaluate-runner'), [this.finalHref || this._href, this._options.waitFor], { execArgv: [] });
            let timeoutId: NodeJS.Timer | null = null;

            this._subprocesses.add(runner);

            runner.on('message', (result) => {
                /* istanbul ignore if */
                if (timeoutId) {
                    clearTimeout(timeoutId);
                    timeoutId = null;
                }

                this.killProcess(runner);

                if (result.error) {
                    return reject(result.error);
                }

                return resolve(result.evaluate);
            });

            runner.send({ source });

            /* istanbul ignore next */
            timeoutId = setTimeout(() => {
                debug(`Evaluation timed out after ${this._timeout / 1000}s. Killing process and reporting an error.`);
                this.killProcess(runner);

                return reject(new Error(`Script evaluation exceeded the allotted time of ${this._timeout / 1000}s.`));
            }, this._timeout);
        });
    }

    /* istanbul ignore next */
    public querySelectorAll(selector: string): HTMLElement[] {
        return this._document.querySelectorAll(selector);
    }

    /*
     * ------------------------------------------------------------------------------
     * Getters
     * ------------------------------------------------------------------------------
     */

    /* istanbul ignore next */
    public get dom(): HTMLDocument {
        return this._document;
    }

    public get headers(): HttpHeaders {
        return this._targetNetworkData.response.headers;
    }

    /* istanbul ignore next */
    public get html(): string {
        return this._document.pageHTML();
    }
}
