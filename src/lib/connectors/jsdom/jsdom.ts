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
 *         'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36'
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
import * as util from 'util';
import { fork, ChildProcess } from 'child_process';

import * as jsdom from 'jsdom/lib/old-api';

import { debug as d } from '../../utils/debug';
import { getContentTypeData } from '../utils/content-type';
import {
    IConnector, IConnectorBuilder,
    IElementFound, IEvent, IFetchEnd, IFetchError, IManifestFetchError, IManifestFetchEnd, ITraverseDown, ITraverseUp,
    INetworkData, URL
} from '../../types';
import { JSDOMAsyncHTMLElement, JSDOMAsyncHTMLDocument } from './jsdom-async-html';
import { readFileAsync } from '../../utils/misc';
import { resolveUrl } from '../utils/resolver';
import { Requester } from '../utils/requester';
import { Sonarwhal } from '../../sonarwhal';

/*
 * ------------------------------------------------------------------------------
 * Defaults
 * ------------------------------------------------------------------------------
 */

const debug: debug.IDebugger = d(__filename);

const defaultOptions = {
    followRedirect: false,
    gzip: true,
    headers: {
        'Accept-Language': 'en-US,en;q=0.8,es;q=0.6,fr;q=0.4',
        'Cache-Control': 'no-cache',
        DNT: 1,
        Pragma: 'no-cache',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36'
    },
    jar: true,
    waitFor: 1000
};

class JSDOMConnector implements IConnector {
    private _options;
    private _headers;
    private _request: Requester;
    private _server: Sonarwhal;
    private _href: string;
    private _finalHref: string;
    private _targetNetworkData: INetworkData;
    private _manifestIsSpecified: boolean = false;
    private _window: Window;
    private _document: JSDOMAsyncHTMLDocument;
    private _fetchedHrefs: Set<string>;
    private _timeout: number;

    public constructor(server: Sonarwhal, config: object) {
        this._options = Object.assign({}, defaultOptions, config);
        this._headers = this._options.headers;
        this._request = new Requester(this._options);
        this._server = server;
        this._timeout = server.timeout;
    }

    /*
     * ------------------------------------------------------------------------------
     * Private methods
     * ------------------------------------------------------------------------------
     */

    /**
     * Loads a url that uses the `file://` protocol taking into
     * account if the host is `Windows` or `*nix`.
     */
    private async _fetchFile(target: URL): Promise<INetworkData> {
        let targetPath: string = target.path;

        /*
         * `targetPath` on `Windows` is like `/c:/path/to/file.txt`
         * `readFileAsync` will prepend `c:` so the final path will
         * be: `c:/c:/path/to/file.txt` which is not valid
         */
        if (path.sep === '\\' && targetPath.indexOf('/') === 0) {
            targetPath = targetPath.substr(1);
        }

        const body: string = await readFileAsync(targetPath);

        const connector = {
            request: {
                headers: null,
                url: targetPath
            },
            response: {
                body: {
                    content: body,
                    rawContent: null,
                    rawResponse() {
                        return Promise.resolve(null);
                    }
                },
                charset: null,
                headers: null,
                hops: [],
                mediaType: null,
                statusCode: null,
                url: targetPath
            }
        };

        return Promise.resolve(connector);
    }

    /**
     * Loads a URL (`http(s)`) combining the customHeaders with
     * the configured ones for the connector.
     */

    private _fetchUrl(target: URL, customHeaders?: object): Promise<INetworkData> {
        const uri: string = url.format(target);

        if (!customHeaders) {
            return this._request.get(uri);
        }

        const r: Requester = new Requester({ headers: customHeaders });

        return r.get(uri);
    }

    /** Traverses the DOM while sending `element::typeofelement` events. */
    private async traverseAndNotify(element: HTMLElement) {
        const eventName: string = `element::${element.nodeName.toLowerCase()}`;

        debug(`emitting ${eventName}`);
        /*
         * should we freeze it? what about the other siblings, children,
         * parents? We should have an option to not allow modifications
         * maybe we create a custom object that only exposes read only
         * properties?
         */
        const event: IElementFound = {
            element: new JSDOMAsyncHTMLElement(element),
            resource: this._finalHref
        };

        if (eventName === 'element::link' && element.getAttribute('rel') === 'manifest') {
            await this.getManifest(element);
        }

        await this._server.emitAsync(eventName, event);
        for (let i = 0; i < element.children.length; i++) {
            const child: HTMLElement = element.children[i] as HTMLElement;

            debug('next children');
            const traverseDown: ITraverseDown = { resource: this._finalHref };

            await this._server.emitAsync(`traversing::down`, traverseDown);
            await this.traverseAndNotify(child);

        }

        const traverseUp: ITraverseUp = { resource: this._finalHref };

        await this._server.emitAsync(`traversing::up`, traverseUp);

        return Promise.resolve();
    }

