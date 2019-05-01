import * as puppeteer from 'puppeteer-core';

import { dom, HTMLElement, HTMLDocument } from '@hint/utils';

const { getElementByUrl } = dom;

/** Returns the HTMLElement that initiated a request */
export const getElementFromResponse = (source: puppeteer.Response | puppeteer.Request, baseUrl: string, dom?: HTMLDocument): HTMLElement | null => {
    const request = 'request' in source ?
        source.request() :
        source;

    const redirectChain = request.redirectChain();
    const requestUrl = redirectChain && redirectChain.length > 0 ?
        redirectChain[0].url() :
        source.url();

    /*
     * TODO: Check what happens with prefetch, etc.
     * `type` can be "parser", "script", "preload", and "other": https://chromedevtools.github.io/debugger-protocol-viewer/tot/Network/#type-Initiator
     */
    // The doesn't seem to be an initiator in puppeteer :/
    if (dom && requestUrl.startsWith('http')) {
        return getElementByUrl(dom, requestUrl, baseUrl);
    }

    return null;
};
