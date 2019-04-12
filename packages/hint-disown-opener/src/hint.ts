/**
 * @fileoverview Check if `rel="noopener noreferrer"` was specified
 * on `a` and `area` elements that have `target="_blank"` and link to
 * other origins.
 */

/*
 * ------------------------------------------------------------------------------
 * Requirements
 * ------------------------------------------------------------------------------
 */

import { URL } from 'url';

import { debug as d } from '@hint/utils/dist/src/debug';
import { isSupported } from '@hint/utils/dist/src/caniuse';
import { isRegularProtocol } from '@hint/utils/dist/src/network/is-regular-protocol';
import { HTMLElement } from '@hint/utils/dist/src/dom/html';
import { cutString } from '@hint/utils/dist/src/misc/cut-string';
import { normalizeString } from '@hint/utils/dist/src/misc/normalize-string';
import { prettyPrintArray } from '@hint/utils/dist/src/misc/pretty-print-array';
import { ElementFound, IHint } from 'hint/dist/src/lib/types';
import { HintContext } from 'hint/dist/src/lib/hint-context';

import meta from './meta';

const debug = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class DisownOpenerHint implements IHint {

    public static readonly meta = meta;

    public constructor(context: HintContext) {

        let includeSameOriginURLs: boolean = false;

        const loadHintConfigs = () => {
            includeSameOriginURLs = (context.hintOptions && context.hintOptions.includeSameOriginURLs) || false;
        };

        const checkForRelValues = (resource: string, element: HTMLElement, relValuesToCheckFor: string[]) => {
            const relValues: string[] = normalizeString(element.getAttribute('rel'), '')!.split(' '); // `normalizeString` uses passed default ('') instead of null
            const hrefValue: string = normalizeString(element.getAttribute('href')) || '';

            const requiredValues: string[] = relValuesToCheckFor.filter((value) => {
                return !relValues.includes(value);
            });

            if (requiredValues.length !== 0) {
                const message = `'${cutString(element.outerHTML, 100)}' should have 'rel' attribute value include ${prettyPrintArray(requiredValues)} ${requiredValues.length === 1 ? 'keyword' : 'keywords'}.`;

                context.report(resource, message, { content: hrefValue, element });
            }
        };

        const checkSameOrigin = (resource: string, element: HTMLElement): boolean => {
            const hrefValue: string = normalizeString(element.getAttribute('href')) || '';

            try {
                const fullURL: string = new URL(hrefValue, resource).href;

                /*
                 * Same origin URLs are ignored by default, but users can
                 * change that by setting `includeSameOriginURLs` to `true`.
                 */

                if ((new URL(resource).origin === new URL(fullURL).origin) && !includeSameOriginURLs) {
                    debug('Is same origin');

                    return false;
                }

                return true;
            } catch (e) {
                debug(e);

                // If `href` is not a valid URL (e.g.: "http://") we ignore it
                return true;
            }
        };

        const hasHrefValue = (element: HTMLElement): boolean => {
            if (normalizeString(element.getAttribute('href')) !== null) {
                return true;
            }

            debug(`'href' is not specified`);

            return false;
        };

        const elementHrefHasRequiredProtocol = (element: HTMLElement): boolean => {
            const hrefValue: string = element.getAttribute('href') || '';

            return isRegularProtocol(hrefValue);
        };

        const hasTargetBlank = (element: HTMLElement): boolean => {
            if (normalizeString(element.getAttribute('target')) === '_blank') {
                return true;
            }

            debug('No `target="_blank"` found');

            return false;
        };

        const validate = ({ element, resource }: ElementFound) => {
            if (!hasTargetBlank(element) ||
                !hasHrefValue(element) ||
                !elementHrefHasRequiredProtocol(element) ||
                !checkSameOrigin(resource, element)) {

                return;
            }

            /*
             * TODO: In the future, change this to not use caniuse data.
             * https://github.com/webhintio/hint/issues/30
             */

            const targetedBrowsers: string = context.targetedBrowsers.join();
            const relValuesToCheckFor: string[] = ['noopener'];

            /*
             * If no browsers were targeted, or `noopener`
             * is not supported by all targeted browsers,
             * also check for 'noreferrer'.
             */

            if (!targetedBrowsers || !isSupported('rel-noopener', targetedBrowsers)) {
                relValuesToCheckFor.push('noreferrer');
            }

            checkForRelValues(resource, element, relValuesToCheckFor);
        };

        loadHintConfigs();

        /*
         * `noopener` and `noreferrer` work only with the
         * `a` and `area` elements:
         *
         *   * https://html.spec.whatwg.org/#link-type-noopener
         *   * https://html.spec.whatwg.org/#link-type-noreferrer
         *   * https://html5sec.org/#143
         *
         * In the future there may be a CSP valueless property:
         *
         *   * https://github.com/w3c/webappsec/issues/139
         */

        context.on('element::a', validate);
        context.on('element::area', validate);
    }
}
