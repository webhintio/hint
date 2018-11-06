import { BrowserSupportCollection } from '../types';

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
    iOS: 'iOS',
    ios_saf: 'safari_ios',
    node: 'node',
    opera: 'opera',
    qqandroid: 'qq_android',
    safari: 'safari',
    samsung: 'samsunginternet_android',
    ucandroid: 'uc_android'
};
/* eslint-enable */

export const convertBrowserSupportCollectionToMDN = (browserCollection: BrowserSupportCollection): BrowserSupportCollection => {
    const mdnCollection = {} as BrowserSupportCollection;

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