    // TODO: resourceLoader is async but also needs the callback because of jsdom library
    /** Alternative method to download resource for `JSDOM` so we can get the headers. */
    private async resourceLoader(resource: { element: HTMLElement, url: URL }, callback: Function) {
        let resourceUrl: string = resource.url.href;
        const element = resource.element ? new JSDOMAsyncHTMLElement(resource.element) : null;

        if (!url.parse(resourceUrl).protocol) {
            resourceUrl = url.resolve(this._finalHref, resourceUrl);
        }

        // Ignore if the resource has already been fetched.
        if (this._fetchedHrefs.has(resourceUrl)) {
            return callback(null, '');
        }

        this._fetchedHrefs.add(resourceUrl);

        debug(`resource ${resourceUrl} to be fetched`);
        await this._server.emitAsync('fetch::start', { resource: resourceUrl });

        try {
            const resourceNetworkData: INetworkData = await this.fetchContent(resourceUrl);

            debug(`resource ${resourceUrl} fetched`);

            const fetchEndEvent: IFetchEnd = {
                element,
                request: resourceNetworkData.request,
                resource: resourceNetworkData.response.url,
                response: resourceNetworkData.response
            };

            const { charset, mediaType } = getContentTypeData(element, fetchEndEvent.resource, fetchEndEvent.response);

            fetchEndEvent.response.mediaType = mediaType;
            fetchEndEvent.response.charset = charset;

            /*
             * TODO: Replace `null` with `resource` once it
             * can be converted to `JSDOMAsyncHTMLElement`.
             * Event is also emitted when status code in response is not 200.
             */
            await this._server.emitAsync('fetch::end', fetchEndEvent);

            return callback(null, resourceNetworkData.response.body.content);
        } catch (err) {
            const hops: Array<string> = this._request.getRedirects(err.uri);
            const fetchError: IFetchError = {
                element,
                error: err.error,
                hops,
                resource: err.uri || resourceUrl
            };

            await this._server.emitAsync('fetch::error', fetchError);

            return callback(fetchError);
        }
    }

    /**
     * JSDOM doesn't download the favicon automatically, this method:
     *
     * * uses the `src` attribute of `<link rel="icon">` if present.
     * * uses `favicon.ico` and the final url after redirects.
     */
    private async getFavicon(element?: HTMLElement) {
        const href = (element && element.getAttribute('href')) || '/favicon.ico';

        try {
            await util.promisify(this.resourceLoader).call(this, { element, url: url.parse(href) });
        } catch (e) {
            debug('Error loading ${href}', e);
        }
    }

    /**
     * When `element` is passed, tries to download the manifest specified by it
     * sending `manifestfetch::end` or `manifestfetch::error`.
     *
     * If no `element`, then checks if it has been download previously and if not
     * sends a `manifestfetch::missing`.
     */
    private async getManifest(element?: HTMLElement) {

        if (!element) {
            if (this._manifestIsSpecified) {
                return;
            }

            await this._server.emitAsync('manifestfetch::missing', { resource: this._href });

            return;
        }

        if (this._manifestIsSpecified) {
            /*
             * Nothing to do, we already have the manifest. Double declarations should
             * be handled at the rule level.
             */
            return;
        }

        this._manifestIsSpecified = true;

        /*
         * Check if the specified file actually exists.
         *
         * https://w3c.github.io/manifest/#obtaining
         */

        const manifestHref: string = element.getAttribute('href');
        let manifestURL: string = '';

        if (!manifestHref) {
            // Invalid href are handled at the rule level
            return;
        }

        /*
         * If `href` exists and is not an empty string, try
         * to figure out the full URL of the web app manifest.
         */

        manifestURL = resolveUrl(manifestHref, this._finalHref);

        /*
         * Try to see if the web app manifest file actually
         * exists and is accesible.
         */

        try {
            const manifestData: INetworkData = await this.fetchContent(manifestURL);

            const event: IManifestFetchEnd = {
                element: new JSDOMAsyncHTMLElement(element),
                request: manifestData.request,
                resource: manifestURL,
                response: manifestData.response
            };

            const { charset, mediaType } = getContentTypeData(event.element, event.resource, event.response);

            event.response.mediaType = mediaType;
            event.response.charset = charset;

            await this._server.emitAsync('manifestfetch::end', event);

            return;

            // Check if fetching/reading the file failed.
        } catch (e) {
            debug('Failed to fetch the web app manifest file');

            const event: IManifestFetchError = {
                error: e,
                resource: manifestURL
            };

            await this._server.emitAsync('manifestfetch::error', event);
        }
    }

    /*
     * ------------------------------------------------------------------------------
     * Public methods
     * ------------------------------------------------------------------------------
     */

