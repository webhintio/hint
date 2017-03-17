/**
 * @fileoverview Collector that uses JSDOM to load a site and do the traversing. It also uses [request](https:/github.com/request/request) to
 * download the external resources (JS, CSS, images). By defautl it has the following configuration:
 * {
    gzip: true,
    headers: {
        'Accept-Language': 'en-US,en;q=0.8,es;q=0.6,fr;q=0.4',
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

import * as jsdom from 'jsdom';
import * as r from 'request';
import * as pify from 'pify';

const debug = require('debug')('sonar:collector:jsdom');

import * as logger from '../util/logging';
import { readFileAsync } from '../util/misc';
import { Sonar } from '../sonar'; // eslint-disable-line no-unused-vars
import { Collector, CollectorBuilder, ElementFoundEvent, URL } from '../types'; // eslint-disable-line no-unused-vars

// ------------------------------------------------------------------------------
// Defaults
// ------------------------------------------------------------------------------

const defaultOptions = {
    followAllRedirects: true,
    gzip: true,
    headers: {
        'Accept-Language': 'en-US,en;q=0.8,es;q=0.6,fr;q=0.4',
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

    const getContent = async (target: URL) => {
        if (target.protocol === 'file:') {
            const html: string = await readFileAsync(target.path);

            return {
                headers: {},
                html
            };
        }

        const [response, body] = await pify(request, { multiArgs: true })(target.href);

        return {
            headers: response.headers,
            html: body
        };
    };

    let _html, _headers, _dom;

    return ({
        async collect(target: URL) {
            /** The target in string format */
            const href = target.href;

            return new Promise(async (resolve, reject) => {

                const traverseAndNotify = async (element) => {

                    const eventName = `element::${element.localName}`;

                    debug(`emitting ${eventName}`);
                    // should we freeze it? what about the other siblings, children, parents? We should have an option to not allow modifications
                    // maybe we create a custom object that only exposes read only properties?
                    const event: ElementFoundEvent = {
                        element,
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

                let getContentResult;

                try {
                    getContentResult = await getContent(target);
                } catch (e) {
                    await server.emitAsync('targetfetch::error', href);
                    logger.error(`Failed to fetch: ${href}`);
                    debug(e);
                    reject(e);

                    return;
                }

                const { headers: responseHeaders, html } = getContentResult;

                // making this data available to the outside world
                _headers = responseHeaders;
                _html = html;

                debug(`HTML for ${href} downloaded`);
                await server.emitAsync('targetfetch::end', href, html, responseHeaders);

                jsdom.env({
                    done: async (err, window) => {

                        if (err) {
                            reject(err);

                            return;
                        }

                        /* Even though `done()` is called aver window.onload (so all resoruces and scripts executed),
                           we might want to wait a few seconds if the site is lazy loading something.
                         */
                        setTimeout(async () => {

                            debug(`${href} loaded, traversing`);

                            _dom = window.document;

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

                        request(resourceUrl, async (err, response, body) => {

                            debug(`resource ${resourceUrl} fetched`);
                            if (err) {
                                await server.emitAsync('fetch::error');

                                return callback(err);
                            }

                            /*
                             rules should have only access to:
                              - the node that started the request (resource)
                              - the content of the url (body)
                              - headers of the response (headers)
                             all other things shouldn't be required to the rules
                             */
                            await server.emitAsync('fetch::end', resourceUrl, resource, body, response.headers);

                            return callback(null, body);
                        });
                    }
                });
            });
        },
        get dom(): HTMLElement {
            return _dom;
        },
        get headers(): object {
            return _headers;
        },
        get html(): string {
            return _html;
        },
        get request() {
            return request;
        }
    });

};

module.exports = builder;
