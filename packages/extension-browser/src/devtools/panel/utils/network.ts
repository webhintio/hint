import { browser } from '../../../shared/globals';
import { mapHeaders } from '../../../shared/headers';

import { sendMessage } from './messaging';

/** Track the number of redirects by request. */
const hops = new Map<string, string[]>();

/**
 * Generate `fetch::start` events from `devtools.network.onRequestFinished`.
 * These are forwarded to the content-script via the background-script.
 *
 * TODO: Find an event which can be used to trigger these earlier.
 */
const generateFetchStart = (request: chrome.devtools.network.Request) => {
    sendMessage({ fetchStart: { resource: request.request.url } });
};

/**
 * Generate `fetch::end` events from `devtools.network.onRequestFinished`.
 * These are forwarded to the content-script via the background-script.
 */
const generateFetchEnd = (request: chrome.devtools.network.Request) => {
    request.getContent((content: string) => {
        const url = request.request.url;

        if (request.response.redirectURL) {

            // Track hops on a redirect, using an existing list of hops if one exists.
            const urls = hops.has(url) ? hops.get(url)! : [];

            // Add the previous URL to the list and stash under the current requested URL.
            urls.push(url);
            hops.delete(url);
            hops.set(request.response.redirectURL, urls);

        } else {

            const requestHops = hops.get(url) || [];
            const requestURL = requestHops.length ? requestHops[0] : url;

            // Otherwise generate a `fetch::end::*` event for the request.
            sendMessage({
                fetchEnd: {
                    element: null, // Set by `content-script/connector`.
                    request: {
                        headers: mapHeaders(request.request.headers),
                        url: requestURL
                    },
                    resource: url,
                    response: {
                        body: {
                            content,
                            rawContent: null as any,
                            rawResponse: null as any
                        },
                        charset: '', // Set by `content-script/connector`.
                        headers: mapHeaders(request.response.headers),
                        hops: requestHops,
                        mediaType: '', // Set by `content-script/connector`.
                        statusCode: request.response.status,
                        url
                    }
                }
            });
        }

        hops.delete(url);
    });
};

/**
 * Convert requests to `fetch::*` events and forward to the content-script via the background-script.
 */
const onRequestFinished = (request: chrome.devtools.network.Request) => {
    generateFetchStart(request);
    generateFetchEnd(request);
};

/**
 * Start listening for requests and generate `fetch::*` events.
 */
export const addNetworkListeners = () => {
    browser.devtools.network.onRequestFinished.addListener(onRequestFinished);
};

/**
 * Stop listening for network requests.
 */
export const removeNetworkListeners = () => {
    browser.devtools.network.onRequestFinished.removeListener(onRequestFinished);
};