    public collect(target: URL) {
        /** The target in string format */
        const href: string = this._href = target.href;

        const initialEvent: IEvent = { resource: href };

        this._fetchedHrefs = new Set();

        this._server.emit('scan::start', initialEvent);

        return new Promise(async (resolve, reject) => {

            debug(`About to start fetching ${href}`);
            await this._server.emitAsync('targetfetch::start', initialEvent);

            try {
                this._targetNetworkData = await this.fetchContent(target);
            } catch (err) {
                const hops: Array<string> = this._request.getRedirects(err.uri);
                const fetchError: IFetchError = {
                    element: null,
                    error: err.error ? err.error : err,
                    hops,
                    resource: href
                };

                await this._server.emitAsync('targetfetch::error', fetchError);
                debug(`Failed to fetch: ${href}\n${err}`);

                await this._server.emitAsync('scan::end', initialEvent);

                reject(fetchError);

                return;
            }

            // Update finalHref to point to the final URL.
            this._finalHref = this._targetNetworkData.response.url;

            debug(`HTML for ${this._finalHref} downloaded`);

            const fetchEnd: IFetchEnd = {
                element: null,
                request: this._targetNetworkData.request,
                resource: this._finalHref,
                response: this._targetNetworkData.response
            };

            const { charset, mediaType } = getContentTypeData(fetchEnd.element, fetchEnd.resource, fetchEnd.response);

            fetchEnd.response.mediaType = mediaType;
            fetchEnd.response.charset = charset;

            // Event is also emitted when status code in response is not 200.
            await this._server.emitAsync('targetfetch::end', fetchEnd);

            jsdom.env({
                done: async (err, window) => {

                    if (err) {
                        await this._server.emitAsync('scan::end', { resource: this._finalHref });

                        reject(err);

                        return;
                    }

                    this._window = window;
                    this._document = new JSDOMAsyncHTMLDocument(window.document);

                    /*
                     * Even though `done()` is called after `window.onload`
                     * (so all resoruces and scripts executed), we might want
                     * to wait a few seconds if the site is lazy loading something.
                     */
                    setTimeout(async () => {
                        const event: IEvent = { resource: this._finalHref };

                        debug(`${this._finalHref} loaded, traversing`);
                        try {
                            await this._server.emitAsync('traverse::start', event);
                            await this.traverseAndNotify(window.document.children[0]);
                            await this._server.emitAsync('traverse::end', event);

                            // We download only the first favicon found
                            await this.getFavicon(window.document.querySelector('link[rel~="icon"]'));
                            await this.getManifest();

                            /*
                             * TODO: when we reach this moment we should wait for all pending request to be done and
                             * stop processing any more.
                             */
                            await this._server.emitAsync('scan::end', event);
                        } catch (e) {
                            reject(e);
                        }
                        resolve();

                    }, this._options.waitFor);

                },
                features: {
                    FetchExternalResources: ['script', 'link', 'img'],
                    ProcessExternalResources: ['script'],
                    SkipExternalResources: false
                },
                headers: this._headers,
                html: this._targetNetworkData.response.body.content,
                resourceLoader: this.resourceLoader.bind(this),
                url: this._finalHref
            });
        });
    }

    public close() {
        try {
            this._window.close();
        } catch (e) {
            /*
             * We could have some pending network requests and this could fail.
             * Because the process is going to end so we don't care if this fails.
             * https://github.com/sonarwhal/sonarwhal/issues/203
             */
            debug(`Exception ignored while closing JSDOM connector (most likely pending network requests)`);
            debug(e);
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
    public fetchContent(target: URL | string, customHeaders?: object): Promise<INetworkData> {
        let parsedTarget: URL | string = target;

        if (typeof parsedTarget === 'string') {
            /*
             * TODO: We should be using `resource.element.ownerDocument.location`
             * to get the right protocol but it doesn't seem return the right value.
             */
            parsedTarget = parsedTarget.indexOf('//') === 0 ? `http:${parsedTarget}` : parsedTarget;
            parsedTarget = url.parse(parsedTarget);

            return this.fetchContent(parsedTarget, customHeaders);
        }

        if (parsedTarget.protocol === 'file:') {
            return this._fetchFile(parsedTarget);
        }

        return this._fetchUrl(parsedTarget, customHeaders);
    }

    private killProcess = (runner: ChildProcess) => {
        try {
            runner.kill('SIGKILL');
        } catch (err) {
            debug('Error closing evaluate process');
        }
    };

    public evaluate(source: string): Promise<any> {
        return new Promise((resolve, reject) => {
            const runner: ChildProcess = fork(path.join(__dirname, 'evaluate-runner'), [this._finalHref || this._href, this._options.waitFor], { execArgv: [] });
            let timeoutId;

            runner.on('message', (result) => {
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

            timeoutId = setTimeout(() => {
                debug(`Evaluation timed out after ${this._timeout/1000}s. Killing process and reporting an error.`);
                this.killProcess(runner);

                return reject(new Error('TIMEOUT'));
            }, this._timeout);
        });
    }

    public querySelectorAll(selector: string): Promise<Array<JSDOMAsyncHTMLElement>> {
        return this._document.querySelectorAll(selector);
    }

    /*
     * ------------------------------------------------------------------------------
     * Getters
     * ------------------------------------------------------------------------------
     */

    public get dom(): JSDOMAsyncHTMLDocument {
        return this._document;
    }

    public get headers(): object {
        return this._targetNetworkData.response.headers;
    }

    public get html(): Promise<string> {
        return this._document.pageHTML();
    }
}

const builder: IConnectorBuilder = (server: Sonarwhal, config): IConnector => {
    const connector = new JSDOMConnector(server, config);

    return connector;
};

export default builder;
