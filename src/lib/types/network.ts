/** Request data from fetching an item using a collector. */
export interface IRequest {
    /** The headers used by the collector to make the request */
    headers: any;
    /** The initial requested URL. */
    url: string;
}

export interface IResponseBody {
    /** The uncompressed response's body. A `string` if text, otherwise a `Buffer`. */
    content: string;
    /** The encoding of the response's body. */
    contentEncoding: string;
    /** The uncompressed bytes of the response's body. */
    rawContent: Buffer;
    /** The original bytes of the body. They could be compressed or not. */
    rawResponse: Buffer;
}

/** Response data from fetching an item using a collector. */
export interface IResponse {
    /** The content of the body sent by the server in different forms. */
    body: IResponseBody;
    /** The headers sent by the server. */
    headers: object;
    /** All the intermediate urls from the initial request until we got the response (if any). */
    hops: Array<string>;
    /** The status code of the response. */
    statusCode: number;
    /** The url that returned the data. When in a redirect it will be the final one and not the initiator. */
    url: string;
}

/** Network data from fetching an item using a collector */
export interface INetworkData {
    /** The response of a request. */
    response: IResponse;
    /** The initial request sent, regarderless if there are any redirects. */
    request: IRequest;
}
