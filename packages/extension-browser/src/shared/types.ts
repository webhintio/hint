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

export type Config = {
    categories?: string[];
    browserslist?: string;
    ignoredUrls?: string;
};

export type HintResults = {
    helpURL: string;
    id: string;
    name: string;
    problems: Problem[];
};

export type CategoryResults = {
    hints: HintResults[];
    name: string;
    passed: number;
};

export type ResponseBody = {
    content: string;
    url: string;
};

export type Results = {
    categories: CategoryResults[];
};

export type Events = {
    enable?: Config;
    fetchEnd?: FetchEnd;
    fetchStart?: FetchStart;
    done?: boolean;
    ready?: boolean;
    requestConfig?: boolean;
    responseBody?: ResponseBody;
    results?: Results;
    tabId?: number;
};
