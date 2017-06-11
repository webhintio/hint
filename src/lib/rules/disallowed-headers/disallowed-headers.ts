/**
 * @fileoverview Check if responses contain certain disallowed HTTP headers.
 */

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

import * as pluralize from 'pluralize';

import { getIncludedHeaders, mergeIgnoreIncludeArrays } from '../../utils/rule-helpers';
import { IFetchEndEvent, IRule, IRuleBuilder } from '../../types'; // eslint-disable-line no-unused-vars
import { RuleContext } from '../../rule-context'; // eslint-disable-line no-unused-vars

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

        const validate = async (fetchEnd: IFetchEndEvent) => {
            const { element, resource } = fetchEnd;
            const headers = getIncludedHeaders(fetchEnd.response.headers, disallowedHeaders);
            const numberOfHeaders = headers.length;

            if (numberOfHeaders > 0) {
                await context.report(resource, element, `'${headers.join('\', \'')}' ${pluralize('header', numberOfHeaders)} ${pluralize('is', numberOfHeaders)} disallowed`);
            }
        };

        loadRuleConfigs();

        return {
            'fetch::end': validate,
            'manifestfetch::end': validate,
            'targetfetch::end': validate
        };
    },
    meta: {
        docs: {
            category: 'security',
            description: 'Disallow certain HTTP response headers'
        },
        fixable: 'code',
        recommended: true,
        schema: [{
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
        }],
        worksWithLocalFiles: false
    }
};

module.exports = rule;
