/**
 * @fileoverview Collector that uses JSDOM to load a site and do the traversing. It also uses [request](https:/github.com/request/request) to
 * download the external resources (JS, CSS, images). By defautl it has the following configuration:
 * {
    gzip: true,
    headers: {
        'Accept-Language': 'en-US,en;q=0.8,es;q=0.6,fr;q=0.4',
        'Cache-Control': 'no-cache',
        DNT: 1,
        Pragma: 'no-cache',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36'
    },
    jar: true,
    waitFor: 5000
}
 */

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

import * as path from 'path';
import * as url from 'url';
import * as vm from 'vm';

import * as jsdom from 'jsdom/lib/old-api';

import { debug as d } from '../../utils/debug';
/* eslint-disable no-unused-vars */
import {
    IAsyncHTMLElement, ICollector, ICollectorBuilder,
    IElementFoundEvent, IFetchEndEvent, IFetchErrorEvent, IManifestFetchErrorEvent, IManifestFetchEnd, ITraverseDownEvent, ITraverseUpEvent,
    INetworkData, URL
} from '../../types';
/* eslint-enable */
import { JSDOMAsyncHTMLElement, JSDOMAsyncHTMLDocument } from './jsdom-async-html';
import { readFileAsync } from '../../utils/misc';
import { Requester } from '../utils/requester'; //eslint-disable-line
import { Sonar } from '../../sonar'; // eslint-disable-line no-unused-vars

// ------------------------------------------------------------------------------
// Defaults
// ------------------------------------------------------------------------------

const debug = d(__filename);

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

class JSDOMCollector implements ICollector {
    private _options;
    private _headers;
    private _request: Requester;
    private _server: Sonar;
    private _href: string;
    private _finalHref: string;
    private _targetNetworkData: INetworkData;
    private _manifestIsSpecified: boolean = false;
    private _window: Window;
    private _document: JSDOMAsyncHTMLDocument;

    constructor(server: Sonar, config: object) {
        this._options = Object.assign({}, defaultOptions, config);
        this._headers = this._options.headers;
        this._request = new Requester(this._options);
        this._server = server;
    }

    // ------------------------------------------------------------------------------
    // Private methods
    // ------------------------------------------------------------------------------

    /** Loads a url that uses the `file://` protocol taking into
     *  account if the host is `Windows` or `*nix`. */
    private async _fetchFile(target: URL): Promise<INetworkData> {
        let targetPath = target.path;

        /* `targetPath` on `Windows` is like `/c:/path/to/file.txt`
           `readFileAsync` will prepend `c:` so the final path will
           be: `c:/c:/path/to/file.txt` which is not valid */
        if (path.sep === '\\' && targetPath.indexOf('/') === 0) {
            targetPath = targetPath.substr(1);
        }

        const body = await readFileAsync(targetPath);

        const collector = {
            request: {
                headers: null,
                url: targetPath
            },
            response: {
                body: {
                    content: body,
                    contentEncoding: null,
                    rawContent: null,
                    rawResponse: null
                },
                headers: null,
                hops: [],
                statusCode: null,
                url: targetPath
            }
        };

        return Promise.resolve(collector);
    }

    /** Loads a url (`http(s)`) combining the customHeaders with the configured ones for the collector. */
    private _fetchUrl(target: URL, customHeaders?: object): Promise<INetworkData> {
        const uri = url.format(target);

        if (!customHeaders) {
            return this._request.get(uri);
        }

        const r = new Requester({ headers: customHeaders });

        return r.get(uri);
    }

    /** Traverses the DOM while sending `element::typeofelement` events. */
    private async traverseAndNotify(element: HTMLElement) {
        const eventName = `element::${element.nodeName.toLowerCase()}`;

        debug(`emitting ${eventName}`);
        // should we freeze it? what about the other siblings, children, parents? We should have an option to not allow modifications
        // maybe we create a custom object that only exposes read only properties?
        const event: IElementFoundEvent = {
            element: new JSDOMAsyncHTMLElement(element),
            resource: this._finalHref
        };

        if (eventName === 'element::link' && element.getAttribute('rel') === 'manifest') {
            await this.getManifest(element);
        }

        await this._server.emitAsync(eventName, event);
        for (let i = 0; i < element.children.length; i++) {
            const child = <HTMLElement>element.children[i];

            debug('next children');
            const traverseDown: ITraverseDownEvent = { resource: this._finalHref };

            await this._server.emitAsync(`traversing::down`, traverseDown);
            await this.traverseAndNotify(child);  // eslint-disable-line no-await-for

        }

        const traverseUp: ITraverseUpEvent = { resource: this._finalHref };

        await this._server.emitAsync(`traversing::up`, traverseUp);

        return Promise.resolve();
    }

