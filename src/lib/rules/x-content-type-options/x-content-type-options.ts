/**
 * @fileoverview Check if responses are served with the
 * `X-Content-Type-Options` HTTP response header.
 */

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

import { IFetchEndEvent, IRule, IRuleBuilder } from '../../types'; // eslint-disable-line no-unused-vars
import { RuleContext } from '../../rule-context'; // eslint-disable-line no-unused-vars

// ------------------------------------------------------------------------------
// Public
// ------------------------------------------------------------------------------

const rule: IRuleBuilder = {
    create(context: RuleContext): IRule {

        const validate = (fetchEnd: IFetchEndEvent) => {
            const { element, resource, response } = fetchEnd;
            const headerValue = (response.headers && response.headers['x-content-type-options']);

            if (typeof headerValue === 'undefined') {
                context.report(resource, element, `Resource served without the 'X-Content-Type-Options' HTTP response header`);

                return;
            }

            if (headerValue.toLowerCase() !== 'nosniff') {
                context.report(resource, element, `Resource served with invalid value ('${headerValue}') for the 'X-Content-Type-Options' HTTP response header`);
            }
        };

        return {
            'fetch::end': validate,
            'targetfetch::end': validate
        };
    },
    meta: {
        docs: {
            category: 'security',
            description: `Require 'X-Content-Type-Options' HTTP response header`
        },
        fixable: 'code',
        recommended: true,
        schema: [],
        worksWithLocalFiles: false
    }
};

module.exports = rule;
