import { Entry, Log } from 'har-format';

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
 * Wait for the provided entry to include all response data.
 * This works around a bug in Firefox which sometimes triggers
 * onRequestFinished before HAR entries have been populated.
 * https://bugzilla.mozilla.org/show_bug.cgi?id=1472653
 */
const waitForFullEntry = (entry: Entry, retries = 5): Promise<Entry> => {
    return new Promise((resolve) => {

        // Don't wait if the entry has already been populated.
        if (typeof entry.response.content.size === 'number' && typeof entry.response.headersSize === 'number' && entry.response.status) {
            resolve(entry);

            return;
        }

        // Give up after a few attempts to avoid retrying forever.
        if (!retries) {
            browser.devtools.inspectedWindow.eval(`console.warn("[webhint] HAR missing data after max retries for ${entry.request.url}")`);
            resolve(entry);

            return;
        }

        // Wait just a bit to give the HAR time to be populated.
        setTimeout(() => {
            // Then check if the HAR has a matching entry with more data.
            browser.devtools.network.getHAR((async (harLog: Log) => {
                const match = harLog.entries.filter((ent) => {
                    return ent.request.url === entry.request.url;
                })[0];

                // Retry with the matching entry if found, or the old one otherwise (as a match may not exist yet).
                resolve(await waitForFullEntry(match || entry, retries - 1));
            }) as any);
        }, 500);
    });
};

/**
 * Get the entry response content directly from a `Request` or `Entry`.
 */
const getContent = (entry: chrome.devtools.network.Request | Entry): Promise<string> => {
    return new Promise((resolve) => {
        if ('getContent' in entry) {
            entry.getContent((content) => {
                resolve(content);
            });
        } else {
            resolve(entry.response.content.text);
        }
    });
};

/**
 * Generate `fetch::end` events from `devtools.network.onRequestFinished`.
 * These are forwarded to the content-script via the background-script.
 */
const generateFetchEnd = async (entry: chrome.devtools.network.Request) => {
    const fullEntry = await waitForFullEntry(entry);
    const content = await getContent(entry);
    const url = fullEntry.request.url;

    if (fullEntry.response.redirectURL) {

        // Track hops on a redirect, using an existing list of hops if one exists.
        const urls = hops.has(url) ? hops.get(url)! : [];

        // Add the previous URL to the list and stash under the current requested URL.
        urls.push(url);
        hops.delete(url);
        hops.set(fullEntry.response.redirectURL, urls);

    } else {

        const requestHops = hops.get(url) || [];
        const requestURL = requestHops.length ? requestHops[0] : url;

        // Otherwise generate a `fetch::end::*` event for the request.
        sendMessage({
            fetchEnd: {
                element: null, // Set by `content-script/connector`.
                request: {
                    headers: mapHeaders(fullEntry.request.headers),
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
                    headers: mapHeaders(fullEntry.response.headers),
                    hops: requestHops,
                    mediaType: '', // Set by `content-script/connector`.
                    statusCode: fullEntry.response.status || 200, // Firefox returns `0`.
                    url
                }
            }
        });
    }

    hops.delete(url);
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
