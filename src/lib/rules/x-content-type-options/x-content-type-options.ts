/**
 * @fileoverview Check if responses are served with the
 * `X-Content-Type-Options` HTTP response header.
 */

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

import { IFetchEndEvent, IRule, IRuleBuilder } from '../../types'; // eslint-disable-line no-unused-vars
import { normalizeString } from '../../utils/misc';
import { RuleContext } from '../../rule-context'; // eslint-disable-line no-unused-vars

// ------------------------------------------------------------------------------
// Public
// ------------------------------------------------------------------------------

const rule: IRuleBuilder = {
    create(context: RuleContext): IRule {

        const validate = async (fetchEnd: IFetchEndEvent) => {
            const { element, resource, response } = fetchEnd;
            const headerValue = normalizeString(response.headers && response.headers['x-content-type-options']);

            if (headerValue === null) {
                await context.report(resource, element, `'x-content-type-options' header was not specified`);

                return;
            }

            if (headerValue !== 'nosniff') {
                await context.report(resource, element, `'x-content-type-options' header value (${headerValue}) is invalid`);
            }
        };

        return {
            'fetch::end': validate,
            'manifestfetch::end': validate,
            'targetfetch::end': validate
        };
    },
    meta: {
        docs: {
            category: 'security',
            description: `Require 'X-Content-Type-Options' header`
        },
        fixable: 'code',
        recommended: true,
        schema: [],
        worksWithLocalFiles: false
    }
};

module.exports = rule;
