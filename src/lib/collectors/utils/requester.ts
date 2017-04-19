/**
 * @fileoverview Abstraction over [`request`](https://github.com/request/request)
 * that allow us to handle certain cumbersome scenarios such us:
 * - Count redirects
 * - Decode responses that are not `utf-8`
 * - Expose the original response bytes
 * - Expose the body bytes
 */

import * as url from 'url';

import * as request from 'request';
import * as iconv from 'iconv-lite';

import { debug as d } from '../../utils/debug';
import { INetworkData } from '../../types'; //eslint-disable-line
import { RedirectManager } from './redirects';
import { getCharset } from './charset';

const debug = d(__filename);

const defaults = {
    encoding: null,
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
    time: true
};

export class Requester {
    /** The valid status codes for redirects we follow. */
    private static validRedirects = [301, 302, 303, 307, 308]
    /** Internal `request` object. */
    private _request: request;
    /** Internal `redirectManager`. */
    private _redirects = new RedirectManager();

    constructor(customOptions = {}) {
        const options = Object.assign({}, defaults, customOptions);

        this._request = request.defaults(options);
    }

    /** Performs a `get` to the given `uri`.
     * If `Content-Type` is of type text and the charset is one of those supported by
     * [`iconv-lite`](https://github.com/ashtuchkin/iconv-lite/wiki/Supported-Encodings)
     * it will decode the response.
     */
    public get(uri: string): Promise<INetworkData> {
        debug(`Requesting ${uri}`);

        return new Promise((resolve, reject) => {
            const byteChunks = [];
            let rawBodyResponse: Buffer;

            this._request({ uri }, async (err, response, rawBody) => {
                if (err) {
                    debug(`Request for ${uri} failed`);
                    debug(err);

                    return reject(err);
                }

                // We check if we need to redirect and call ourselves again with the new target
                if (Requester.validRedirects.includes(response.statusCode)) {
                    const newUri = url.resolve(uri, response.headers.location);

                    this._redirects.add(newUri, uri);

                    try {
                        debug(`Redirect found for ${uri}`);
                        const results = await this.get(newUri);

                        return resolve(results);
                    } catch (e) {
                        return reject(e);
                    }
                }

                const hops = this._redirects.calculate(uri);
                const charset = getCharset(response.headers);
                const body = iconv.encodingExists(charset) ? iconv.decode(rawBody, charset) : null;

                const networkData = {
                    request: {
                        headers: response.request.headers,
                        url: hops[0] || uri
                    },
                    response: {
                        body: {
                            content: body,
                            contentEncoding: charset,
                            rawContent: rawBody,
                            rawResponse: rawBodyResponse
                        },
                        headers: response.headers,
                        hops,
                        statusCode: response.statusCode,
                        url: uri
                    }
                };

                return resolve(networkData);
            })
                /* This will allow us to get the raw response's body, handy if it is compressed.
                   See: https://github.com/request/request/tree/6f286c81586a90e6a9d97055f131fdc68e523120#examples.
                 */
                .on('response', (response) => {
                    response
                        .on('data', (data) => {
                            byteChunks.push(data);
                        })
                        .on('end', () => {
                            rawBodyResponse = Buffer.concat(byteChunks);
                        });
                });
        });
    }
}
