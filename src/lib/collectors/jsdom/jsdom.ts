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
 * @author Anton Molleda (@molant)
 *
 */

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

import * as d from 'debug';
const debug = d('sonar:collector:jsdom');

import * as url from 'url';
import * as path from 'path';

import * as jsdom from 'jsdom';
import * as r from 'request';
import * as pify from 'pify';

import * as logger from '../../util/logging';
import { readFileAsync } from '../../util/misc';
import { Sonar } from '../../sonar'; // eslint-disable-line no-unused-vars
import { JSDOMAsyncHTMLElement } from './jsdom-async-html';
import { AsyncHTMLDocument, AsyncHTMLElement, Collector, CollectorBuilder, ElementFoundEvent, NetworkData, URL } from '../../types'; // eslint-disable-line no-unused-vars
// ------------------------------------------------------------------------------
// Defaults
// ------------------------------------------------------------------------------

const defaultOptions = {
    followAllRedirects: true,
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
};


const builder: CollectorBuilder = (server: Sonar, config): Collector => {

    const options = Object.assign({}, defaultOptions, config);
    const headers = options.headers;
    const request = headers ? r.defaults({ headers }) : r;

    /** Loads a url that uses the `file://` protocol taking into
     *  account if the host is `Windows` or `*nix` */
    const _fetchFile = async (target: URL): Promise<NetworkData> => {
        let targetPath = target.path;

        /* `targetPath` on `Windows` is like `/c:/path/to/file.txt`
           `readFileAsync` will prepend `c:` so the final path will
           be: `c:/c:/path/to/file.txt` which is not valid */
        if (path.sep === '\\' && targetPath.indexOf('/') === 0) {
            targetPath = targetPath.substr(1);
        }

        const body = await readFileAsync(targetPath);

        const collector = {
            request: { headers: null },
            response: {
                body,
                headers: null,
                originalBody: null,
                statusCode: null
            }
        };

        return Promise.resolve(collector);
    };

    /** Loads a url (`http(s)`) combining the customHeaders with the configured ones for the collector */
    const _fetchUrl = async (target: URL, customHeaders?: object): Promise<NetworkData> => {
        let req;
        const href = typeof target === 'string' ? target : target.href;

        if (customHeaders) {
            const tempHeaders = Object.assign({}, headers, customHeaders);

            req = pify(request.defaults({ headers: tempHeaders }), { multiArgs: true });
        } else {
            req = pify(request, { multiArgs: true });
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
    };

    const _fetchContent = (target: URL | string, customHeaders?: object): Promise<NetworkData> => {
        let parsedTarget = target;

        if (typeof parsedTarget === 'string') {
            /* TODO: We should be using `resource.element.ownerDocument.location` to get the right protocol
            but it doesn't seem return the right value */
            parsedTarget = parsedTarget.indexOf('//') === 0 ? `http:${parsedTarget}` : parsedTarget;
            parsedTarget = url.parse(parsedTarget);

            return _fetchContent(parsedTarget, customHeaders);
        }

        if (parsedTarget.protocol === 'file:') {
            return _fetchFile(parsedTarget);
        }

        return _fetchUrl(parsedTarget, customHeaders);

    };

    let _html, _headers;

    return ({
        collect(target: URL) {
            /** The target in string format */
            const href = target.href;

            return new Promise(async (resolve, reject) => {

                const traverseAndNotify = async (element) => {

                    const eventName = `element::${element.nodeName.toLowerCase()}`;

                    debug(`emitting ${eventName}`);
                    // should we freeze it? what about the other siblings, children, parents? We should have an option to not allow modifications
                    // maybe we create a custom object that only exposes read only properties?
                    const event: ElementFoundEvent = {
                        element: new JSDOMAsyncHTMLElement(element),
                        resource: href
                    };

                    await server.emitAsync(eventName, event);
                    for (const child of element.children) {

                        debug('next children');
                        await server.emitAsync(`traversing::down`, href);
                        await traverseAndNotify(child);  // eslint-disable-line no-await-for

                    }
                    await server.emitAsync(`traversing::up`, href);

                    return Promise.resolve();
                };

                debug(`About to start fetching ${href}`);
                await server.emitAsync('targetfetch::start', href);

                let contentResult;

                try {
                    contentResult = await _fetchContent(target);
                } catch (e) {
                    await server.emitAsync('targetfetch::error', href);
                    logger.error(`Failed to fetch: ${href}`);
                    debug(e);
                    reject(e);

                    return;
                }

                const { response: { headers: responseHeaders, body: html } } = contentResult;

                // making this data available to the outside world
                _headers = responseHeaders;
                _html = html;

                debug(`HTML for ${href} downloaded`);
                await server.emitAsync('targetfetch::end', href, html, responseHeaders);

                jsdom.env({
                    done: (err, window) => {

                        if (err) {
                            reject(err);

                            return;
                        }

                        /* Even though `done()` is called aver window.onload (so all resoruces and scripts executed),
                           we might want to wait a few seconds if the site is lazy loading something.
                         */
                        setTimeout(async () => {

                            debug(`${href} loaded, traversing`);

                            await server.emitAsync('traverse::start', href);
                            await traverseAndNotify(window.document.children[0]);
                            await server.emitAsync('traverse::end', href);
                            /* TODO: when we reach this moment we should wait for all pending request to be done and
                               stop processing any more */
                            resolve();

                        }, options.waitFor);

                    },
                    features: {
                        FetchExternalResources: ['script', 'link', 'img'],
                        ProcessExternalResources: ['script'],
                        SkipExternalResources: false
                    },
                    headers,
                    html,
                    async resourceLoader(resource, callback) {
                        const resourceUrl = resource.url.href;

                        debug(`resource ${resourceUrl} to be fetched`);
                        await server.emitAsync('fetch::start', resourceUrl);

                        try {
                            const { response: { body: resourceBody, headers: resourceHeaders } } = await _fetchContent(resourceUrl);

                            debug(`resource ${resourceUrl} fetched`);

                            /*
                             Rules should have only access to:
                              - the node that started the request (resource)
                              - the content of the url (body)
                              - headers of the response (headers)
                             all other things shouldn't be required to the rules
                             */
                            await server.emitAsync('fetch::end', resourceUrl, resource, resourceBody, resourceHeaders);

                            return callback(null, resourceBody);
                        } catch (err) {
                            await server.emitAsync('fetch::error', resourceUrl, resource, err);

                            return callback(err);
                        }
                    }
                });
            });
        },
        // get dom(): HTMLElement {
        //     return _dom;
        // },

        /** Fetches a resource. It could be a file:// or http(s):// one.
         *
         * If target is:
         * * a URL and doesn't have a valid protocol it will fail.
         * * a string, if it starts with // it will treat it as a url, and as a file otherwise
         *
         * It will return an object with the body of the resource, the headers of the response and the
         * original bytes (compressed if applicable)
         */
        fetchContent(target: URL | string, customHeaders?: object) {
            let t = target;

            if (typeof target === 'string') {
                t = url.parse(target);
            }

            return _fetchContent(<URL>t, customHeaders);
        },
        get headers(): object {
            return _headers;
        },
        get html(): string {
            return _html;
        }
    });

};

export default builder;
