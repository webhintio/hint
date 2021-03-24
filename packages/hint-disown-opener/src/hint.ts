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

import { debug as d } from '@hint/utils-debug';
import { isSupported } from '@hint/utils-compat-data';
import { isRegularProtocol } from '@hint/utils-network';
import { normalizeString } from '@hint/utils-string';
import { HTMLElement } from '@hint/utils-dom';
import { ElementFound, IHint } from 'hint/dist/src/lib/types';
import { HintContext } from 'hint/dist/src/lib/hint-context';
import { Severity } from '@hint/utils-types';

import meta from './meta';
import { getMessage } from './i18n.import';

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

        const checkForRelValue = (resource: string, element: HTMLElement, relValueToCheckFor: string, severity: Severity) => {
            const relValues: string[] = normalizeString(element.getAttribute('rel'), '')!.split(' '); // `normalizeString` uses passed default ('') instead of null
            const hrefValue: string = normalizeString(element.getAttribute('href')) || '';

            if (relValues.includes(relValueToCheckFor)) {
                return;
            }

            const message = getMessage('shouldHaveRel', context.language, relValueToCheckFor);

            context.report(
                resource,
                message,
                {
                    content: hrefValue, element,
                    severity
                }
            );
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

            checkForRelValue(resource, element, 'noopener', Severity.error);

            /*
             * If no browsers were targeted, or `noopener`
             * is not supported by all targeted browsers,
             * also check for 'noreferrer'.
             */

            if (!context.targetedBrowsers.length || !isSupported({ attribute: 'rel', element: element.nodeName.toLowerCase(), value: 'noopener' }, context.targetedBrowsers)) {
                checkForRelValue(resource, element, 'noreferrer', Severity.warning);
            }
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
