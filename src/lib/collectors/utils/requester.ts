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

    /** Charset aliases when receiving `charset` in a `content-type`. */
    private static charsetAliases: Map<string, string> = new Map([
        ['iso-8859-1', 'latin1']
    ])
    /** The content types we can decode. */
    private static decodeableContentTypes: Array<RegExp> = [
        /application\/(?:javascript|json|x-javascript|xml)/i,
        /application\/.*\+(?:json|xml)/i, // application/xhtml+xml
        /image\/svg\+xml/i,
        /text\/.*/i
    ]

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

    /** Checks if the given `contentType` is for text based on the `Requester.decodeableContentTypes` list  */
    private requiresDecoding(contentType: string): boolean {
        let requires = false;

        for (let i = 0; i < Requester.decodeableContentTypes.length && !requires; i++) {
            const ct = Requester.decodeableContentTypes[i];

            requires = ct.test(contentType);
        }

        return requires;
    }

    /** Returns the charset specified in the `content-type` header if specified. Defaults to `utf-8` if
     * `Content-Type` is of text type but `charset` is not specified.  it is a text, and `null` otherwise.
     *
     * Ex.:
     * * 'Content-Type': 'text/html; charset=iso-8859-1' --> 'iso-8859-1'
     * * 'Content-Type': 'text/html; charset=random-charset' --> 'random-charset'
     * * 'Content-Type': 'text/html' --> 'utf-8'
     * * 'Content-Type': 'image/jpeg' --> null
     *  */
    private getCharset(headers) {
        const contentType: string = headers['content-type'];

        if (!this.requiresDecoding(contentType)) {
            debug(`Content Type ${contentType} doesn't require decoding`);

            return null;
        }

        if (!contentType.includes('charset')) {
            debug('No charset defined, falling back to utf-8');

            return 'utf-8';
        }

        const charsetRegex = /.*charset=(\S+)/gi;
        const results = charsetRegex.exec(contentType);

        debug(`Charset for ${contentType} is ${results[1]}`);

        return Requester.charsetAliases.get(results[1]) || results[1];
    }

    /** Performs a `get` to the given `uri`.
     * If `Content-Type` is of type text and the charset is one of those supported by
     * [`iconv-lite`](https://github.com/ashtuchkin/iconv-lite/wiki/Supported-Encodings)
     * it will decode the response.
     */
    public get(uri: string): Promise<INetworkData> {
        return new Promise((resolve, reject) => {
            const byteChunks = [];
            let rawBodyResponse: Buffer;

            this._request({ uri }, async (err, response, rawBody) => {
                if (err) {
                    return reject(err);
                }

                // We check if we need to redirect and call ourselves again with the new target
                if (Requester.validRedirects.includes(response.statusCode)) {
                    const newUri = url.resolve(uri, response.headers.location);

                    this._redirects.add(newUri, uri);

                    try {
                        const results = await this.get(newUri);

                        return resolve(results);
                    } catch (e) {
                        return reject(e);
                    }
                }

                const hops = this._redirects.calculate(uri);
                const charset = this.getCharset(response.headers);
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
