import browser from '../../shared/browser';
import { ContentEvents } from '../../shared/types';

import './panel.css';

// Using `require` as `*.ejs` exports a function.
import renderAnalyze = require('./views/pages/analyze.ejs');
import renderConfiguration = require('./views/pages/configuration.ejs');
import renderResults = require('./views/pages/results.ejs');

const tabId = browser.devtools.inspectedWindow.tabId;
const port = browser.runtime.connect({ name: `${tabId}` });

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

const onCancel = () => {
    sendMessage({ done: true, tabId });

    document.body.innerHTML = renderConfiguration({
        categories: [
            'Accessibility',
            'Interoperability',
            'PWA',
            'Performance',
            'Security'
        ]
    }, null, resolver('pages'));

    const startButton = document.querySelector('.header__analyze-button')!;

    startButton.addEventListener('click', onStart); // eslint-disable-line
};

const onStart = () => {
    sendMessage({ enable: true, tabId });

    document.body.innerHTML = renderAnalyze(null, null, resolver('pages'));

    const cancelButton = document.querySelector('.analyze__cancel-button')!;

    cancelButton.addEventListener('click', onCancel);
};

port.onMessage.addListener((message: ContentEvents) => {
    if (message.results) {
        document.body.innerHTML = renderResults(message.results, null, resolver('pages'));

        const restartButton = document.querySelector('.header__analyze-button')!;

        restartButton.addEventListener('click', onCancel);
    }
});

onCancel();
