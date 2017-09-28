/**
 * @fileoverview Check if responses contain certain disallowed HTTP headers.
 */

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

import * as pluralize from 'pluralize';

import { Category } from '../../enums/category';
import { debug as d } from '../../utils/debug';
import { getIncludedHeaders, mergeIgnoreIncludeArrays } from '../../utils/rule-helpers';
import { IAsyncHTMLElement, IFetchEnd, IRule, IRuleBuilder } from '../../types'; // eslint-disable-line no-unused-vars
import { isDataURI } from '../../utils/misc';
import { RuleContext } from '../../rule-context';

const debug = d(__filename);

// ------------------------------------------------------------------------------
// Public
// ------------------------------------------------------------------------------

const rule: IRuleBuilder = {
    create(context: RuleContext): IRule {

        let disallowedHeaders: Array<string> = [
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

        const validate = async (fetchEnd: IFetchEnd) => {
            const { element, resource }: {element: IAsyncHTMLElement, resource: string} = fetchEnd;

            // This check does not make sense for data URI.

            if (isDataURI(resource)) {
                debug(`Check does not apply for data URI: ${resource}`);

                return;
            }

            const headers: Array<string> = getIncludedHeaders(fetchEnd.response.headers, disallowedHeaders);
            const numberOfHeaders: number = headers.length;

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
            category: Category.security,
            description: 'Disallow certain HTTP response headers'
        },
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
