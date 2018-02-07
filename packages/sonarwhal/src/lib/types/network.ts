/** Request data from fetching an item using a connector. */
export interface IRequest {
    /** The headers used by the connector to make the request */
    headers: any;
    /** The initial requested URL. */
    url: string;
}

export interface IResponseBody {
    /** The uncompressed response's body. A `string` if text, otherwise a `Buffer`. */
    content: string;
    /** The uncompressed bytes of the response's body. */
    rawContent: Buffer;
    /** The original bytes of the body. They could be compressed or not. */
    rawResponse(): Promise<Buffer>;
}

/** Response data from fetching an item using a connector. */
export interface IResponse {
    /** The content of the body sent by the server in different forms. */
    body: IResponseBody;
    /** The charset of the response's body. */
    charset: string;
    /** The headers sent by the server. */
    headers: object;
    /** All the intermediate urls from the initial request until we got the response (if any). */
    hops: Array<string>;
    /** The media type of the response's body. */
    mediaType: string;
    /** The status code of the response. */
    statusCode: number;
    /** The url that returned the data. When in a redirect it will be the final one and not the initiator. */
    url: string;
}

/** Network data from fetching an item using a connector */
export interface INetworkData {
    /** The response of a request. */
    response: IResponse;
    /** The initial request sent, regarderless if there are any redirects. */
    request: IRequest;
}
