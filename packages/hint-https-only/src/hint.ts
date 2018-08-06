/**
 * @fileoverview Verifies if a website is using HTTPS and if it has mixed content.
 */

import * as URL from 'url';

import { Category } from 'hint/dist/src/lib/enums/category';
import { HintContext } from 'hint/dist/src/lib/hint-context';

import { IHint, HintMetadata, FetchEnd, Response, ElementFound } from 'hint/dist/src/lib/types';
import { debug as d } from 'hint/dist/src/lib/utils/debug';
import { HintScope } from 'hint/dist/src/lib/enums/hintscope';
import isHTTPS from 'hint/dist/src/lib/utils/network/is-https';
import isDataURI from 'hint/dist/src/lib/utils/network/is-data-uri';

const debug: debug.IDebugger = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class HttpsOnlyHint implements IHint {
    private targetIsServedOverHTTPS: boolean = false;

    public static readonly meta: HintMetadata = {
        docs: {
            category: Category.security,
            description: `Verifies if a website is using HTTPS and if it has mixed content.`
        },
        id: 'https-only',
        schema: [],
        scope: HintScope.site
    }

    public constructor(context: HintContext) {
        let target: string;
        const reportedUrls: Set<string> = new Set();

        const validateTarget = async (fetchEvent: FetchEnd): Promise<void> => {
            const { resource } = fetchEvent;

            if (!isHTTPS(resource)) {
                debug('HTTPS no detected');

                await context.report(resource, null, 'Site should be served over HTTPS.');

                return;
            }

            debug('HTTPS detected');

            this.targetIsServedOverHTTPS = true;

            return;
        };

        const reportInsecureHops = (response: Response): Array<Promise<void>> => {
            const { hops } = response;

            return hops.map((hop) => {
                const fails: boolean = !reportedUrls.has(hop) && !isHTTPS(hop);

                if (fails) {
                    reportedUrls.add(hop);

                    return context.report(hop, null, `Should not be redirected from HTTPS.`);
                }

                return Promise.resolve();
            });
        };

        const validateFetchEnd = async (fetchEnd: FetchEnd) => {
            // We are assuming the first `fetch::end` event recieved is the target url.
            if (!target) {
                target = fetchEnd.resource;

                await validateTarget(fetchEnd);

                return;
            }

            if (!this.targetIsServedOverHTTPS) {
                return;
            }

            const { resource, response } = fetchEnd;

            await Promise.all(reportInsecureHops(response));

            if (!reportedUrls.has(resource) && !isHTTPS(resource) && !isDataURI(resource)) {
                reportedUrls.add(resource);

                await context.report(resource, null, 'Should be served over HTTPS.');
            }
        };

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
         * There are elements that don't trigger a download automatically. We have to check the
         * HTML manually to validate these. E.g.:
         *
         * ```html
         * <video width="480" controls poster="http://ia800502.us.archive.org/10/items/WebmVp8Vorbis/webmvp8.gif" >
         *     <source src="https://archive.org/download/WebmVp8Vorbis/webmvp8_512kb.mp4" type="video/mp4">
         *     <source src="http://ia800502.us.archive.org/10/items/WebmVp8Vorbis/webmvp8.ogv" type="video/ogg">
         * </video>
         * ```
         *
         * If the connector understands `video/mp4`, it will use it as the source for the
         * video but `hint` will still flag that the `ogv` video is served over HTTP
         * (as well as the `poster`).
         */
        const validateElementSrcs = async (traverseElement: ElementFound): Promise<void> => {
            const { element, resource } = traverseElement;
            /*
             * Possible URL sources:
             *
             * * <img>, <audio>, <video>, <source> and <track> can have a `src` attribute.
             *   E.g.: <img src="http://example.com/image.jpg">
             *
             * * <img> and <source> can have a `srcset` attribute.
             *   https://developer.mozilla.org/en-US/docs/Web/HTML/Element/source
             *   E.g.: <img src="image-src.png" srcset="image-1x.png 1x, image-2x.png 2x">
             *
             * * <video>  can have a `poster` attribute.
             *   E.g.: <video width="480" controls poster="https://archive.org/download/WebmVp8Vorbis/webmvp8.gif" />
             *
             * * <object> has a `data` attribute.
             *   E.g.: <object data="movie.swf" type="application/x-shockwave-flash"></object>
             *   https://developer.mozilla.org/en-US/docs/Web/HTML/Element/object
             */

            const simpleAttributes: Array<string> = [
                'src',
                'poster',
                'data'
            ];

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

            const reports: Array<Promise<void>> = urls.map((url) => {
                const fullUrl = URL.resolve(resource, url);

                if (!isHTTPS(fullUrl) && !isDataURI(fullUrl) && !reportedUrls.has(fullUrl)) {
                    reportedUrls.add(fullUrl);

                    return context.report(fullUrl, null, 'Should be served over HTTPS.');
                }

                return Promise.resolve();
            });

            await Promise.all(reports);
        };

        context.on('fetch::end::*', validateFetchEnd);
        context.on('element::img', validateElementSrcs);
        context.on('element::audio', validateElementSrcs);
        context.on('element::video', validateElementSrcs);
        context.on('element::source', validateElementSrcs);
        context.on('element::track', validateElementSrcs);
        context.on('element::object', validateElementSrcs);
    }
}
