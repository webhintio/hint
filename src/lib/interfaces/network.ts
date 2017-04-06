/** Request data from fetching an item using a collector. */
export interface IRequest {
    /** The headers used by the collector to make the request */
    headers: any;
    /** The initial requested URL. */
    url: string;
}

/** Response data from fetching an item using a collector. */
export interface IResponse {
    /** The uncompressed body of the response. */
    body: string;
    /** The headers sent by the server. */
    headers: any;
    /** All the intermediate urls from the initial request until we got the response (if any). */
    hops: Array<string>;
    /** The original bytes of the body. They could be compressed or not. */
    originalBytes?: Uint8Array; // TODO: is this the right type?
    statusCode: number;
    /** The url that returned the data. In a redirect it will be the final one. */
    url: string;
}

/** Network data from fetching an item using a collector */
export interface INetworkData {
    /** The response of a request. */
    response: IResponse;
    /** The initial request sent, regarderless if there are any redirects. */
    request: IRequest;
}
