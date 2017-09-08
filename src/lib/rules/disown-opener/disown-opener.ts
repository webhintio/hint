/**
 * @fileoverview Check if `rel="noopener noreferrer"` was specified
 * on `a` and `area` elements that have `target="_blank"` and link to
 * other origins.
 */

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

import * as url from 'url';

import { isSupported } from 'caniuse-api';
import * as pluralize from 'pluralize';
import * as sameOrigin from 'same-origin';

import { cutString, isRegularProtocol } from '../../utils/misc';
import { debug as d } from '../../utils/debug';
import { IAsyncHTMLElement, IElementFound, IRule, IRuleBuilder } from '../../types';
import { normalizeString } from '../../utils/misc';
import { RuleContext } from '../../rule-context';

const debug = d(__filename);

// ------------------------------------------------------------------------------
// Public
// ------------------------------------------------------------------------------

const rule: IRuleBuilder = {
    create(context: RuleContext): IRule {

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

            let fullURL: string = hrefValue;

            if (!url.parse(hrefValue).protocol) {
                fullURL = url.resolve(resource, hrefValue);
            }

            // Same origin URLs are ignored by default, but users can
            // change that by setting `includeSameOriginURLs` to `true`.

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

        const validate = async (data: IElementFound) => {
            const { element, resource }: { element: IAsyncHTMLElement, resource: string } = data;

            if (!hasTargetBlank(element) ||
                !hasHrefValue(element) ||
                !elementHrefHasRequiredProtocol(element) ||
                !checkSameOrigin(resource, element)) {

                return;
            }

            // TODO: In the future, change this to not use caniuse data.
            // https://github.com/sonarwhal/sonar/issues/30

            const targetedBrowsers: string = context.targetedBrowsers.join();
            const relValuesToCheckFor: Array<string> = ['noopener'];

            // If no browsers were targeted, or `noopener`
            // is not supported by all targeted browsers,
            // also check for 'noreferrer'.

            if (!targetedBrowsers || !isSupported('rel-noopener', targetedBrowsers)) {
                relValuesToCheckFor.push('noreferrer');
            }

            await checkForRelValues(resource, element, relValuesToCheckFor);
        };

        loadRuleConfigs();

        // `noopener` and `noreferrer` work only with the
        // `a` and `area` elements:
        //
        //   * https://html.spec.whatwg.org/#link-type-noopener
        //   * https://html.spec.whatwg.org/#link-type-noreferrer
        //   * https://html5sec.org/#143
        //
        // In the future there may be a CSP valueless property:
        //
        //   * https://github.com/w3c/webappsec/issues/139

        return {
            'element::a': validate,
            'element::area': validate
        };
    },
    meta: {
        docs: {
            category: 'security',
            description: 'Require `noopener` (and `noreferrer`) on `a` and `area` element with target="_blank"'
        },
        fixable: 'code',
        recommended: true,
        schema: [{
            additionalProperties: false,
            properties: { includeSameOriginURLs: { type: 'boolean' } },
            type: ['object', null]
        }],
        worksWithLocalFiles: true
    }
};

export default rule;