    /** Alternative method to download resource for `JSDOM` so we can get the headers. */
    private async resourceLoader(resource, callback) {
        let resourceUrl = resource.url.href;

        if (!url.parse(resourceUrl).protocol) {
            resourceUrl = url.resolve(this._finalHref, resourceUrl);
        }

        debug(`resource ${resourceUrl} to be fetched`);
        await this._server.emitAsync('fetch::start', { resource: resourceUrl });

        try {
            const resourceNetworkData = await this.fetchContent(resourceUrl);

            debug(`resource ${resourceUrl} fetched`);

            const fetchEndEvent: IFetchEndEvent = {
                element: new JSDOMAsyncHTMLElement(resource.element),
                request: resourceNetworkData.request,
                resource: resourceNetworkData.response.url,
                response: resourceNetworkData.response
            };

            // TODO: Replace `null` with `resource` once it
            // can be converted to `JSDOMAsyncHTMLElement`.
            await this._server.emitAsync('fetch::end', fetchEndEvent);

            return callback(null, resourceNetworkData.response.body.content);
        } catch (err) {
            const hops = this._request.getRedirects(err.uri);
            const fetchError: IFetchErrorEvent = {
                element: new JSDOMAsyncHTMLElement(resource.element),
                error: err.error,
                hops,
                resource: err.uri || resourceUrl
            };

            await this._server.emitAsync('fetch::error', fetchError);

            return callback(fetchError);
        }
    }

    /** When `element` is passed, tries to download the manifest specified by it
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
            // Nothing to do, we already have the manifest. Double declarations should
            // be handled at the rule level.
            return;
        }

        this._manifestIsSpecified = true;

        // Check if the specified file actually exists.
        //
        // https://w3c.github.io/manifest/#obtaining

        const manifestHref = element.getAttribute('href');
        let manifestURL = '';

        if (!manifestHref) {
            // Invalid href are handled at the rule level
            return;
        }

        // If `href` exists and is not an empty string, try
        // to figure out the full URL of the web app manifest.

        if (url.parse(manifestHref).protocol) {
            manifestURL = manifestHref;
        } else {
            manifestURL = url.resolve(this._href, manifestHref);
        }

        // Try to see if the web app manifest file actually
        // exists and is accesible.

        try {
            const manifestData = await this.fetchContent(manifestURL);

            const event: IManifestFetchEnd = {
                element: null,
                request: manifestData.request,
                resource: manifestURL,
                response: manifestData.response
            };

            await this._server.emitAsync('manifestfetch::end', event);

            return;

            // Check if fetching/reading the file failed.
        } catch (e) {
            debug('Failed to fetch the web app manifest file');

            const event: IManifestFetchErrorEvent = {
                error: e,
                resource: manifestURL
            };

            await this._server.emitAsync('manifestfetch::error', event);
        }
    }

    // ------------------------------------------------------------------------------
    // Public methods
    // ------------------------------------------------------------------------------

    public collect(target: URL) {
        /** The target in string format */
        const href = this._href = target.href;

        const initialEvent = { resource: href };

        this._server.emit('scan::start', initialEvent);

        return new Promise(async (resolve, reject) => {

            debug(`About to start fetching ${href}`);
            await this._server.emitAsync('targetfetch::start', initialEvent);

            try {
                this._targetNetworkData = await this.fetchContent(target);
            } catch (err) {
                const hops = this._request.getRedirects(err.uri);
                const fetchError: IFetchErrorEvent = {
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

            const fetchEnd: IFetchEndEvent = {
                element: null,
                request: this._targetNetworkData.request,
                resource: this._finalHref,
                response: this._targetNetworkData.response
            };

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

                    /* Even though `done()` is called after window.onload (so all resoruces and scripts executed),
                       we might want to wait a few seconds if the site is lazy loading something. */
                    setTimeout(async () => {
                        const event = { resource: this._finalHref };

                        debug(`${this._finalHref} loaded, traversing`);
                        try {
                            await this._server.emitAsync('traverse::start', event);
                            await this.traverseAndNotify(window.document.children[0]);
                            await this._server.emitAsync('traverse::end', event);

                            await this.getManifest();

                            /* TODO: when we reach this moment we should wait for all pending request to be done and
                               stop processing any more. */
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
        this._window.close();

        return Promise.resolve();
    }

    /** Fetches a resource. It could be a file:// or http(s):// one.
     *
     * If target is:
     * * a URL and doesn't have a valid protocol it will fail.
     * * a string, if it starts with // it will treat it as a url, and as a file otherwise.
     */
    public fetchContent(target: URL | string, customHeaders?: object): Promise<INetworkData> {
        let parsedTarget = target;

        if (typeof parsedTarget === 'string') {
            /* TODO: We should be using `resource.element.ownerDocument.location` to get the right protocol
            but it doesn't seem return the right value */
            parsedTarget = parsedTarget.indexOf('//') === 0 ? `http:${parsedTarget}` : parsedTarget;
            parsedTarget = url.parse(parsedTarget);

            return this.fetchContent(parsedTarget, customHeaders);
        }

        if (parsedTarget.protocol === 'file:') {
            return this._fetchFile(parsedTarget);
        }

        return this._fetchUrl(parsedTarget, customHeaders);
    }

    public evaluate(source: string) {
        //TODO: Have a timeout the same way CDP does
        const script = new vm.Script(source);
        const result = jsdom.evalVMScript(this._window, script);

        if (result[Symbol.toStringTag] === 'Promise') {
            return result;
        }

        return Promise.resolve(result);
    }

    public querySelectorAll(selector: string): Promise<JSDOMAsyncHTMLElement[]> {
        return this._document.querySelectorAll(selector);
    }

    // ------------------------------------------------------------------------------
    // Getters
    // ------------------------------------------------------------------------------

    get headers(): object {
        return this._targetNetworkData.response.headers;
    }
    get html(): string {
        return this._targetNetworkData.response.body.content;
    }
}

const builder: ICollectorBuilder = (server: Sonar, config): ICollector => {
    const collector = new JSDOMCollector(server, config);

    return collector;
};

export default builder;
