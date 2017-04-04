/**
 * @fileoverview Check if responses contain certain disallowed HTTP headers.
 */

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

import { Rule, RuleBuilder, ElementFoundEvent } from '../../types'; // eslint-disable-line no-unused-vars
import { RuleContext } from '../../rule-context'; // eslint-disable-line no-unused-vars

const debug = require('debug')('sonar:rules:disallowed-headers'); // eslint-disable-line no-unused-vars

// ------------------------------------------------------------------------------
// Public
// ------------------------------------------------------------------------------

const rule: RuleBuilder = {
    create(context: RuleContext): Rule {

        let disallowedHeaders = [
            'server',
            'x-aspnet-version',
            'x-aspnetmvc-version',
            'x-powered-by',
            'x-runtime',
            'x-version'
        ];

        const init = () => {

            let includeHeaders = (context.ruleOptions && context.ruleOptions.include) || [];
            let ignoreHeaders = (context.ruleOptions && context.ruleOptions.ignore) || [];

            includeHeaders = includeHeaders.map((e) => {
                return e.toLowerCase();
            });

            ignoreHeaders = ignoreHeaders.map((e) => {
                return e.toLowerCase();
            });

            // Add headers specified under 'include'.
            includeHeaders.forEach((e) => {
                if (!disallowedHeaders.includes(e)) {
                    disallowedHeaders.push(e);
                }
            });

            // Remove headers specified under 'ignore'.
            disallowedHeaders = disallowedHeaders.filter((e) => {
                return !ignoreHeaders.includes(e);
            });

        };

        const findDisallowedHeaders = (headers: object) => {
            const headersFound = [];

            for (const [key] of Object.entries(headers)) {
                if (disallowedHeaders.includes(key.toLowerCase())) {
                    headersFound.push(key);
                }
            }

            return headersFound;
        };

        const validate = (resource, networkData) => {
            const headers = findDisallowedHeaders(networkData.response.headers);

            if (headers.length > 0) {
                context.report(resource, null, `Disallowed HTTP header${headers.length > 1 ? 's' : ''} found: ${headers.join(', ')}`);
            }
        };

        init();

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
