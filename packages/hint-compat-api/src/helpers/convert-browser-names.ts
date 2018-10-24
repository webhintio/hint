import { BrowserSupportCollection } from '../types';

const browserNamesToMDN = {
    chrome: 'chrome',
    edge: 'edge',
    opera: 'opera',
    safari: 'safari',
    ie: 'ie',
    explorer: 'ie',
    android: 'webview_android',
    chromeandroid: 'chrome_android',
    and_chr: 'chrome_android',
    edge_mob: 'edge_mobile',
    firefox: 'firefox',
    ff: 'firefox',
    iOS: 'iOS',
    ios_saf: 'safari_ios',
    node: 'node',
    qqandroid: 'qq_android',
    and_qq: 'qq_android',
    samsung: 'samsunginternet_android',
    ucandroid: 'uc_android',
    and_uc: 'uc_android'
} as any;

type BrowserSupportItemRaw = {
    min: string;
    max?: string | null;
}

type BrowserSupportCollectionRaw = {
    [key: string]: BrowserSupportItemRaw
}

export const convertBrowserSupportCollectionToMDN = (browserCollection: BrowserSupportCollectionRaw): BrowserSupportCollection => {
    let mdnCollection = {} as BrowserSupportCollection;

    Object.entries(browserCollection).forEach(([browserName, browserItem]) => {
        const mdnName = browserNamesToMDN[browserName.toLowerCase()];

        if (!mdnName) {
            return;
        }

        mdnCollection[mdnName] = {
            min: Number(browserItem.min),
            max: browserItem.max ? Number(browserItem.max) : null
        };
    });

    return mdnCollection;
};

