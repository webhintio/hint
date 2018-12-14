import { browser, document } from '../../shared/globals';
import { mapHeaders } from '../../shared/headers';
import { Config, Events } from '../../shared/types';

import analyzeView from './views/pages/analyze';
import configurationView from './views/pages/configuration';
import resultsView from './views/pages/results';

import './panel.css';

/** Track the number of redirects by request. */
const hops = new Map<string, string[]>();

/** Cache the ID of the tab being inspected. */
const tabId = browser.devtools.inspectedWindow.tabId;

/** Create a port for receiving messages from the background script. */
const port = browser.runtime.connect({ name: `${tabId}` });

/** Dispatch a message to the background script. */
const sendMessage = (message: Events) => {
    message.tabId = tabId;
    browser.runtime.sendMessage(message);
};

/** Align active styles with the current devtools theme. */
const syncTheme = () => {
    const onThemeChanged = (theme: string) => {
        document.documentElement!.setAttribute('data-theme', theme);
    };

    // Watch for notification of theme changes.
    if (browser.devtools.panels.onThemeChanged) {
        browser.devtools.panels.onThemeChanged.addListener(onThemeChanged);
    }

    // Set the initial theme.
    onThemeChanged(browser.devtools.panels.themeName);
};

/** Display the provided view in the panel. */
const render = (fragment: DocumentFragment) => {
    document.body.textContent = '';
    document.body.appendChild(fragment);
};

/**
 * Generate `fetch::end` events from `devtools.network.onRequestFinished`.
 * These are forwarded to the content-script via the background-script.
 *
 * Note: `fetch::start` events are generated by the background-script
 * using the `webRequest` APIs (as `devtools.network` does not have an
 * equivalent event).
 */
const onRequestFinished = (request: chrome.devtools.network.Request) => {
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

/** Handle the user cancelling a scan or preparing to configure a new one. */
const onCancel = () => {
    // Notify the background script that we're done scanning (in case a scan is still in-progress).
    sendMessage({ done: true });

    // Stop listening for network requests.
    browser.devtools.network.onRequestFinished.removeListener(onRequestFinished);

    // Display the "Configuration" page.
    render(configurationView({ onAnalyzeClick: onStart })); // eslint-disable-line
};

/** Handle the user request to start a scan. */
const onStart = (config: Config) => {
    // Notify the background script to begin scanning with the chosen configuration.
    sendMessage({ enable: config });

    // Listen for network requests (to create `fetch::end::*` events).
    browser.devtools.network.onRequestFinished.addListener(onRequestFinished);

    // Display the "Analyzing" page.
    render(analyzeView({ onCancelClick: onCancel }));
};

/** Handle results received from a scan. */
port.onMessage.addListener((message: Events) => {
    if (message.results) {
        // Stop listening for network requests.
        browser.devtools.network.onRequestFinished.removeListener(onRequestFinished);

        // Display the "Results" page.
        render(resultsView({onRestartClick: onCancel, results: message.results}));
    }
});

// Start in the stopped state (on the "Configuration" page).
onCancel();

// Align with the current devtools theme.
syncTheme();
