import browser from '../../shared/browser';
import { Config, ContentEvents } from '../../shared/types';

import './panel.css';

// Using `require` as `*.ejs` exports a function.
import renderAnalyze = require('./views/pages/analyze.ejs');
import renderConfiguration = require('./views/pages/configuration.ejs');
import renderResults = require('./views/pages/results.ejs');

const tabId = browser.devtools.inspectedWindow.tabId;
const port = browser.runtime.connect({ name: `${tabId}` });

// TODO: Read from packaged hint metadata.
const categories = [
    'Accessibility',
    'Interoperability',
    'PWA',
    'Performance',
    'Security'
];

const findInput = (s: string): HTMLInputElement => {
    return document.querySelector(s) as HTMLInputElement;
};

const findAllInputs = (s: string): HTMLInputElement[] => {
    return Array.from(document.querySelectorAll(s));
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

/** Extract selected browsers from the form and convert to the `Config` format. */
const getBrowsersList = (): string => {
    const browsersQuery: string[] = [];

    if (findInput('[name="recommended-browsers"]').checked) {
        browsersQuery.push('defaults');
    }

    if (findInput('[name="custom-browsers"]').checked) {
        browsersQuery.push(findInput('[name="custom-browsers-list"]').value);
    }

    return browsersQuery.join(', ');
};

/** Extract selected categories from the form and convert to the `Config` format. */
const getCategories = (): string[] => {
    return findAllInputs('.configuration__category:checked').map((input) => {
        return input.value;
    });
};

/** Extract ignored URLs from the form and convert to the `Config` format. */
const getIgnoredUrls = (): string => {
    const type = findInput('[name="resources"]:checked').value;

    switch (type) {
        case 'none':
            return '';
        case 'third-party':
            throw new Error('Not yet implemented');
        case 'custom':
            return findInput('[name="custom-resources"]').value;
        default:
            throw new Error(`Unrecognized resource filter: '${type}'`);
    }
};

/** Extract all user provided configuration from the form as a `Config` object. */
const getConfiguration = (): Config => {
    return {
        browserslist: getBrowsersList(),
        categories: getCategories(),
        ignoredUrls: getIgnoredUrls()
    };
};

const onCancel = () => {
    sendMessage({ done: true, tabId });

    document.body.innerHTML = renderConfiguration({ categories }, null, resolver('pages'));

    const startButton = document.querySelector('.header__analyze-button')!;

    startButton.addEventListener('click', onStart); // eslint-disable-line
};

const onStart = () => {
    sendMessage({ enable: getConfiguration(), tabId });

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
