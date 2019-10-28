/**
 * @fileoverview This hint verifies that all links and resources the page
 * uses are available online. Checks for 404, 410, 500 or 503 status
 */

import {
    ElementFound,
    HintContext,
    IHint,
    NetworkData,
    TraverseEnd
} from 'hint';
import { debug as d, HTMLElement, network } from '@hint/utils';
import { Requester } from '@hint/utils-connector-tools';
import { CoreOptions } from 'request';

import meta from './meta';
import { getMessage } from './i18n.import';

const { isRegularProtocol } = network;
const debug: debug.IDebugger = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class NoBrokenLinksHint implements IHint {
    public static readonly meta = meta;

    public constructor(context: HintContext) {

        const options: CoreOptions = { method: context.hintOptions && context.hintOptions.method ? context.hintOptions.method : 'GET' };
        const requester = new Requester(options);
        const brokenStatusCodes = [404, 410, 500, 503];

        /** Stores the elements with their URLs which have been collected while traversing the page. */
        const collectedElementsWithURLs: [HTMLElement, string[]][] = [];

        /** Stores the URLs and it's response status codes */
        const fetchedURLs: any[] = [];

        /** Returns an array with all the URLs in the given `srcset` attribute or an empty string if none. */
        const parseSrcSet = (element: HTMLElement): string[] => {
            const srcset = element.getAttribute('srcset');

            if (!srcset) {
                return [];
            }

            /**
             * If present, its value must consist of one or more image candidate strings, each separated from
             * the next by a U+002C COMMA character (,). If an image candidate string contains no descriptors
             * and no ASCII whitespace after the URL, the following image candidate string, if there is one,
             * must begin with one or more ASCII whitespace.
             * https://html.spec.whatwg.org/multipage/images.html#srcset-attributes
             */
            const urls: string[] = [];
            const candidates = srcset.split(',');

            for (let i = 0; i < candidates.length; i++) {
                // First item is the URL, second the descriptor if present
                const [imageCandidate] = candidates[i].trim().split(' ');

                /**
                 * `data:image/png;base64,PHN2ZyB4bWxucz0iaHR0`
                 * In the case above `imageCandidate` will be
                 * `data:image/png;base64` and there won't be
                 * any descriptor as there are no spaces.
                 *
                 * The `data` will be the next item in `candidates`.
                 * Because data URIs don't have to be checked
                 * the next item can be skipped
                 */
                if (imageCandidate.startsWith('data:image')) {
                    i++;

                    continue;
                }

                const imageCandidateUrl = element.resolveUrl(imageCandidate.trim());

                if (isRegularProtocol(imageCandidateUrl)) {
                    urls.push(imageCandidateUrl);

                    continue;
                }
            }

            return urls;
        };

        /**
         * The callback to handle rejection returned from the `head` method
         * When DNS resolution fails, it will be handled here (ex : https://thissitedoesnotexist.com/ )
         */
        const handleRejection = (error: any, url: string, element: HTMLElement) => {
            debug(`Error accessing ${url}. ${JSON.stringify(error)}`);

            if (typeof error === 'string' && error.toLowerCase().includes('loop')) {
                return context.report(url, error, { element });
            }

            return context.report(url, getMessage('brokenLinkFound', context.language), { element });
        };

        const isDNSOnlyResourceHint = (element: HTMLElement): boolean => {
            if (element.nodeName.toLowerCase() !== 'link') {
                return false;
            }

            const relAttribute = element.getAttribute('rel');

            return (relAttribute === 'dns-prefetch' || relAttribute === 'preconnect');
        };

        /**
         * The callback to handle success handler returned from the `head` method
         * We will check the response status againist the brokenStatusCodes list
         * and report if it exist there. We will also add it to the fetchedURLs
         * so that duplicate requests will not be made if 2 links have the same href value
         */
        const handleSuccess = (networkData: NetworkData, url: string, element: HTMLElement) => {
            if (isDNSOnlyResourceHint(element)) {
                return null;
            }

            const statusIndex = brokenStatusCodes.indexOf(
                networkData.response.statusCode
            );

            if (statusIndex > -1) {
                const message = getMessage('brokenLinkFoundStatusCode', context.language, brokenStatusCodes[statusIndex].toString());

                return context.report(url, message, { element });
            }

            fetchedURLs.push({ status: networkData.response.statusCode, url });

            return null;
        };

        /**
         * Checks a URL against the fetchedURLs array and return the entry if it exist
         * The entry has 2 properties, the `url` and the `statusCode`
         */
        const getFetchedURL = (url: string) => {

            const filteredItems = fetchedURLs.filter((value) => {
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
            const simpleAttributes: string[] = ['src', 'poster', 'data', 'href'];

            const urls: string[] = simpleAttributes.reduce((found: string[], attribute: string) => {
                const value: string | null = element.getAttribute(attribute);

                if (value) {
                    try {
                        const url = element.resolveUrl(value);

                        found.push(url);
                    } catch (err) {
                        // `url` is malformed, e.g.: just "http://`
                        debug(err);

                        context.report(value, getMessage('invalidURL', context.language));
                    }
                }

                return found;
            }, []);

            const srcset: string[] = parseSrcSet(element);

            if (srcset.length > 0) {
                urls.push(...srcset);
            }

            collectedElementsWithURLs.push([element, urls]);
        };

        /**
         * Handler for fetch::end::* event.
         * We will store the request url and response status code in fetchedURLs array
         */
        const validateFetchEnd = (fetchEnd: any) => {
            fetchedURLs.push({ statusCode: fetchEnd.response.statusCode, url: fetchEnd.resource });
        };

        const createReports = (element: HTMLElement, urls: string[]): Promise<void>[] => {
            return urls.map((url) => {
                /*
                 * If the URL is not HTTP or HTTPS (e.g. `mailto:`),
                 * there is no need to validate.
                 */
                if (!isRegularProtocol(url)) {
                    return Promise.resolve();
                }

                const fetched = getFetchedURL(url);

                if (fetched) {
                    const statusIndex = brokenStatusCodes.indexOf(fetched.statusCode);

                    if (statusIndex > -1) {
                        context.report(url, getMessage('brokenLinkFoundStatusCode', context.language, brokenStatusCodes[statusIndex].toString()));

                        return Promise.resolve();
                    }
                } else {
                    // An element which was not present in the fetch end results
                    return requester
                        .get(url)
                        .then((value: NetworkData) => {
                            handleSuccess(value, url, element);
                        })
                        .catch((error: any) => {
                            return handleRejection(error, url, element);
                        });
                }

                return Promise.resolve();
            });
        };

        const validateCollectedURLs = async (event: TraverseEnd) => {
            const reports: Promise<void>[] = collectedElementsWithURLs.reduce<Promise<void>[]>((accumulatedReports, [element, urls]) => {
                return [...accumulatedReports, ...createReports(element, urls)];
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
        context.on('traverse::end', validateCollectedURLs);
    }
}
