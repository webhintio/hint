import { URL } from 'url';

import { HTMLDocument, HTMLElement } from '../../types/html';

const getSrcsetUrls = (srcset: string): string[] => {
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

export default (dom: HTMLDocument, url: string, base: string): HTMLElement | null => {
    // TODO: Cache dom.querySelectorAll?.
    const elements = dom.querySelectorAll('[href],[src],[poster],[srcset]').filter((element: any) => {
        const elementUrl = element.getAttribute('href') || element.getAttribute('src') || element.getAttribute('poster');
        const elementUrls = [elementUrl, ...getSrcsetUrls(element.getAttribute('srcset'))];

        if (elementUrls.includes(url)) {
            return true;
        }

        const absoluteUrls = elementUrls.map((relativeUrl) => {
            // TODO: Cache the absolute URL, so we don't run new URL() for the same URL.
            return new URL(relativeUrl, base).href;
        });

        if (absoluteUrls.includes(url)) {
            return true;
        }

        return false;
    });

    /*
     * Even if there are multiple elements with the same URL,
     * it's the first one that triggers the download in the browser
     * and thus the one we should be reporting.
     */
    if (elements.length > 0) {
        return elements[0];
    }

    return null;
};
