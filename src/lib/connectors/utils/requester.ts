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
import { getContentTypeData } from '../../utils/content-type';
import { INetworkData } from '../../types'; //eslint-disable-line
import { RedirectManager } from './redirects';

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
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.2924.87 Safari/537.36'
    },
    jar: true,
    time: true,
    timeout: 10000
};

export class Requester {
    /** The valid status codes for redirects we follow. */
    private static validRedirects = [301, 302, 303, 307, 308]
    /** Internal `request` object. */
    private _request;
    /** Internal `redirectManager`. */
    private _redirects: RedirectManager = new RedirectManager();
    /** Maximum number of redirects */
    private _maxRedirects: number = 10;

    public constructor(customOptions?: request.CoreOptions) {
        if (customOptions) {
            customOptions.followRedirect = false;
            this._maxRedirects = customOptions.maxRedirects || this._maxRedirects;
        }
        const options: request.CoreOptions = Object.assign({}, defaults, customOptions);

        this._request = request.defaults(options);
    }

    /** Return the redirects for a given `uri`. */
    public getRedirects(uri: string): Array<string> {
        return this._redirects.calculate(uri);
    }

    /**
     * Performs a `get` to the given `uri`.
     * If `Content-Type` is of type text and the charset is one of those supported by
     * [`iconv-lite`](https://github.com/ashtuchkin/iconv-lite/wiki/Supported-Encodings)
     * it will decode the response.
     */
    public get(uri: string): Promise<INetworkData> {
        debug(`Requesting ${uri}`);

        return new Promise((resolve: Function, reject: Function) => {
            const byteChunks: Array<Buffer> = [];
            let rawBodyResponse: Buffer;

            this._request({ uri }, async (err, response, rawBody) => {
                if (err) {
                    debug(`Request for ${uri} failed\n${err}`);

                    return reject({
                        error: err,
                        uri
                    });
                }

                // We check if we need to redirect and call ourselves again with the new target
                if (Requester.validRedirects.includes(response.statusCode)) {
                    const newUri = url.resolve(uri, response.headers.location);

                    this._redirects.add(newUri, uri);

                    const currentRedirectNumber = this._redirects.calculate(newUri).length;

                    if (currentRedirectNumber > this._maxRedirects) {
                        return reject(`The number of redirects(${currentRedirectNumber}) exceeds the limit(${this._maxRedirects}).`);
                    }

                    try {
                        debug(`Redirect found for ${uri}`);
                        const results = await this.get(newUri);

                        return resolve(results);
                    } catch (e) {
                        return reject(e);
                    }
                }

                const { charset, mediaType } = getContentTypeData(null, uri, response.headers, response.body.rawContent);
                const hops: Array<string> = this._redirects.calculate(uri);
                const body: string = iconv.encodingExists(charset) ? iconv.decode(rawBody, charset) : null;

                const networkData: INetworkData = {
                    request: {
                        headers: response.request.headers,
                        url: hops[0] || uri
                    },
                    response: {
                        body: {
                            content: body,
                            rawContent: rawBody,
                            rawResponse: () => {
                                return Promise.resolve(rawBodyResponse);
                            }
                        },
                        charset,
                        headers: response.headers,
                        hops,
                        mediaType,
                        statusCode: response.statusCode,
                        url: uri
                    }
                };

                return resolve(networkData);
            })
                /*
                 * This will allow us to get the raw response's body, handy if it is compressed.
                 * See: https://github.com/request/request/tree/6f286c81586a90e6a9d97055f131fdc68e523120#examples.
                 */
                .on('response', (response) => {
                    response
                        .on('data', (data: Buffer) => {
                            byteChunks.push(data);
                        })
                        .on('end', () => {
                            rawBodyResponse = Buffer.concat(byteChunks);
                        });
                });
        });
    }
}
