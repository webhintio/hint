import { URL } from 'url';

import { HTMLDocument, HTMLElement } from './html';

/**
 * Two level cache: doc.base / url
 * TODO: Use quick-lru so that it doesn't grow without bounds
 */
const CACHED_URLS: { [key: string]: { [key: string]: URL } } = { };

const getSrcsetUrls = (srcset: string | null): string[] => {
    if (!srcset) {
        return [];
    }

    const parts = srcset.split(',');
    const urls = parts.reduce((total, part) => {
        const url = part.trim().split(' ')[0];

        if (!url) {
            return total;
        }

        total.push(url.trim());

        return total;
    }, [] as string[]);

    return urls;
};

/**
 * Get an HTMLElement given a URL.
 * @param {HTMLDocument} dom - HTMLDocument to perform the search.
 * @param {string} url - URL that the element has to contain.
 */
export const getElementByUrl = (dom: HTMLDocument, url: string): HTMLElement | null => {
    const elements = dom.querySelectorAll('a[href],link[href],audio[src],iframe[src],script[src],source[src],track[src],frame[src],img[src],video[poster],img[srcset],source[srcset]');

    if (!(dom.base in CACHED_URLS)) {
        CACHED_URLS[dom.base] = { };
    }

    const urlCache = CACHED_URLS[dom.base];

    /*
     * Even if there are multiple elements with the same URL,
     * it's the first one that triggers the download in the browser
     * and thus the one we should be reporting.
     */
    for (let i = 0; i < elements.length; ++i) {
        const element = elements[i];
        const elementUrl = element.getAttribute('href') || element.getAttribute('src') || element.getAttribute('poster');
        const elementUrls = [elementUrl, ...getSrcsetUrls(element.getAttribute('srcset'))];

        if (elementUrls.includes(url)) {
            return element;
        }

        for (let k = 0; k < elementUrls.length; ++k) {
            const relativeUrl = elementUrls[k];

            if (relativeUrl === null) {
                continue;
            }
            // TODO: Cache the absolute URL, so we don't run new URL() for the same URL.

            /**
             * If `elementUrls` has an element with an invalid value
             * (e.g.: just `http://`), creating a new `URL` will fail.
             */
            try {

                if (!(relativeUrl in urlCache)) {
                    urlCache[relativeUrl] = new URL(relativeUrl, dom.base);
                }

                const { href } = urlCache[relativeUrl];

                if (href === url) {
                    return element;
                }
            } catch (e) {
                // Ignore
            }
        }
    }

    return null;
};
