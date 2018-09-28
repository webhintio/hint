export type HttpHeaders = {
    [name: string]: string | undefined; // TODO: include `string[]`
};

/** Request data from fetching an item using a connector. */
export type Request = {
    /** The headers used by the connector to make the request */
    headers: HttpHeaders;
    /** The initial requested URL. */
    url: string;
};

export type ResponseBody = {
    /** The uncompressed response's body. A `string` if text, otherwise a `Buffer`. */
    content: string;
    /** The uncompressed bytes of the response's body. */
    rawContent: Buffer;
    /** The original bytes of the body. They could be compressed or not. */
    rawResponse(): Promise<Buffer>;
};

/** Response data from fetching an item using a connector. */
export type Response = {
    /** The content of the body sent by the server in different forms. */
    body: ResponseBody;
    /** The charset of the response's body. */
    charset: string;
    /** The headers sent by the server. */
    headers: HttpHeaders;
    /** All the intermediate urls from the initial request until we got the response (if any). */
    hops: Array<string>;
    /** The media type of the response's body. */
    mediaType: string;
    /** The status code of the response. */
    statusCode: number;
    /** The url that returned the data. When in a redirect it will be the final one and not the initiator. */
    url: string;
};

/** Network data from fetching an item using a connector */
export type NetworkData = {
    /** The response of a request. */
    response: Response;
    /** The initial request sent, regarderless if there are any redirects. */
    request: Request;
};
