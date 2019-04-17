import * as puppeteer from 'puppeteer-core';
import { contentType, HTMLDocument, HttpHeaders } from '@hint/utils';
import { normalizeHeaders } from '@hint/utils-connector-tools';
import { FetchEnd, NetworkData } from 'hint';
import { getElementFromResponse } from './get-element-from-response';

const { getContentTypeData } = contentType;

export type Fetcher = (target: string | URL, customHeaders?: object) => Promise<NetworkData>;

const getRawResponse = (response: puppeteer.Response, fetchContent: Fetcher) => {

    return async function (this: any) {

        const that = this; // eslint-disable-line

        if (that._rawResponse) {
            return that._rawResponse;
        }

        const rawContent = await response.buffer();
        const responseHeaders = normalizeHeaders(response.headers())!;

        if (rawContent && rawContent.length.toString() === responseHeaders['content-length']) {
            // Response wasn't compressed so both buffers are the same
            return rawContent;
        }

        const requestHeaders = response.request().headers();
        const responseUrl = response.url();

        /*
         * Real browser connectors automatically request using HTTP2. This spec has
         * [`Pseudo-Header Fields`](https://tools.ietf.org/html/rfc7540#section-8.1.2.3):
         * `:authority`, `:method`, `:path` and `:scheme`.
         *
         * An example of request with those `Pseudo-Header Fields` to google.com:
         *
         * ```
         * :authority:www.google.com
         * :method:GET
         * :path:/images/branding/googlelogo/2x/googlelogo_color_120x44dp.png
         * :scheme:https
         * accept:text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*\/*;q=0.8
         * accept-encoding:gzip, deflate, br
         * ...
         * ```
         *
         * The `request` module doesn't support HTTP2 yet: https://github.com/request/request/issues/2033
         * so the request need to be transformed to valid HTTP 1.1 ones, basically removing those headers.
         *
         */

        const validHeaders = Object.entries(requestHeaders).reduce((final, [key, value]) => {
            if (key.startsWith(':')) {
                return final;
            }

            final[key] = value;

            return final;
        }, {} as puppeteer.Headers);

        return fetchContent(responseUrl, validHeaders)
            .then((result) => {
                const { response: { body: { rawResponse: rr } } } = result;

                return rr();
            })
            .then((value) => {
                that._rawResponse = value;

                return value;
            });
    };
};

/** Creates a full `fetch::end` payload for the given `response`. */
export const createFetchEndPayload = async (response: puppeteer.Response, fetchContent: Fetcher, baseUrl: string, dom?: HTMLDocument): Promise<FetchEnd> => {
    const resourceUrl = response.url();
    const hops = response.request()
        .redirectChain()
        .map((request) => {
            return request.url();
        });
    const originalUrl = hops[0] || resourceUrl;

    const networkRequest = {
        headers: normalizeHeaders(response.request().headers() as any) as HttpHeaders,
        url: originalUrl
    };

    const element = await getElementFromResponse(response, baseUrl, dom);
    const [content, rawContent] = await Promise.all([
        response.text(),
        response.buffer()
    ])
        .catch((e) => {
            return ['', Buffer.alloc(0)];
        });

    const body = {
        content,
        rawContent: rawContent || Buffer.alloc(0),
        rawResponse: getRawResponse(response, fetchContent)
    };

    const responseHeaders = normalizeHeaders(response.headers() as any) as HttpHeaders;
    const { charset, mediaType } = getContentTypeData(element, originalUrl, responseHeaders, body.rawContent);

    const networkResponse = {
        body,
        charset: charset!,
        headers: responseHeaders,
        hops,
        mediaType: mediaType!,
        statusCode: response.status(),
        url: response.url()
    };

    const data = {
        element,
        request: networkRequest,
        resource: resourceUrl,
        response: networkResponse
    };

    return data;
};
