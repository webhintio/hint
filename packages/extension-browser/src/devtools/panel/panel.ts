import { document } from '../../shared/globals';
import { Config, Events } from '../../shared/types';

import analyzeView from './views/pages/analyze';
import configurationView from './views/pages/configuration';
import resultsView from './views/pages/results';

import { addMessageListener, sendMessage } from './utils/messaging';
import { addNetworkListeners, removeNetworkListeners } from './utils/network';
import { syncTheme } from './utils/themes';

import './panel.css';

/** Display the provided view in the panel. */
const render = (fragment: DocumentFragment) => {
    document.body.textContent = '';
    document.body.appendChild(fragment);
};

/** Handle the user cancelling a scan or preparing to configure a new one. */
const onCancel = () => {
    // Notify the background script that we're done scanning (in case a scan is still in-progress).
    sendMessage({ done: true });

    // Stop listening for network requests.
    removeNetworkListeners();

    // Display the "Configuration" page.
    render(configurationView({ onAnalyzeClick: onStart })); // eslint-disable-line
};

/** Handle the user request to start a scan. */
const onStart = (config: Config) => {
    // Notify the background script to begin scanning with the chosen configuration.
    sendMessage({ enable: config });

    // Listen for network requests (to create `fetch::end::*` events).
    addNetworkListeners();

    // Display the "Analyzing" page.
    render(analyzeView({ onCancelClick: onCancel }));
};

/** Handle results received from a scan. */
addMessageListener((message: Events) => {
    if (message.results) {
        // Stop listening for network requests.
        removeNetworkListeners();

        // Display the "Results" page.
        render(resultsView({onRestartClick: onCancel, results: message.results}));
    }
});

// Start in the stopped state (on the "Configuration" page).
onCancel();

// Align with the current devtools theme.
syncTheme();
