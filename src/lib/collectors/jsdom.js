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

const jsdom = require('jsdom'),
    r = require('request');

const debug = require('debug')('sonar:collector:jsdom');

// ------------------------------------------------------------------------------
// Defaults
// ------------------------------------------------------------------------------

const defaultOptions = {
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

module.exports = (server, config) => {
    const options = Object.assign({}, defaultOptions, config);
    const headers = options.headers;
    const request = headers ? r.defaults({ headers }) : r;

    return ({
        async collect(target) {
            return new Promise(async (resolve, reject) => {
                debug(`About to start fetching ${target}`);
                await server.emitAsync('url');

                const traverseAndNotify = async (element) => {
                    const eventName = `element::${element.localName}`;

                    debug(`emitting ${eventName}`);
                    // should we freeze it? what about the other siblings, children, parents? We should have an option to not allow modifications
                    // maybe we create a custom object that only exposes read only properties?
                    await server.emitAsync(eventName, target, element);
                    for (const child of element.children) {
                        debug('next children');
                        await server.emitAsync(`traversing::down`, target);
                        await traverseAndNotify(child);  // eslint-disable-line no-await-for
                    }
                    await server.emitAsync(`traversing::up`, target);

                    return Promise.resolve();
                };

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
                            debug(`${target} loaded, traversing`);

                            server.sourceHtml = window.document.children[0].outerHTML;

                            await server.emitAsync('traverse::start', target);
                            await traverseAndNotify(window.document.children[0]);
                            await server.emitAsync('traverse::end', target);
                            resolve();
                        }, options.waitFor);
                    },
                    features: {
                        FetchExternalResources: ['script', 'link', 'img'],
                        ProcessExternalResources: ['script'],
                        SkipExternalResources: false
                    },
                    headers,
                    async resourceLoader(resource, callback) {
                        const url = resource.url.href;

                        debug(`resource ${url} to be fetched`);
                        await server.emitAsync('fetch::start', url);

                        request(url, async (err, response, body) => {
                            debug(`resource ${url} fetched`);
                            if (err) {
                                await server.emitAsync('fetch::error');

                                return callback(err);
                            }

                            await server.emitAsync('fetch::end', url, body, response.headers);

                            return callback(null, body);
                        });
                    },
                    url: target
                });
            });
        },
        get request() {
            return request;
        }
    });
};
