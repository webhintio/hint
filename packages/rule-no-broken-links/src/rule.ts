/**
 * @fileoverview This rule verifies that all links and resources the page
 * uses are available online. Checks for 404, 410, 500 or 503 status
 */

import * as URL from 'url';
import { Category } from 'sonarwhal/dist/src/lib/enums/category';
import { RuleContext } from 'sonarwhal/dist/src/lib/rule-context';
import {
    IRule,
    ElementFound,
    RuleMetadata,
    IAsyncHTMLElement
} from 'sonarwhal/dist/src/lib/types';
import { debug as d } from 'sonarwhal/dist/src/lib/utils/debug';
import { RuleScope } from 'sonarwhal/dist/src/lib/enums/rulescope';
import { Requester } from 'sonarwhal/dist/src/lib/connectors/utils/requester';
import { NetworkData } from 'sonarwhal/dist/src/lib/types';
import { CoreOptions } from 'request';
const debug: debug.IDebugger = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class NoBrokenLinksRule implements IRule {
    public static readonly meta: RuleMetadata = {
        docs: {
            category: Category.other,
            description: `Rule to flag broken links in the page`
        },
        id: 'no-broken-links',
        schema: [],
        scope: RuleScope.site
    };

    public constructor(context: RuleContext) {

        const options: CoreOptions = { method: 'HEAD' };
        const requester = new Requester(options);
        const brokenStatusCodes = [404, 410, 500, 503];

        /** Stores the urls and it's response status codes */
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

            return context.report(url, element, 'Broken link found (domain not found)');
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
                return context.report(url, element, `Broken link found (${brokenStatusCodes[statusIndex]} response)`);
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
        const validateElementSrcs = async (traverseElement: ElementFound): Promise<void> => {
            const { element, resource } = traverseElement;
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

            const reports: Array<Promise<void>> = urls.map(async (url) => {
                const fullUrl = URL.resolve(resource, url);

                const fetched = getFetchedUrl(fullUrl);

                if (fetched) {
                    const statusIndex = brokenStatusCodes.indexOf(fetched.statusCode);

                    if (statusIndex > -1) {
                        return context.report(fullUrl, null, `Broken link found (${brokenStatusCodes[statusIndex]} response)`);
                    }
                } else {
                    // An element which was not present in the fetch end results
                    return await requester
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

            await Promise.all(reports);
        };

        /**
         * Handler for fetch::end::* event.
         * We will store the request url and response status code in fetchedUrls array
         */
        const validateFetchEnd = (fetchEnd: any) => {
            fetchedUrls.push({ statusCode: fetchEnd.response.statusCode, url: fetchEnd.resource });
        };

        context.on('element::img', validateElementSrcs);
        context.on('element::a', validateElementSrcs);
        context.on('element::audio', validateElementSrcs);
        context.on('element::video', validateElementSrcs);
        context.on('element::source', validateElementSrcs);
        context.on('element::track', validateElementSrcs);
        context.on('element::object', validateElementSrcs);
        context.on('fetch::end::*', validateFetchEnd);
    }
}
