import browser from '../../shared/browser';
import { ContentEvents } from '../../shared/types';

import renderResults = require('./views/pages/results.ejs'); // Using `require` as `*.ejs` exports a function.

const tabId = browser.devtools.inspectedWindow.tabId;
const port = browser.runtime.connect({ name: `${tabId}` });
const results = document.getElementById('results')!;
const toggle = document.getElementById('toggle')!;

const onStart = () => {
    results.textContent = '';
    toggle.textContent = 'Stop';
};

const onStop = () => {
    toggle.textContent = 'Start';
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

        const baseStr = baseParts.length ? `${baseParts.join('/')}/` : '';
        const pathStr = pathParts.join('/');
        const dirStr = pathParts.slice(0, -1).join('/');

        return require(`./views/${baseStr}${pathStr}.ejs`)(data, null, resolver(`${baseStr}${dirStr}`));
    };
};

port.onMessage.addListener((message: ContentEvents) => {
    if (message.results) {
        results.innerHTML = renderResults(message.results, null, resolver('pages'));
        onStop();
    }
});

toggle.addEventListener('click', () => {
    if (toggle.textContent === 'Start') {
        sendMessage({ enable: true, tabId });
        onStart();
    } else {
        sendMessage({ done: true, tabId });
        onStop();
    }
});
