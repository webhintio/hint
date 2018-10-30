import { FetchEnd, FetchStart, Problem } from 'hint/dist/src/lib/types';

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
    type: chrome.webRequest.ResourceType;
    url: string;
};

export type BackgroundEvents = {
    fetchEnd?: FetchEnd;
    fetchStart?: FetchStart;
};

export type Results = {
    categories: string[];
    hints: string[];
    problems: Problem[];
};

export type ContentEvents = {
    enable?: boolean;
    done?: boolean;
    ready?: boolean;
    results?: Results;
    tabId?: number;
};
