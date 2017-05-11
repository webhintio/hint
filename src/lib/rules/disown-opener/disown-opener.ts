/**
 * @fileoverview Check if `rel="noopener noreferrer"` was specified
 * on `a` and `area` elements that have `target="_blank"` and link to
 * other origins.
 */

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

import * as url from 'url';

import * as sameOrigin from 'same-origin';

import { debug as d } from '../../utils/debug';
import { IElementFoundEvent, IRule, IRuleBuilder } from '../../types'; // eslint-disable-line no-unused-vars
import { RuleContext } from '../../rule-context'; // eslint-disable-line no-unused-vars

const debug = d(__filename);

// ------------------------------------------------------------------------------
// Public
// ------------------------------------------------------------------------------

const rule: IRuleBuilder = {
    create(context: RuleContext): IRule {

        let includeSameOriginURLs = false;

        const loadRuleConfigs = () => {
            includeSameOriginURLs = (context.ruleOptions && context.ruleOptions.includeSameOriginURLs) || false;
        };

        const validate = async (data: IElementFoundEvent) => {
            const { element, resource } = data;

            if (element.getAttribute('target') !== '_blank') {
                debug('No `target="_blank"` found');

                return;
            }

            const hrefValue = element.getAttribute('href');

            if (hrefValue === null) {
                debug('`href` is not specified');

                return;
            }

            let fullURL = hrefValue;

            if (!url.parse(hrefValue).protocol) {
                fullURL = url.resolve(resource, hrefValue);
            }

            // Same origin URLs are ignored by default, but users can
            // change that by setting `includeSameOriginURLs` to `true`.

            if (sameOrigin(resource, fullURL) && !includeSameOriginURLs) {
                debug('Same origin not included and same origin link');

                return;
            }

            const relValues = (element.getAttribute('rel') || '').split(' ');
            const missingRelValues = [];

            // TODO: In the future, only recommended `noreferrer`
            // if target browsers don't support `noopener`.
            //
            // https://github.com/MicrosoftEdge/Sonar/issues/134

            ['noopener', 'noreferrer'].forEach((e) => {
                if (!relValues.includes(e)) {
                    missingRelValues.push(e);
                }
            });

            if (missingRelValues.length > 0) {
                const location = await context.findInElement(element, hrefValue);

                await context.report(resource, element, `Missing link type${missingRelValues.length === 1 ? '': 's'} on \`${await element.outerHTML()}\`: ${missingRelValues.join(', ')}`, location);
            }
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
            description: 'Use `noopener` and `noreferrer` on `a` and `area` element with target="_blank"',
            recommended: true
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
