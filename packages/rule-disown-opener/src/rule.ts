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

import { isSupported } from 'caniuse-api';
import * as pluralize from 'pluralize';

import { Category } from 'sonarwhal/dist/src/lib/enums/category';
import { cutString, isRegularProtocol, sameOrigin } from 'sonarwhal/dist/src/lib/utils/misc';
import { debug as d } from 'sonarwhal/dist/src/lib/utils/debug';
import { IAsyncHTMLElement, ElementFound, IRule, RuleMetadata } from 'sonarwhal/dist/src/lib/types';
import { normalizeString } from 'sonarwhal/dist/src/lib/utils/misc';
import { RuleContext } from 'sonarwhal/dist/src/lib/rule-context';
import { RuleScope } from 'sonarwhal/dist/src/lib/enums/rulescope';

const debug = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class DisownOpenerRule implements IRule {

    public static readonly meta: RuleMetadata = {
        docs: {
            category: Category.security,
            description: 'Require `noopener` (and `noreferrer`) on `a` and `area` element with target="_blank"'
        },
        id: 'disown-opener',
        schema: [{
            additionalProperties: false,
            properties: { includeSameOriginURLs: { type: 'boolean' } },
            type: ['object', null]
        }],
        scope: RuleScope.any
    }

    public constructor(context: RuleContext) {

        let includeSameOriginURLs: boolean = false;

        const loadRuleConfigs = () => {
            includeSameOriginURLs = (context.ruleOptions && context.ruleOptions.includeSameOriginURLs) || false;
        };

        const checkForRelValues = async (resource: string, element: IAsyncHTMLElement, relValuesToCheckFor: Array<string>) => {
            const relValues: Array<string> = normalizeString(element.getAttribute('rel'), '').split(' ');
            const hrefValue: string = normalizeString(element.getAttribute('href'));

            const requiredValues: Array<string> = relValuesToCheckFor.filter((value) => {
                return !relValues.includes(value);
            });

            if (requiredValues.length !== 0) {
                await context.report(resource, element, `'${cutString(await element.outerHTML(), 100)}' is missing 'rel' ${pluralize('value', requiredValues.length)} '${requiredValues.join('\', \'')}'`, hrefValue);
            }
        };

        const checkSameOrigin = (resource: string, element: IAsyncHTMLElement): boolean => {
            const hrefValue: string = normalizeString(element.getAttribute('href'));

            const fullURL: string = new URL(hrefValue, resource).href;

            /*
             * Same origin URLs are ignored by default, but users can
             * change that by setting `includeSameOriginURLs` to `true`.
             */

            if (sameOrigin(resource, fullURL) && !includeSameOriginURLs) {
                debug('Is same origin');

                return false;
            }

            return true;

        };

        const hasHrefValue = (element: IAsyncHTMLElement): boolean => {
            if (normalizeString(element.getAttribute('href')) !== null) {
                return true;
            }

            debug(`'href' is not specified`);

            return false;
        };

        const elementHrefHasRequiredProtocol = (element: IAsyncHTMLElement): boolean => {
            const hrefValue: string = element.getAttribute('href');

            return isRegularProtocol(hrefValue);
        };

        const hasTargetBlank = (element: IAsyncHTMLElement): boolean => {
            if (normalizeString(element.getAttribute('target')) === '_blank') {
                return true;
            }

            debug('No `target="_blank"` found');

            return false;
        };

        const validate = async (data: ElementFound) => {
            const { element, resource }: { element: IAsyncHTMLElement, resource: string } = data;

            if (!hasTargetBlank(element) ||
                !hasHrefValue(element) ||
                !elementHrefHasRequiredProtocol(element) ||
                !checkSameOrigin(resource, element)) {

                return;
            }

            /*
             * TODO: In the future, change this to not use caniuse data.
             * https://github.com/sonarwhal/sonarwhal/issues/30
             */

            const targetedBrowsers: string = context.targetedBrowsers.join();
            const relValuesToCheckFor: Array<string> = ['noopener'];

            /*
             * If no browsers were targeted, or `noopener`
             * is not supported by all targeted browsers,
             * also check for 'noreferrer'.
             */

            if (!targetedBrowsers || !isSupported('rel-noopener', targetedBrowsers)) {
                relValuesToCheckFor.push('noreferrer');
            }

            await checkForRelValues(resource, element, relValuesToCheckFor);
        };

        loadRuleConfigs();

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
