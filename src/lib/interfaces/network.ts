/** Request data from fetching an item using a collector */
export interface IRequest {
    headers: object;
}

/** Response data from fetching an item using a collector */
export interface IResponse {
    body: string;
    headers: object;
    originalBytes?: Uint8Array; // TODO: is this the right type?
    statusCode: number;
    url?: string;
}

/** Network data from fetching an item using a collector */
export interface INetworkData {
    response: IResponse;
    request: IRequest;
}
