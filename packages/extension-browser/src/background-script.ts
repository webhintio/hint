import { FetchEnd, FetchStart, HttpHeaders, Request, Response } from 'hint/dist/src/lib/types';
import { BackgroundEvents, Config, ContentEvents, Details } from './shared/types'; // eslint-disable-line
import browser from './shared/browser';

// Track data associated with all outstanding requests by `requestId`.
const requests = new Map<string, Details[]>();

/** Convert `webRequest` headers to `hint` headers. */
const mapHeaders = (webRequestHeaders: { name: string, value?: string }[]): HttpHeaders => {
    if (!webRequestHeaders) {
        return {};
    }

    return webRequestHeaders.reduce((headers, header) => {
        headers[header.name.toLowerCase()] = header.value || '';

        return headers;
    }, {} as HttpHeaders);
};

/** Convert `webRequest` details to a `hint` `Request` object. */
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

/** Convert `webRequest` details to a `hint` `Response` object. */
const mapResponse = async (parts: Details[]): Promise<Response> => {
    const responseDetails = parts[parts.length - 1];

    /*
     * Fetch the response body.
     *
     * TODO: Get response body from `Response` if available:
     * * https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/webRequest/filterResponseData
     * * https://bugs.chromium.org/p/chromium/issues/detail?id=487422#c18
     *
     * TODO: Look at `devtools.network` as an alternative:
     * * https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/devtools.network/onRequestFinished
     */
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

const configs = new Map<number, Config>();
const enabledTabs = new Set<number>();
const readyTabs = new Set<number>();
const queuedEvents = new Map<number, BackgroundEvents[]>();

/** Emit an event to a tab's content script if ready; queue otherwise. */
const sendEvent = (tabId: number, event: BackgroundEvents) => {
    if (readyTabs.has(tabId)) {

        browser.tabs.sendMessage(tabId, event);

    } else {

        if (!queuedEvents.has(tabId)) {
            queuedEvents.set(tabId, []);
        }

        const events = queuedEvents.get(tabId)!; // Won't be `null` per `has` check above.

        events.push(event);
    }
};

/** Build and trigger `fetch::end::*` based on provided `webRequest` details. */
const sendFetchEnd = async (parts: Details[]): Promise<void> => {
    const element = null;
    const request = mapRequest(parts);
    const response = await mapResponse(parts);
    const resource = response.url;

    const fetchEnd: FetchEnd = { element, request, resource, response };

    sendEvent(parts[0].tabId, { fetchEnd });
};

/** Build and trigger `fetch::start` based on provided `webRequest` details. */
const sendFetchStart = (details: Details) => {
    const resource = details.url;
    const fetchStart: FetchStart = { resource };

    sendEvent(details.tabId, { fetchStart });
};

/** Add the script to run webhint to the page. */
const injectContentScript = (tabId: number) => {
    browser.tabs.executeScript(tabId, { file: 'content-script/webhint.js', runAt: 'document_start' });
};

/** Queue a `webRequest` event by `requestId`, flushing after `onCompleted`. */
const queueDetails = (event: string, details: Details) => {
    if (!requests.has(details.requestId)) {
        requests.set(details.requestId, []);

        // Trigger a `fetch::start` on the first event for a `requestId`.
        sendFetchStart(details);
    }

    const parts = requests.get(details.requestId)!; // Won't be null due to above if + set.

    parts.push(details);

    if (event === 'onResponseStarted' && details.type === 'main_frame' && enabledTabs.has(details.tabId)) {
        injectContentScript(details.tabId);
    }

    if (event === 'onCompleted') {
        requests.delete(details.requestId);

        // Trigger a `fetch::end::*` on `onCompleted` for a `requestId`.
        sendFetchEnd(parts);
    }
};

const webRequestEvents = [
    'onBeforeRequest',
    'onBeforeSendHeaders',
    'onSendHeaders',
    'onHeadersReceived',
    'onBeforeRedirect',
    'onAuthRequired',
    'onResponseStarted',
    'onCompleted'
];

const webRequestHandlers = webRequestEvents.map((event) => {
    return (details: Details) => {
        queueDetails(event, details);
    };
});

const requestFilter = {
    types: ['main_frame', 'sub_frame', 'stylesheet', 'script', 'image'],
    urls: ['<all_urls>']
};

const extraInfo: { [name: string]: string[] } = {
    onCompleted: ['responseHeaders'],
    onHeadersReceived: ['responseHeaders'],
    onSendHeaders: ['requestHeaders']
};

/** Turn on request tracking for the specified tab. */
const enable = (tabId: number) => {
    if (!enabledTabs.size) {
        // Register and queue all `webRequest` events by `requestId`.
        webRequestEvents.forEach((event, i) => {
            (browser.webRequest as any)[event].addListener(webRequestHandlers[i], requestFilter, extraInfo[event]);
        });
    }
    enabledTabs.add(tabId);
    browser.tabs.reload(tabId, { bypassCache: true });
};

/** Turn off request tracking for the specified tab. */
const disable = (tabId: number) => {
    enabledTabs.delete(tabId);
    readyTabs.delete(tabId);
    if (!enabledTabs.size) {
        webRequestEvents.forEach((event, i) => {
            (browser.webRequest as any)[event].removeListener(webRequestHandlers[i]);
        });
    }
};

browser.browserAction.onClicked.addListener((tab) => {
    if (tab.id) {
        if (enabledTabs.has(tab.id)) {
            disable(tab.id);
        } else {
            enable(tab.id);
        }
    }
});

// Keep a mapping of tab IDs to connected devtools panels for messaging.
const ports = new Map<number, chrome.runtime.Port>();

// Watch for new connections from devtools panels.
browser.runtime.onConnect.addListener((port) => {
    ports.set(parseInt(port.name), port);
});

// Watch for messages from content scripts and devtools panels.
browser.runtime.onMessage.addListener((message: ContentEvents, sender) => {
    const tabId = sender.tab && sender.tab.id || message.tabId;

    if (!tabId) {
        return;
    }

    if (message.enable) {
        configs.set(tabId, message.enable);
        enable(tabId);
    }

    if (message.done) {
        disable(tabId);
    }

    if (message.ready) {
        readyTabs.add(tabId);

        if (queuedEvents.has(tabId)) {
            const events = queuedEvents.get(tabId)!;

            events.forEach((event) => {
                sendEvent(tabId, event);
            });

            queuedEvents.delete(tabId);
        }
    }

    if (message.requestConfig) {
        const configMessage: BackgroundEvents = { config: configs.get(tabId) || {} };

        browser.tabs.sendMessage(tabId, configMessage);
    }

    // Forward results to the associated devtools panel.
    if (message.results) {
        const port = ports.get(tabId);

        if (port) {
            port.postMessage(message);
        }
    }
});
