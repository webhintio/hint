/**
 * @fileoverview This rule makes sure that all links are no links using //
 * instead of http or https.
 * @author Anton Molleda (@molant)
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
    /** Creates a new instance of this rule with a given context (configuration, etc.) */
    create(context: RuleContext): IRule {

        /*
            We need to use getAttribute to get the exact value.
            If we access the src or href properties directly the browser already adds
            http(s):// so we cannot verify
        */
        const validate = async (data: IElementFoundEvent) => {
            const { element, resource } = data;
            const html = await element.outerHTML();

            debug(`Analyzing link\n${html}`);
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
