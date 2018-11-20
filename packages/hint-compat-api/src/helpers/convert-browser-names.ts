/**
 * @fileoverview Helper that convert browser names from Browserlist to MDN Api.
 */

import { BrowserSupportCollection } from '../types';
const { browsers: mdnBrowsers } = require('mdn-browser-compat-data');

type BrowsersDictionary = {
    [key: string]: string;
};

/* eslint-disable */
const browserNamesToMDN: BrowsersDictionary = {
    and_chr: 'chrome_android',
    and_qq: 'qq_android',
    and_uc: 'uc_android',
    android: 'webview_android',
    chrome: 'chrome',
    chromeandroid: 'chrome_android',
    edge: 'edge',
    edge_mob: 'edge_mobile',
    explorer: 'ie',
    ff: 'firefox',
    firefox: 'firefox',
    and_ff: 'firefox_android',
    firefoxandroid: 'firefox_android',
    ie: 'ie',
    ios_saf: 'safari_ios',
    node: 'nodejs',
    opera: 'opera',
    qqandroid: 'qq_android',
    safari: 'safari',
    samsung: 'samsunginternet_android',
    ucandroid: 'uc_android'
};
/* eslint-enable */

const testBrowsersDictionary = (): void => {
    const flatMdnBrowsers = Object.keys(mdnBrowsers);

    Object.entries(browserNamesToMDN).forEach(([browserListName, mdnBrowserName]) => {
        if (!flatMdnBrowsers.find((flatMdnBrowser) => {
            return flatMdnBrowser === mdnBrowserName;
        })) {
            throw new Error('Browserslist and MDN Browsers are not compatible.');
        }
    });
};

export const convertBrowserSupportCollectionToMDN = (browserCollection: BrowserSupportCollection): BrowserSupportCollection => {
    const mdnCollection: BrowserSupportCollection = {};

    testBrowsersDictionary();

    Object.entries(browserCollection).forEach(([browserName, browserVersions]) => {
        const mdnName = browserNamesToMDN[browserName.toLowerCase()];

        if (!mdnName) {
            return;
        }

        mdnCollection[mdnName] = mdnCollection[mdnName] || [];

        mdnCollection[mdnName] = ([...mdnCollection[mdnName], ...browserVersions]).sort((a, b) => {
            return a - b;
        });
    });

    return mdnCollection;
};
