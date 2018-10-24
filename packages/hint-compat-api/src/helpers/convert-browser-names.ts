import { BrowserSupportCollection, BrowserSupportCollectionRaw } from '../types';

type BrowsersDictionary = {
    [key: string]: string;
};

/* eslint-disable camelcase */
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
/* eslint-enable camelcase */

export const convertBrowserSupportCollectionToMDN = (browserCollection: BrowserSupportCollectionRaw): BrowserSupportCollection => {
    const mdnCollection = {} as BrowserSupportCollection;

    Object.entries(browserCollection).forEach(([browserName, browserItem]) => {
        const mdnName = browserNamesToMDN[browserName.toLowerCase()];

        if (!mdnName) {
            return;
        }

        mdnCollection[mdnName] = {
            max: browserItem.max ? Number(browserItem.max) : null,
            min: Number(browserItem.min)
        };
    });

    return mdnCollection;
};
