import { atob } from 'abab';
import { Crdp } from 'chrome-remote-debug-protocol';

import { getContentTypeData } from 'hint/dist/src/lib/utils/content-type';
import { HttpHeaders, Response, HTMLElement } from 'hint/dist/src/lib/types';
import { debug as d } from 'hint/dist/src/lib/utils/debug';
import { Requester } from '@hint/utils-connector-tools/dist/src/requester';
import { normalizeHeaders } from '@hint/utils-connector-tools/dist/src/normalize-headers';

const debug: debug.IDebugger = d(__filename);

export enum RequestStatus {
    willBeSent = 'willBeSent',
    responseReceived = 'responseReceived',
    loadingFinished = 'loadingFinished',
    loadingFailed = 'loadingFailed'
}

export class RequestResponse {
    private _overrideInvalidCert: boolean;

    /** The debugging protocol Network Client used to download the response body. */
    private _network: Crdp.NetworkClient;

    private _requestId: string;
    /** The associated `requestId` for this network request. */
    public get requestId() {
        return this._requestId;
    }

    private _status: RequestStatus;
    /** The current status of the request. */
    public get status() {
        return this._status;
    }

    private _hops: string[] = [];
    /** The redirects done to get to the final resource. */
    public get hops() {
        return this._hops;
    }

    private _originalUrl: string;
    /** The initial URL that started the request process before any redirects. */
    public get originalUrl() {
        return this._originalUrl;
    }

    /** The final URL after redirects. Could be the same as `originalUrl`. */
    public get finalUrl(): string {
        // `willBeSent` gets updated with each redirect so this is the final requested URL
        return this.willBeSent.request.url;
    }

    private _willBeSent: Crdp.Network.RequestWillBeSentEvent;
    /** The payload returned by the debugging protocol in the `RequestWillBeSent` event. */
    public get willBeSent() {
        return this._willBeSent;
    }

    private _responseReceived: Crdp.Network.ResponseReceivedEvent | undefined;
    /** The payload returned by the debugging protocol in the `ResponseReceived` event. */
    public get responseReceived() {
        return this._responseReceived;
    }

    private _loadingFinished: Crdp.Network.LoadingFinishedEvent | undefined;
    /** The payload returned by the debugging protocol in the `LoadingFinished` event. */
    public get loadingFinished() {
        return this._loadingFinished;
    }

    private _loadingFailed: Crdp.Network.LoadingFailedEvent | undefined;
    /** The payload returned by the debugging protocol in the `LoadingFailed` event. */
    public get loadingFailed() {
        return this._loadingFailed;
    }

    private _responseBody: Crdp.Network.GetResponseBodyResponse | undefined;
    /** The payload returned by calling `getResponseBody` for the request. */
    public get responseBody() {
        return this._responseBody;
    }

    private fetchContent(href: string, headers: HttpHeaders) {
        const options = {
            headers,
            // we sync the ignore SSL error options with `request`. This is neeeded for local https tests
            rejectUnauthorized: !this._overrideInvalidCert,
            strictSSL: !this._overrideInvalidCert
        };

        const request: Requester = new Requester(options);

        return request.get(href);
    }

    private _rawResponse: Buffer | undefined;
    private getRawResponse(): Promise<Buffer> {
        const that = this;

        if (this._rawResponse) {
            return Promise.resolve(this._rawResponse);
        }

        const { rawContent } = this._response!.body;

        if (rawContent && rawContent.length.toString() === this._responseReceived!.response.headers['Content-Length']) {
            // Response wasn't compressed so both buffers are the same
            return Promise.resolve(rawContent);
        }

        const { url: responseUrl, requestHeaders: headers } = this._responseReceived!.response;

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

        const validHeaders = Object.entries(headers || {}).reduce((final, [key, value]) => {
            if (key.startsWith(':')) {
                return final;
            }

            final[key] = value;

            return final;
        }, {} as Crdp.Network.Headers);

        return this.fetchContent(responseUrl, validHeaders)
            .then((result) => {
                const { response: { body: { rawResponse: rr } } } = result;

                return rr();
            })
            .then((value) => {
                that._rawResponse = value;

                return value;
            });
    }

