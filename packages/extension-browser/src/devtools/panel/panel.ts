import { document } from '../../shared/globals';
import { Config, Events } from '../../shared/types';

import analyzeView from './views/pages/analyze';
import configurationView from './views/pages/configuration';
import resultsView from './views/pages/results';

import { addMessageListener, removeMessageListener, sendMessage } from './utils/messaging';
import { addNetworkListeners, removeNetworkListeners } from './utils/network';
import { syncTheme } from './utils/themes';

import * as styles from './panel.css';

import * as contentScript from 'raw-loader!../../../webhint.js';

document.body.classList.add(styles.root);

/** Display the provided view in the panel. */
const render = (fragment: DocumentFragment) => {
    document.body.textContent = '';
    document.body.appendChild(fragment);
};

let delayResultsUntil = Date.now();

/**
 * Wait 5s after called before showing results.
 * Called when messages change in the "Analyzing" page.
 * Gives users a chance to read the last message before it disappears.
 * This does not delay showing to the "Configuration" page on cancel.
 */
const delayResults = () => {
    delayResultsUntil = Date.now() + 5000;
};

let resultsTimeout: NodeJS.Timeout;

/**
 * Render the provided view, cancelling any scheduled renders.
 * This ensures a delayed render of the results view doesn't suddenly
 * get switched in after a user explicitly cancels analysis.
 */
const show = (fragment: DocumentFragment) => {
    clearTimeout(resultsTimeout);
    render(fragment);
};

/** Handle results received from a scan. */
const onMessage = (message: Events) => {
    if (message.results) {
        const results = message.results;

        // Stop listening for results and network requests.
        removeMessageListener(onMessage);
        removeNetworkListeners();

        const showResults = () => {
            show(resultsView({onRestartClick: onCancel, results})); // eslint-disable-line
        };

        // Display the "Results" page after any pending delays.
        if (Date.now() < delayResultsUntil) {
            resultsTimeout = setTimeout(showResults, delayResultsUntil - Date.now());
        } else {
            showResults();
        }
    }
};

/** Handle the user cancelling a scan or preparing to configure a new one. */
const onCancel = () => {
    // Notify the background script that we're done scanning (in case a scan is still in-progress).
    sendMessage({ done: true });

    // Stop listening for results and network requests.
    removeMessageListener(onMessage);
    removeNetworkListeners();

    // Display the "Configuration" page.
    show(configurationView({ onAnalyzeClick: onStart })); // eslint-disable-line
};

/** Handle the user request to start a scan. */
const onStart = (config: Config) => {
    // Notify the background script to begin scanning with the chosen configuration.
    sendMessage({ enable: { code: contentScript, config } });

    // Listen for scan results and network requests (to create `fetch::end::*` events).
    addMessageListener(onMessage);
    addNetworkListeners();

    // Display the "Analyzing" page.
    show(analyzeView({ onCancelClick: onCancel, onMessageChange: delayResults }));
};

// Start in the stopped state (on the "Configuration" page).
onCancel();

// Align with the current devtools theme.
syncTheme();
