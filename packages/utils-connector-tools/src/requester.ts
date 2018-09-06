/**
 * @fileoverview Abstraction over [`request`](https://github.com/request/request)
 * that allow us to handle certain cumbersome scenarios such us:
 * - Count redirects
 * - Decode responses that are not `utf-8`
 * - Expose the original response bytes
 * - Expose the body bytes
 */

import * as url from 'url';
import { promisify } from 'util';
import * as zlib from 'zlib';

import * as async from 'async';
import * as brotli from 'iltorb';
import * as request from 'request';
import * as iconv from 'iconv-lite';
import * as parseDataURL from 'data-urls';

import { debug as d } from 'hint/dist/src/lib/utils/debug';
import getHeaderValueNormalized from 'hint/dist/src/lib/utils/network/normalized-header-value';
import toLowerCaseKeys from 'hint/dist/src/lib/utils/misc/to-lowercase-keys';

import { getContentTypeData } from 'hint/dist/src/lib/utils/content-type';
import { NetworkData } from 'hint/dist/src/lib/types'; //eslint-disable-line
import { RedirectManager } from './redirects';

const debug = d(__filename);
const decompressBrotli = promisify(brotli.decompress);
const decompressGzip = promisify(zlib.gunzip);
const inflateAsync = promisify(zlib.inflate);
const inflateRawAsync = promisify(zlib.inflateRaw);
/* istanbul ignore next */
const inflate = (buff: Buffer): Promise<Buffer> => {
    /*
     * We detect if the data conforms to RFC 1950 Section 2.2:
     * * CM (Compression Method, bits 0-3) field should be 8
     * * FCHECK (bits 0-4) should be a multiple of 31
     *
     * https://www.ietf.org/rfc/rfc1950.txt
     */
    if ((buff[0] & 0x0f) === 8 && (buff.readUInt16BE(0) % 31 === 0)) {
        return inflateAsync(buff) as any;
    }

    return inflateRawAsync(buff) as any;
};

const identity = (buff: Buffer): Promise<Buffer> => {
    return Promise.resolve(Buffer.from(buff));
};
const asyncSome = promisify(async.someSeries);

