/** Request data from fetching an item using a collector. */
export interface IRequest {
    /** The headers used by the collector to make the request */
    headers: any;
    /** The initial requested URL. */
    url: string;
}

/** Response data from fetching an item using a collector. */
export interface IResponse {
    /** The uncompressed response's body. A `string` if text, otherwise a `Buffer`. */
    body: string;
    /** The uncompressed bytes of the response's body. */
    rawBody: Buffer;
    /** The headers sent by the server. */
    headers: any;
    /** All the intermediate urls from the initial request until we got the response (if any). */
    hops: Array<string>;
    /** The original bytes of the body. They could be compressed or not. */
    rawBodyResponse: Buffer;
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
