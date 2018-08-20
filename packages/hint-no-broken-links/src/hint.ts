/**
 * @fileoverview This hint verifies that all links and resources the page
 * uses are available online. Checks for 404, 410, 500 or 503 status
 */

import * as URL from 'url';
import { Category } from 'hint/dist/src/lib/enums/category';
import { HintContext } from 'hint/dist/src/lib/hint-context';
import {
    IHint,
    ElementFound,
    HintMetadata,
    IAsyncHTMLElement
} from 'hint/dist/src/lib/types';
import { debug as d } from 'hint/dist/src/lib/utils/debug';
import { HintScope } from 'hint/dist/src/lib/enums/hintscope';
import { Requester } from '@hint/utils-connector-tools/dist/src/requester';
import { IAsyncHTMLDocument, NetworkData, TraverseEnd } from 'hint/dist/src/lib/types';
import { CoreOptions } from 'request';
const debug: debug.IDebugger = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class NoBrokenLinksHint implements IHint {
    public static readonly meta: HintMetadata = {
        docs: {
            category: Category.performance,
            description: `Hint to flag broken links in the page`
        },
        id: 'no-broken-links',
        schema: [],
        scope: HintScope.site
    };

    public constructor(context: HintContext) {

        const options: CoreOptions = { method: 'HEAD' };
        const requester = new Requester(options);
        const brokenStatusCodes = [404, 410, 500, 503];

        /** Stores the elements with their URLs which have been collected while traversing the page. */
        const collectedElementsWithUrls: [ IAsyncHTMLElement, string[] ][] = [];

        /** Stores the URLs and it's response status codes */
        const fetchedUrls: any[] = [];

        /** Returns an array with all the URLs in the given `srcset` attribute or an empty string if none. */
        const parseSrcSet = (srcset: string): Array<string> => {
            if (!srcset) {
                return [];
            }

            const urls = srcset
                .split(',')
                .map((entry) => {
                    return entry.trim().split(' ')[0].trim();
                });

            return urls;
        };

        /**
         * The callback to handle rejection returned from the `head` method
         * When DNS resolution fails, it will be handled here (ex : https://thissitedoesnotexist.com/ )
         */
        const handleRejection = (error: any, url: string, element: IAsyncHTMLElement) => {
            debug(`Error accessing {$absoluteUrl}. ${JSON.stringify(error)}`);

            return context.report(url, element, 'Broken link found (domain not found).');
        };

        /**
         * The callback to handle success handler returned from the `head` method
         * We will check the response status againist the brokenStatusCodes list
         * and report if it exist there. We will also add it to the fetchedUrls
         * so that duplicate requests will not be made if 2 links have the same href value
         */
        const handleSuccess = (networkData: NetworkData, url: string, element: IAsyncHTMLElement) => {
            const statusIndex = brokenStatusCodes.indexOf(
                networkData.response.statusCode
            );

            if (statusIndex > -1) {
                return context.report(url, element, `Broken link found (${brokenStatusCodes[statusIndex]} response).`);
            }

            fetchedUrls.push({ status: networkData.response.statusCode, url });

            return Promise.resolve();
        };

        /**
         * Checks a URL against the fetchedUrls array and return the entry if it exist
         * The entry has 2 properties, the `url` and the `statusCode`
         */
        const getFetchedUrl = (url: string) => {

            const filteredItems = fetchedUrls.filter((value) => {
                return value.url === url;
            });

            if (filteredItems.length) {
                return filteredItems[0];
            }

            return null;
        };

        /**
         * The callback to handle when an element is visited
         * We will get the url(href,src etc) and check if it is available online
         * We do not need to check the items received from fetch::end::* event
         */
        const collectElementSrcs = (traverseElement: ElementFound): void => {
            const { element } = traverseElement;
            const simpleAttributes: Array<string> = ['src', 'poster', 'data', 'href'];

            const urls: Array<string> = simpleAttributes.reduce((found: Array<string>, attribute: string) => {
                const value: string = element.getAttribute(attribute);

                if (value) {
                    found.push(value);
                }

                return found;
            }, []);

            const srcset: Array<string> = parseSrcSet(element.getAttribute('srcset'));

            if (srcset.length > 0) {
                urls.push(...srcset);
            }

            collectedElementsWithUrls.push([element, urls]);
        };

        /**
         * Handler for fetch::end::* event.
         * We will store the request url and response status code in fetchedUrls array
         */
        const validateFetchEnd = (fetchEnd: any) => {
            fetchedUrls.push({ statusCode: fetchEnd.response.statusCode, url: fetchEnd.resource });
        };

        const createReports = (element: IAsyncHTMLElement, urls: Array<string>, resource: string, hrefAttribute: null | string): Array<Promise<void>> => {
            return urls.map((url) => {
                const isRelativeUrl = (!url.startsWith('/') && URL.parse(url).hostname === null);
                const fullUrl = (isRelativeUrl && hrefAttribute !== null) ?
                    URL.resolve(resource, hrefAttribute + url) :
                    URL.resolve(resource, url);

                const fetched = getFetchedUrl(fullUrl);

                if (fetched) {
                    const statusIndex = brokenStatusCodes.indexOf(fetched.statusCode);

                    if (statusIndex > -1) {
                        return context.report(fullUrl, null, `Broken link found (${brokenStatusCodes[statusIndex]} response).`);
                    }
                } else {
                    // An element which was not present in the fetch end results
                    return requester
                        .get(fullUrl)
                        .then((value: NetworkData) => {
                            return handleSuccess(value, fullUrl, element);
                        })
                        .catch((error: any) => {
                            return handleRejection(error, fullUrl, element);
                        });
                }

                return Promise.resolve();
            });
        };

        const validateCollectedUrls = async (event: TraverseEnd) => {
            const { resource } = event;
            const pageDOM: IAsyncHTMLDocument = context.pageDOM as IAsyncHTMLDocument;
            const baseTags: Array<IAsyncHTMLElement> = await pageDOM.querySelectorAll('base');
            const hrefAttribute = (baseTags.length === 0) ? null : baseTags[0].getAttribute('href');

            const reports: Array<Promise<void>> = collectedElementsWithUrls.reduce<Promise<void>[]>((accumulatedReports, [element, urls]) => {
                return [...accumulatedReports, ...createReports(element, urls, resource, hrefAttribute)];
            }, []);

            await Promise.all(reports);
        };

        context.on('element::img', collectElementSrcs);
        context.on('element::a', collectElementSrcs);
        context.on('element::audio', collectElementSrcs);
        context.on('element::video', collectElementSrcs);
        context.on('element::link', collectElementSrcs);
        context.on('element::script', collectElementSrcs);
        context.on('element::source', collectElementSrcs);
        context.on('element::track', collectElementSrcs);
        context.on('element::object', collectElementSrcs);
        context.on('fetch::end::*', validateFetchEnd);
        context.on('traverse::end', validateCollectedUrls);
    }
}
