/**
 * @fileoverview This rule makes sure that all links are no links using
 * instead of http or https.
 */

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

import { debug as d } from '../../utils/debug';
import { IElementFoundEvent, IRule, IRuleBuilder } from '../../interfaces'; // eslint-disable-line no-unused-vars
import { RuleContext } from '../../rule-context'; // eslint-disable-line no-unused-vars

const debug = d(__filename);

// ------------------------------------------------------------------------------
// Public
// ------------------------------------------------------------------------------

const rule: IRuleBuilder = {
    create(context: RuleContext): IRule {


        const validate = async (data: IElementFoundEvent) => {
            const { element, resource } = data;
            const html = await element.outerHTML();

            debug(`Analyzing link\n${html}`);

            // We need to use getAttribute to get the exact value.
            // If we access the src or href properties directly the
            // browser already adds http(s):// so we cannot verify.

            const url = element.getAttribute('src') || element.getAttribute('href') || '';

            if (url.indexOf('//') === 0) {
                debug('Invalid link found');

                const location = await context.findProblemLocation(element, url);

                await context.report(resource, element, `Invalid link found: ${url}`, location);
            }
        };

        return {
            'element::a': validate,
            'element::link': validate,
            'element::script': validate
        };

    },
    meta: {
        docs: {
            category: 'security',
            description: 'Use https over //',
            recommended: true
        },
        fixable: 'code',
        schema: [] // no options
    }
};

export default rule;