    private _response: Response | undefined;
    /** The `Response` associated to this request to be sent on the `fetch::end` event. */
    public getResponse(element: HTMLElement | null): Response {
        if (!this._response) {

            const { headers, status } = this.responseReceived!.response;
            const normalizedHeaders = normalizeHeaders(headers);
            const that = this;

            let rawContent = Buffer.alloc(0);
            let rBody = {
                content: '',
                rawContent,
                rawResponse: () => {
                    return Promise.resolve(Buffer.alloc(0));
                }
            };

            if (this._responseBody) {
                const { body, base64Encoded } = this._responseBody;
                const encoding = base64Encoded ? 'base64' : 'utf-8';
                const content = base64Encoded ? atob(body) : body; // There are some JS responses that are base64 encoded for some reason

                rawContent = Buffer.from(body, encoding);

                rBody = {
                    content,
                    rawContent,
                    rawResponse: () => {
                        return that.getRawResponse();
                    }
                };
            }

            this._response = {
                body: rBody,
                charset: null!,
                headers: normalizedHeaders!,
                hops: this.hops,
                mediaType: null!,
                statusCode: status,
                url: this.finalUrl
            };

            const { charset, mediaType } = getContentTypeData(element, this.originalUrl, normalizedHeaders, rawContent);

            this._response.mediaType = mediaType!;
            this._response.charset = charset!;
        }

        return this._response;
    }

    private logInfo(message: string) {
        debug(`(${this._requestId}) ${message}`);
    }

    /**
     * Update the payload received on the `RequestWillBeSent` event for this `requestId`,
     * taking care of updating other related data if there are any redirects.
     */
    public updateRequestWillBeSent(event: Crdp.Network.RequestWillBeSentEvent) {
        if (event.redirectResponse) {
            this._hops.push(event.redirectResponse.url);
        }

        this._willBeSent = event;
        this.logInfo(RequestStatus.willBeSent);
    }

    /** Update the payload received on the `ResponseReceived` event for this `requestId`. */
    public updateResponseReceived(event: Crdp.Network.ResponseReceivedEvent) {
        this._responseReceived = event;
        this._status = RequestStatus.responseReceived;

        this.logInfo(RequestStatus.responseReceived);
    }

    /** Update the payload received on the `LoadingFinished` event for this `requestId`. */
    public async updateLoadingFinished(event: Crdp.Network.LoadingFinishedEvent) {
        /*
         * Because we queue the event handles if the dom is not ready, we can set this twice.
         * There seems to be a problem trying to get the body when the event has been queued
         * (maybe an internal lost reference for `_network`?) that always throws an exception
         * saying `Error: No resource with given identifier found`.
         * It's faster to get the response while we wait for the dom and then just check if
         * it's present instead of downloading it twice.
         */
        if (!this._loadingFinished) {
            this._loadingFinished = event;
            this._status = RequestStatus.loadingFinished;
            this.logInfo(RequestStatus.loadingFinished);
        } else {
            this.logInfo(`${RequestStatus.loadingFinished} already set`);
        }

        try {
            if (this._responseBody) {
                this.logInfo(`Got body already`);

                return;
            }
            this.logInfo(`Getting body`);
            this._responseBody = await this._network.getResponseBody!({ requestId: event.requestId });
            this.logInfo(`Got body`);
        } catch (e) {
            this.logInfo(`Error getting body`);
            this.logInfo(e);
        }
    }

    /** Update the payload received on the `LoadingFailed` event for this `requestId`. */
    public updateLoadingFailed(event: Crdp.Network.LoadingFailedEvent) {
        this._loadingFailed = event;

        this._status = RequestStatus.loadingFailed;
        this.logInfo(RequestStatus.loadingFailed);
    }

    public constructor(network: Crdp.NetworkClient, event: Crdp.Network.RequestWillBeSentEvent, overrideInvalidCert: boolean) {
        this._network = network;
        this._status = RequestStatus.willBeSent;
        this._willBeSent = event;
        this._requestId = event.requestId;
        this._originalUrl = event.request.url;
        this._overrideInvalidCert = overrideInvalidCert;
    }
}
