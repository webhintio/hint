import browser from '../../shared/browser';
import { ContentEvents } from '../../shared/types';

import './panel.css';

import renderResults = require('./views/pages/results.ejs'); // Using `require` as `*.ejs` exports a function.

const startText = 'Analyze website';
const stopText = 'Cancel analysis';
const tabId = browser.devtools.inspectedWindow.tabId;
const port = browser.runtime.connect({ name: `${tabId}` });
const results = document.getElementById('results')!;
const toggle = document.getElementById('toggle')!;

const onStart = () => {
    results.textContent = '';
    toggle.textContent = stopText;
};

const onStop = () => {
    toggle.textContent = startText;
};

const sendMessage = (message: ContentEvents) => {
    browser.runtime.sendMessage(message);
};

/** Convert EJS `include` calls to `require` calls. */
const resolver = (base: string) => {
    return (path: string, data: any) => {
        const baseParts = base.split('/');
        const pathParts = path.split('/');

        while (pathParts[0] === '..') {
            baseParts.pop();
            pathParts.shift();
        }

        const resolvedPath = [...baseParts, ...pathParts].join('/');
        const resolvedBase = [...baseParts, ...pathParts.slice(0, -1)].join('/');

        return require(`./views/${resolvedPath}.ejs`)(data, null, resolver(resolvedBase));
    };
};

port.onMessage.addListener((message: ContentEvents) => {
    if (message.results) {
        results.innerHTML = renderResults(message.results, null, resolver('pages'));
        onStop();
    }
});

toggle.addEventListener('click', () => {
    if (toggle.textContent === startText) {
        sendMessage({ enable: true, tabId });
        onStart();
    } else {
        sendMessage({ done: true, tabId });
        onStop();
    }
});

onStop();
