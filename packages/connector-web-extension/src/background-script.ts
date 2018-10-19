import { FetchEnd, FetchStart } from 'hint/dist/src/lib/types/events';
import { Request, Response } from 'hint/dist/src/lib/types/network';
import { ExtensionEvents, Details } from './types';

// Normalize access to extension APIs across browsers
const browser: typeof chrome = (self as any).browser || self.chrome;

const requests = new Map<string, Details[]>();

const sendFetchEnd = (parts: Details[]) => {

    const requestDetails = parts[0];
    const responseDetails = parts[parts.length - 1];

    const element = null;
    const resource = responseDetails.url;

    const requestHeaders = parts.map((details) => {
        return details.requestHeaders;
    }).filter((headers) => {
        return !!headers;
    })[0];

    const request: Request = {
        headers: requestHeaders,
        url: requestDetails.url
    };

    const response: Response = {
        body: '', // TODO
        charset: '', // TODO
        headers: responseDetails.responseHeaders,
        hops: parts.map((details) => {
            return details.redirectUrl;
        }).filter((url) => {
            return !!url;
        }),
        mediaType: '', // TODO
        statusCode: responseDetails.statusCode,
        url: responseDetails.url
    };

    const fetchEnd: FetchEnd = { element, request, resource, response };

    browser.tabs.sendMessage(parts[0].tabId, { fetchEnd } as ExtensionEvents);
};

const sendFetchStart = (details: Details) => {
    const resource = details.url;
    const fetchStart: FetchStart = { resource };

    browser.tabs.sendMessage(details.tabId, { fetchStart } as ExtensionEvents);
};

const queueDetails = (event: string, details: Details) => {
    if (!requests.has(details.requestId)) {
        requests.set(details.requestId, []);

        sendFetchStart(details);
    }

    const parts = requests.get(details.requestId)!; // Won't be null due to above if + set.

    parts.push(details);

    if (event === 'onCompleted') {
        requests.delete(details.requestId);

        sendFetchEnd(parts);
    }
};

[
    'onBeforeRequest',
    'onBeforeSendHeaders',
    'onSendHeaders',
    'onHeadersReceived',
    'onBeforeRedirect',
    'onAuthRequired',
    'onResponseStarted',
    'onCompleted'
].forEach((event) => {
    (browser.webRequest as any)[event].addListener((details: Details) => {
        queueDetails(event, details);
    });
});
