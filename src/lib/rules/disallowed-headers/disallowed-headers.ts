/**
 * @fileoverview Check if responses contain certain disallowed HTTP headers.
 */

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

import { IFetchEndEvent, IRule, IRuleBuilder } from '../../interfaces'; // eslint-disable-line no-unused-vars
import { RuleContext } from '../../rule-context'; // eslint-disable-line no-unused-vars
import { getIncludedHeaders, mergeIgnoreIncludeArrays } from '../../utils/rule-helpers';

// ------------------------------------------------------------------------------
// Public
// ------------------------------------------------------------------------------

const rule: IRuleBuilder = {
    create(context: RuleContext): IRule {

        let disallowedHeaders = [
            'server',
            'x-aspnet-version',
            'x-aspnetmvc-version',
            'x-powered-by',
            'x-runtime',
            'x-version'
        ];

        const loadRuleConfigs = () => {
            const includeHeaders = (context.ruleOptions && context.ruleOptions.include) || [];
            const ignoreHeaders = (context.ruleOptions && context.ruleOptions.ignore) || [];

            disallowedHeaders = mergeIgnoreIncludeArrays(disallowedHeaders, ignoreHeaders, includeHeaders);
        };

        const validate = (fetchEnd: IFetchEndEvent) => {
            const { element, resource } = fetchEnd;
            const headers = getIncludedHeaders(fetchEnd.response.headers, disallowedHeaders);

            if (headers.length > 0) {
                context.report(resource, element, `Disallowed HTTP header${headers.length > 1 ? 's' : ''} found: ${headers.join(', ')}`);
            }
        };

        loadRuleConfigs();

        return {
            'fetch::end': validate,
            'targetfetch::end': validate
        };
    },
    meta: {
        docs: {
            category: 'security',
            description: 'Disallow certain HTTP headers',
            recommended: true
        },
        fixable: 'code',
        schema: {
            additionalProperties: false,
            definitions: {
                'string-array': {
                    items: { type: 'string' },
                    minItems: 1,
                    type: 'array',
                    uniqueItems: true
                }
            },
            properties: {
                ignore: { $ref: '#/definitions/string-array' },
                include: { $ref: '#/definitions/string-array' }
            },
            type: ['object', null]
        }
    }
};

module.exports = rule;
