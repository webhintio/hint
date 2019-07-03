/**
 * @fileoverview Hint for checking JavaScript is minified or not
 * This hint calcualte the token ratio(tokeCount / contentLength)
 * and generate a improvementIndex from that and compare it against
 * a reasonable threshold to determine whether a script is minified or not
 */

import { HintContext } from 'hint/dist/src/lib/hint-context';
import { IHint } from 'hint/dist/src/lib/types';
import { debug as d } from '@hint/utils/dist/src/debug';
import { ScriptEvents, ScriptParse } from '@hint/parser-javascript';

import meta from './meta';
import { getMessage } from './i18n.import';

const debug: debug.IDebugger = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */
export default class MinifiedJsHint implements IHint {

    public static readonly meta = meta;

    public constructor(context: HintContext<ScriptEvents>) {
        /*
         * We derived 75 as a safe threshold value after running tests on 15 popular
         * js libraries and few custom scripts from webhint.io website
         */
        let threshold: number = 75;

        if (context.hintOptions && context.hintOptions.threshold) {
            threshold = context.hintOptions.threshold;
        }

        const getImprovementIndex = ({ sourceCode, tokens }: ScriptParse) => {
            const contentLength = sourceCode.length;
            const tokenRatio = tokens.length / contentLength;

            return Math.round((1 - tokenRatio) * 100);
        };

        const validateContentMinified = (scriptData: ScriptParse) => {
            const improvementIndex = getImprovementIndex(scriptData);

            debug(`Calculated improvementIndex for ${scriptData.resource}: ${improvementIndex}`);

            if (improvementIndex > threshold) {
                context.report(scriptData.resource, getMessage('shouldBeMinified', context.language));
            }
        };

        context.on('parse::end::javascript', validateContentMinified);
    }
}
