import * as url from 'url';

/**
 * Returns the full url domain if it is relative/absolute to a domain or
 *  the original one if it already has a protocol and domain. E.g.:
 *
 * `resolve('favicon.ico', 'http://www.example.com')`
 * -> `'http://www.example.com/favicon.ico'`
 *
 * `resolve('http://example.com/favicon.ico', 'http://www.example.com')`
 * -> `'http://example.com/favicon.ico'`
 *
 */
export const resolveUrl = (href: string, baseUrl: string) => {
    if (url.parse(href).protocol) {
        return href;
    }

    return url.resolve(baseUrl, href);
};
