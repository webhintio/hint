/**
 * @fileoverview Verifies if a website is using HTTPS and if it has mixed content.
 */

import * as URL from 'url';

import { ElementFound, FetchEnd, HintContext, IHint, Response } from 'hint';
import { debug as d, network } from '@hint/utils';

import meta from './meta';
import { getMessage } from './i18n.import';

const { isDataURI, isHTTPS } = network;
const debug: debug.IDebugger = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class HttpsOnlyHint implements IHint {
    private targetIsServedOverHTTPS: boolean = false;

    public static readonly meta = meta;

    public constructor(context: HintContext) {
        let target: string;
        const reportedUrls: Set<string> = new Set();

        const validateTarget = (fetchEvent: FetchEnd) => {
            const { resource } = fetchEvent;

            if (!isHTTPS(resource)) {
                debug(getMessage('httpsNoDetected', context.language));

                context.report(resource, getMessage('siteShouldBeHTTPS', context.language));

                return;
            }

            debug(getMessage('httpsDetected', context.language));

            this.targetIsServedOverHTTPS = true;
        };

        const reportInsecureHops = (response: Response) => {
            const { hops } = response;

            return hops.forEach((hop) => {
                const fails: boolean = !reportedUrls.has(hop) && !isHTTPS(hop);

                if (fails) {
                    reportedUrls.add(hop);

                    context.report(hop, getMessage('shouldNotBeRedirected', context.language));
                }
            });
        };

        const validateFetchEnd = (fetchEnd: FetchEnd) => {
            // We are assuming the first `fetch::end` event recieved is the target url.
            if (!target) {
                target = fetchEnd.resource;

                validateTarget(fetchEnd);

                return;
            }

            if (!this.targetIsServedOverHTTPS) {
                return;
            }

            const { resource, response } = fetchEnd;

            reportInsecureHops(response);

            if (!reportedUrls.has(resource) && !isHTTPS(resource) && !isDataURI(resource)) {
                reportedUrls.add(resource);

                context.report(resource, getMessage('shouldBeHTTPS', context.language));
            }
        };

        /** Returns an array with all the URLs in the given `srcset` attribute or an empty string if none. */
        const parseSrcSet = (srcset: string | null): string[] => {
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
        const validateElementSrcs = (traverseElement: ElementFound) => {
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

            const simpleAttributes: string[] = [
                'src',
                'poster',
                'data'
            ];

            const urls: string[] = simpleAttributes.reduce((found: string[], attribute: string) => {
                const value: string | null = element.getAttribute(attribute);

                if (value) {
                    found.push(value);
                }

                return found;
            }, []);

            const srcset: string[] = parseSrcSet(element.getAttribute('srcset'));

            if (srcset.length > 0) {
                urls.push(...srcset);
            }

            urls.forEach((url) => {
                const fullUrl = URL.resolve(resource, url);

                if (!isHTTPS(fullUrl) && !isDataURI(fullUrl) && !reportedUrls.has(fullUrl)) {
                    reportedUrls.add(fullUrl);

                    context.report(fullUrl, getMessage('shouldBeHTTPS', context.language));
                }
            });
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
