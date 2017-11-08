/**
 * @fileoverview Checks if there are unnecesary redirects when accessign resources
 */

import * as pluralize from 'pluralize';

import { Category } from '../../enums/category';
import { RuleContext } from '../../rule-context';
// The list of types depends on the events you want to capture.
import { IRule, IRuleBuilder, IFetchEnd } from '../../types';
import { cutString } from '../../utils/misc';

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

const rule: IRuleBuilder = {
    create(context: RuleContext): IRule {
        /** The maximum number of hops for a resource. */
        const maxResourceHops: number = context.ruleOptions && context.ruleOptions['max-resource-redirects'] || 0;
        /** The maximum number of hops for the target. */
        const maxTargetHops: number = context.ruleOptions && context.ruleOptions['max-target-redirects'] || 0;

        /**
         * Returns a function that will validate if the number of hops is within the limit passed by `maxHops`.
         * If it doesn't validate, it will notify the context.
         *
         * Ex.: `validateRequestEnd(10)(fetchEnd)` will verify if the event `fetchEnd` has had less than 10 hops.
         */
        const validateRequestEnd = (maxHops: number) => {
            return async (fetchEnd: IFetchEnd) => {
                const { request, response, element } = fetchEnd;

                if (response.hops.length > maxHops) {
                    await context.report(request.url, element, `${response.hops.length} ${pluralize('redirect', response.hops.length)} detected for ${cutString(request.url)} (max is ${maxHops}).`);
                }
                // Code to validate the rule on the event fetch::end.
            };
        };

        return {
            'fetch::end': validateRequestEnd(maxResourceHops),
            'targetfetch::end': validateRequestEnd(maxTargetHops)
        };
    },
    meta: {
        docs: {
            category: Category.performance,
            description: `Checks if there are unnecesary redirects when accessign resources`
        },
        recommended: true,
        schema: [{
            additionalProperties: false,
            properties: {
                'max-resource-redirects': {
                    minimum: 0,
                    type: 'integer'
                },
                'max-target-redirects': {
                    minimum: 0,
                    type: 'integer'
                }
            },
            type: 'object'
        }],
        worksWithLocalFiles: false
    }
};

module.exports = rule;
