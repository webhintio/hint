/**
 * @fileoverview Check if the `lang` attribute is specified on the
 * `html` element and has a non empty value.
 */

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

import { Rule, RuleBuilder, ElementFoundEvent } from '../../types'; // eslint-disable-line no-unused-vars
import { RuleContext } from '../../rule-context'; // eslint-disable-line no-unused-vars

const debug = require('debug')('sonar:rules:lang-attribute'); // eslint-disable-line no-unused-vars

// ------------------------------------------------------------------------------
// Public
// ------------------------------------------------------------------------------

const rule: RuleBuilder = {
    create(context: RuleContext): Rule {
        const validate = async (data: ElementFoundEvent) => {
            const { element, resource } = data;
            const langAttributeValue = element.getAttribute('lang');

            // Check if the `lang` attribute is specified.
            if (langAttributeValue === null) {
                await context.report(resource, element, `'lang' attribute not specified on the 'html' element`);

                return;
            }

            // Check if the `lang` has no value or the value is an empty string.
            if (langAttributeValue === '') {
                const location = await context.findProblemLocation(element, 'lang');

                await context.report(resource, element, `empty 'lang' attribute specified on the 'html' element`, location);
            }

        };

        return { 'element::html': validate };
    },
    meta: {
        docs: {
            category: 'a11y',
            description: 'Use `lang` attribute on `html` element',
            recommended: true
        },
        fixable: 'code',
        schema: []
    }
};

module.exports = rule;
