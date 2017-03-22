/**
 * @fileoverview This rule makes sure that all links are no links using //
 * instead of http or https.
 * @author Anton Molleda (@molant)
 */

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

import { RuleContext } from '../../rule-context'; // eslint-disable-line no-unused-vars
import { Rule, RuleBuilder, ElementFoundEvent } from '../../types'; // eslint-disable-line no-unused-vars

const debug = require('debug')('sonar:rules:no-double-slash');

// ------------------------------------------------------------------------------
// Public
// ------------------------------------------------------------------------------

const rule: RuleBuilder = {
    /** Creates a new instance of this rule with a given context (configuration, etc.) */
    create(context: RuleContext): Rule {

        /*
            We need to use getAttribute to get the exact value.
            If we access the src or href properties directly the browser already adds
            http(s):// so we cannot verify
        */
        const validate = async (data: ElementFoundEvent) => {
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
            category: 'Security',
            description: 'Use https over //',
            recommended: true
        },
        fixable: 'code',
        schema: [] // no options
    }
};

module.exports = rule;
