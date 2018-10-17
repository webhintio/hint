/**
 * @fileoverview desc
 */

import { Category } from 'hint/dist/src/lib/enums/category';
import { HintContext } from 'hint/dist/src/lib/hint-context';
// The list of types depends on the events you want to capture.
import { IHint, FetchStart, FetchEnd, HintMetadata } from 'hint/dist/src/lib/types';
import { debug as d } from 'hint/dist/src/lib/utils/debug';
import { HintScope } from 'hint/dist/src/lib/enums/hintscope';

const debug: debug.IDebugger = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class CompatApiCompatApiCssHint implements IHint {

    public static readonly meta: HintMetadata = {
        docs: {
            category: Category.development,
            description: `desc`
        },
        id: 'compat-api/compat-api-css',
        schema: [
            /*
             * If you want to allow the user to configure your hint
             * you should use a valid JSON schema. More info in:
             * https://webhint.io/docs/contributor-guide/hints/#themetaproperty
             */
        ],
        scope: HintScope.any
    }

    public constructor(context: HintContext) {

        // Your code here.
        const validateFetchStart = async (fetchStart: FetchStart) => {
            // Code to validate the hint on the event fetch::start.

            const { resource } = fetchStart;
            
            debug(`Validating hint compat-api-css`);
            
            /*
             * This is where all the magic happens. Any errors found should be
             * reported using the `context` object. E.g.:
             * await context.report(resource, null, 'Add error message here.');
             *
             * More information on how to develop a hint is available in:
             * https://webhint.io/docs/contributor-guide/hints/
             */
            
            if (Math.ceil(Math.random()) === 0) {
                await context.report(resource, null, 'Add error message here.');
            }
        };
        const validateFetchEnd = async (fetchEnd: FetchEnd) => {
            // Code to validate the hint on the event fetch::end::*.

            const { resource } = fetchEnd;
            
            debug(`Validating hint compat-api-css`);
            
            /*
             * This is where all the magic happens. Any errors found should be
             * reported using the `context` object. E.g.:
             * await context.report(resource, null, 'Add error message here.');
             *
             * More information on how to develop a hint is available in:
             * https://webhint.io/docs/contributor-guide/hints/
             */
            
            if (Math.ceil(Math.random()) === 0) {
                await context.report(resource, null, 'Add error message here.');
            }
        };

        context.on('fetch::end::*', validateFetchEnd);
        context.on('fetch::start', validateFetchStart);
        // As many events as you need
    }
}
