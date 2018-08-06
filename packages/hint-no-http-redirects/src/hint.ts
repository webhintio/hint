/**
 * @fileoverview Checks if there are unnecesary redirects when accessign resources
 */

import { Category } from 'hint/dist/src/lib/enums/category';
import { HintContext } from 'hint/dist/src/lib/hint-context';
// The list of types depends on the events you want to capture.
import { IHint, FetchEnd, HintMetadata } from 'hint/dist/src/lib/types';
import cutString from 'hint/dist/src/lib/utils/misc/cut-string';
import { HintScope } from 'hint/dist/src/lib/enums/hintscope';

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class NoHttpRedirectHint implements IHint {

    public static readonly meta: HintMetadata = {
        docs: {
            category: Category.performance,
            description: `Checks if there are unnecesary redirects when accessign resources`
        },
        id: 'no-http-redirects',
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
        scope: HintScope.site
    }

    public constructor(context: HintContext) {

        /** The maximum number of hops for a resource. */
        const maxResourceHops: number = context.hintOptions && context.hintOptions['max-resource-redirects'] || 0;
        /** The maximum number of hops for the html. */
        const maxHTMLHops: number = context.hintOptions && context.hintOptions['max-html-redirects'] || 0;

        /**
         * Returns a function that will validate if the number of hops is within the limit passed by `maxHops`.
         * If it doesn't validate, it will notify the context.
         *
         * Ex.: `validateRequestEnd(10)(fetchEnd)` will verify if the event `fetchEnd` has had less than 10 hops.
         */
        const validateRequestEnd = async (fetchEnd: FetchEnd, eventName: string) => {
            const maxHops: number = eventName === 'fetch::end::html' ? maxHTMLHops : maxResourceHops;
            const { request, response, element } = fetchEnd;

            if (response.hops.length > maxHops) {
                await context.report(request.url, element, `${response.hops.length} ${response.hops.length === 1 ? 'redirect' : 'redirects'} detected for '${cutString(request.url)}' (max is ${maxHops}).`);
            }
        };

        context.on('fetch::end::*', validateRequestEnd);
    }
}
