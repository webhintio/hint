import { FetchEnd, FetchStart } from 'hint/dist/src/lib/types/events';

// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/webRequest/HttpHeaders
export type HttpHeaders = {
    name: string;
    value?: string;
    binaryValue?: number[];
}[];

/*
 * The union of `details` types for webRequest events (as they mostly overlap):
 * https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/webRequest
 */
export type Details = {
    documentUrl: string;
    frameId: number;
    fromCache: boolean;
    ip: string;
    method: string;
    originUrl: string;
    parentFrameId: number;
    proxyInfo: {
        host: string;
        port: number;
        type: string;
        username: string;
        proxyDNS: boolean;
        failoverTimeout: number;
    };
    redirectUrl: string;
    requestId: string;
    requestHeaders: HttpHeaders;
    responseHeaders: HttpHeaders;
    statusCode: number;
    statusLine: string;
    tabId: number;
    timeStamp: number;
    url: string;
};

export type BackgroundEvents = {
    fetchEnd?: FetchEnd;
    fetchStart?: FetchStart;
};

export type ContentEvents = {
    ready?: boolean;
    done?: boolean;
};