const defaults = {
    encoding: null,
    followRedirect: false,
    headers: {
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'en-US,en;q=0.8,es;q=0.6,fr;q=0.4',
        'Cache-Control': 'no-cache',
        DNT: 1,
        Pragma: 'no-cache',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36'
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
    /** Internal options for request */
    private _options: request.CoreOptions;

    /** Tries to decompress the given `Buffer` `content` using the given `decompressor` */
    private async tryToDecompress(decompressor, content): Promise<Buffer> {
        try {
            const result = await decompressor(content);

            return result;
        } catch (e) {
            /* istanbul ignore next */
            return null;
        }
    }

    /** Returns the functions to try to use in order for a given algorithm. */
    private decompressors(algorithm: string): Array<Function> {
        const priorities = {
            br: 0,
            gzip: 1,
            deflate: 2, // eslint-disable-line sort-keys
            identity: 3
        };

        const functions = [
            decompressBrotli,
            decompressGzip,
            inflate,
            identity
        ];

        // In case of an algorithm not defined by us
        const priority = typeof priorities[algorithm.trim()] === 'undefined' ?
            priorities.identity :
            priorities[algorithm];

        return functions.slice(priority);
    }

    /**
     * Tries to uncompresses a buffer with fallbacks in case `content-encoding`
     * is not accurate. E.g.:
     * `Content-Encoding` is `br` but content is actually `gzip`. It will try
     * first with Brotli, then gzip, then return a copy of the original Buffer
     *
     */
    private async decompressResponse(contentEncoding: string, rawBodyResponse: Buffer): Promise<Buffer> {
        const that = this;
        /*
         * The "Content-Encoding" header field indicates what content codings
         * have been applied to the representation, beyond those inherent in the
         * media type, and thus what decoding mechanisms have to be applied in
         * order to obtain data in the media type referenced by the Content-Type
         * header field. Content-Encoding is primarily used to allow a
         * representation.
         *
         * https://tools.ietf.org/html/rfc7231#section-3.1.2.2
         *
         * This means contentEncoding could be `gzip, br` and we will need to
         * unzip and unbrotli
         */

        const algorithms = contentEncoding ?
            contentEncoding.split(',') :
            ['']; // `contentEncoding` could be null. For our purposes '' is OK
        const decompressors = this.decompressors(algorithms.shift().trim());
        let rawBody: Buffer;

        await asyncSome(decompressors, async (decompressor) => {
            rawBody = await that.tryToDecompress(decompressor, rawBodyResponse);

            return !!rawBody;
        });

        // There's another decompression we need to do
        if (algorithms.length > 0) {
            return this.decompressResponse(algorithms.join(','), rawBody);
        }

        return rawBody;
    }

    public constructor(customOptions?: request.CoreOptions) {
        if (customOptions) {
            customOptions.followRedirect = false;
            customOptions.rejectUnauthorized = false;
            this._maxRedirects = customOptions.maxRedirects || this._maxRedirects;

            if (customOptions.headers) {
                /*
                 * We lower case everything because someone could use 'ACCEPT-Encoding' and then we will have 2 different keys.
                 * `request` probably normalizes this already but this way it's explicit and we know the user's headers will
                 * always take precedence.
                 */
                customOptions.headers = Object.assign({}, toLowerCaseKeys(defaults.headers), toLowerCaseKeys(customOptions.headers));
            }
        }

        const options: request.CoreOptions = Object.assign({}, defaults, customOptions);

        this._options = options;

        this._request = request.defaults(options);
    }

    /** Return the redirects for a given `uri`. */
    public getRedirects(uri: string): Array<string> {
        return this._redirects.calculate(uri);
    }

    private getResourceNetworkDataFromDataUri(uri: string) {
        const parsedDataURL = parseDataURL(uri);

        const networkData: NetworkData = {
            request: {
                headers: [],
                url: uri
            },
            response: {
                body: {
                    content: parsedDataURL.body,
                    rawContent: parsedDataURL.body,
                    rawResponse: () => {
                        return Promise.resolve(parsedDataURL.body);
                    }
                },
                charset: parsedDataURL.mimeType.parameters.get('charset'),
                headers: [],
                hops: [],
                mediaType: parsedDataURL.mimeType.toString(),
                statusCode: 200,
                url: uri
            }
        };

        return networkData;
    }

    /**
     * Performs a `get` to the given `uri`.
     * If `Content-Type` is of type text and the charset is one of those supported by
     * [`iconv-lite`](https://github.com/ashtuchkin/iconv-lite/wiki/Supported-Encodings)
     * it will decode the response.
     */
    public get(uri: string): Promise<NetworkData> {
        debug(`Requesting ${uri}`);

        if (uri.startsWith('data:')) {
            return Promise.resolve(this.getResourceNetworkDataFromDataUri(uri));
        }

        const requestedUrls: Set<string> = new Set();

        const getUri = (uriString: string): Promise<NetworkData> => {
            requestedUrls.add(uriString);

            return new Promise((resolve: Function, reject: Function) => {
                const byteChunks: Array<Buffer> = [];
                let rawBodyResponse: Buffer;

                this._request({ uri: uriString }, async (err, response) => {
                    if (err) {
                        debug(`Request for ${uriString} failed\n${err}`);

                        return reject({
                            error: err,
                            uri: uriString
                        });
                    }

                    // We check if we need to redirect and call ourselves again with the new target
                    if (Requester.validRedirects.includes(response.statusCode)) {
                        const newUri = url.resolve(uriString, response.headers.location);

                        if (requestedUrls.has(newUri)) {
                            return reject(`'${uriString}' could not be fetched using ${this._options.method || 'GET'} method (redirect loop detected).`);
                        }

                        this._redirects.add(newUri, uriString);

                        const currentRedirectNumber = this._redirects.calculate(newUri).length;

                        if (currentRedirectNumber > this._maxRedirects) {
                            return reject(`The number of redirects(${currentRedirectNumber}) exceeds the limit(${this._maxRedirects}).`);
                        }

                        try {
                            debug(`Redirect found for ${uriString}`);
                            const results = await getUri(newUri);

                            return resolve(results);
                        } catch (e) {
                            return reject(e);
                        }
                    }

                    const contentEncoding: string = getHeaderValueNormalized(response.headers, 'content-encoding');
                    const rawBody: Buffer = await this.decompressResponse(contentEncoding, rawBodyResponse);
                    const { charset, mediaType } = getContentTypeData(null, uri, response.headers, rawBody);
                    const hops: Array<string> = this._redirects.calculate(uriString);
                    const body: string = iconv.encodingExists(charset) ? iconv.decode(rawBody, charset) : null;

                    const networkData: NetworkData = {
                        request: {
                            headers: response.request.headers,
                            url: hops[0] || uriString
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
                            url: uriString
                        }
                    };

                    return resolve(networkData);
                })
                    /*
                     * Somehow the Buffer body from `callback(err, resp, body)` is different than the one we get
                     * if we do this method. Even though both output the same result after decompressing,
                     * the real bytes sent over the wire for the content are these ones.
                     *
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
        };

        return getUri(uri);
    }
}
