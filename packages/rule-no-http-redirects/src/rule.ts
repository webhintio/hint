/**
 * @fileoverview Checks if there are unnecesary redirects when accessign resources
 */

import * as pluralize from 'pluralize';

import { Category } from 'sonarwhal/dist/src/lib/enums/category';
import { RuleContext } from 'sonarwhal/dist/src/lib/rule-context';
// The list of types depends on the events you want to capture.
import { IRule, IRuleBuilder, IFetchEnd } from 'sonarwhal/dist/src/lib/types';
import { cutString } from 'sonarwhal/dist/src/lib/utils/misc';
import { Scope } from 'sonarwhal/dist/src/lib/enums/scope';

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

const rule: IRuleBuilder = {
    create(context: RuleContext): IRule {
        /** The maximum number of hops for a resource. */
        const maxResourceHops: number = context.ruleOptions && context.ruleOptions['max-resource-redirects'] || 0;
        /** The maximum number of hops for the html. */
        const maxHTMLHops: number = context.ruleOptions && context.ruleOptions['max-html-redirects'] || 0;

        /**
         * Returns a function that will validate if the number of hops is within the limit passed by `maxHops`.
         * If it doesn't validate, it will notify the context.
         *
         * Ex.: `validateRequestEnd(10)(fetchEnd)` will verify if the event `fetchEnd` has had less than 10 hops.
         */
        const validateRequestEnd = async (fetchEnd: IFetchEnd, eventName: string) => {
            const maxHops: number = eventName === 'fetch::end::html' ? maxHTMLHops : maxResourceHops;
            const { request, response, element } = fetchEnd;

            if (response.hops.length > maxHops) {
                await context.report(request.url, element, `${response.hops.length} ${pluralize('redirect', response.hops.length)} detected for ${cutString(request.url)} (max is ${maxHops}).`);
            }
        };

        return { 'fetch::end::*': validateRequestEnd };
    },
    meta: {
        docs: {
            category: Category.performance,
            description: `Checks if there are unnecesary redirects when accessign resources`
        },
        schema: [{
            additionalProperties: false,
            properties: {
                'max-html-redirects': {
                    minimum: 0,
                    type: 'integer'
                },
                'max-resource-redirects': {
                    minimum: 0,
                    type: 'integer'
                }
            },
            type: 'object'
        }],
        scope: Scope.site
    }
};

module.exports = rule;
