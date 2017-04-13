/**
 * @fileoverview Check if the `lang` attribute is specified on the
 * `html` element and has a non empty value.
 */

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

import { IElementFoundEvent, IRule, IRuleBuilder } from '../../interfaces'; // eslint-disable-line no-unused-vars
import { RuleContext } from '../../rule-context'; // eslint-disable-line no-unused-vars
import { debug as d } from '../../util/debug';

const debug = d(__filename);

// ------------------------------------------------------------------------------
// Public
// ------------------------------------------------------------------------------

const rule: IRuleBuilder = {
    create(context: RuleContext): IRule {
        const validate = async (data: IElementFoundEvent) => {
            const { element, resource } = data;
            const langAttributeValue = element.getAttribute('lang');

            // Check if the `lang` attribute is specified.
            if (langAttributeValue === null) {
                const msg = `'lang' attribute not specified on the 'html' element`;

                debug(msg);
                await context.report(resource, element, msg);

                return;
            }

            // Check if the `lang` has no value or the value is an empty string.
            if (langAttributeValue === '') {
                const location = await context.findProblemLocation(element, 'lang');
                const msg = `empty 'lang' attribute specified on the 'html' element`;

                debug(msg);
                await context.report(resource, element, msg, location);
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

export default rule;
