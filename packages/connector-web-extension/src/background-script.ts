import { FetchEnd, FetchStart, HttpHeaders, Request, Response } from 'hint/dist/src/lib/types';
import { ExtensionEvents, Details } from './types';

// Normalize access to extension APIs across browsers.
const browser: typeof chrome = (self as any).browser || self.chrome;

// Track data associated with all outstanding requests by `requestId`.
const requests = new Map<string, Details[]>();

// Convert `webRequest` headers to `hint` headers.
const mapHeaders = (webRequestHeaders: { name: string, value?: string }[]): HttpHeaders => {
    return webRequestHeaders.reduce((headers, header) => {
        headers[header.name] = header.value || '';

        return headers;
    }, {} as HttpHeaders);
};

// Convert `webRequest` details to a `hint` `Request` object.
const mapRequest = (parts: Details[]): Request => {
    const requestDetails = parts[0];

    // Take the first `requestHeaders` found (ignoring headers for redirects).
    const requestHeaders = parts.map((details) => {
        return details.requestHeaders;
    }).filter((headers) => {
        return !!headers;
    })[0];

    // Build a `hint` request object.
    return {
        headers: mapHeaders(requestHeaders),
        url: requestDetails.url
    };
};

// Convert `webRequest` details to a `hint` `Response` object.
const mapResponse = async (parts: Details[]): Promise<Response> => {
    const responseDetails = parts[parts.length - 1];

    // Fetch the response body.
    const responseBody = await fetch(responseDetails.url);

    // Build a `hint` response object.
    return {
        body: {
            content: await responseBody.text(),
            rawContent: null as any,
            rawResponse: null as any
        },
        charset: '', // Set by `connector`.
        headers: mapHeaders(responseDetails.responseHeaders),
        hops: parts.map((details) => {
            return details.redirectUrl;
        }).filter((url) => {
            return !!url;
        }),
        mediaType: '', // Set by `connector`.
        statusCode: responseDetails.statusCode,
        url: responseDetails.url
    };
};

// Build and trigger `fetch::end::*` based on provided `webRequest` details.
const sendFetchEnd = async (parts: Details[]): Promise<void> => {
    const element = null;
    const request = mapRequest(parts);
    const response = await mapResponse(parts);
    const resource = response.url;

    const fetchEnd: FetchEnd = { element, request, resource, response };

    browser.tabs.sendMessage(parts[0].tabId, { fetchEnd } as ExtensionEvents);
};

// Build and trigger `fetch::start` based on provided `webRequest` details.
const sendFetchStart = (details: Details) => {
    const resource = details.url;
    const fetchStart: FetchStart = { resource };

    browser.tabs.sendMessage(details.tabId, { fetchStart } as ExtensionEvents);
};

// Queue a `webRequest` event by `requestId`, flushing after `onCompleted`.
const queueDetails = (event: string, details: Details) => {
    if (!requests.has(details.requestId)) {
        requests.set(details.requestId, []);

        // Trigger a `fetch::start` on the first event for a `requestId`.
        sendFetchStart(details);
    }

    const parts = requests.get(details.requestId)!; // Won't be null due to above if + set.

    parts.push(details);

    if (event === 'onCompleted') {
        requests.delete(details.requestId);

        // Trigger a `fetch::end::*` on `onCompleted` for a `requestId`.
        sendFetchEnd(parts);
    }
};

// Register and queue all `webRequest` events by `requestId`.
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
    // TODO: Filter to relevant `ResourceType`s (https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/webRequest/ResourceType)
    (browser.webRequest as any)[event].addListener((details: Details) => {
        queueDetails(event, details);
    });
});
