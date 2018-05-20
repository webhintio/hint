/**
 * @fileoverview Rule for checking JavaScript is minified or not
 * This rule calcualte the token ratio(tokeCount / contentLength)
 * and generate a improvementIndex from that and compare it against
 * a reasonable threshold to determine whether a script is minified or not
 */

import { Category } from 'sonarwhal/dist/src/lib/enums/category';
import { RuleContext } from 'sonarwhal/dist/src/lib/rule-context';
import { IRule, RuleMetadata } from 'sonarwhal/dist/src/lib/types';
import { debug as d } from 'sonarwhal/dist/src/lib/utils/debug';
import { RuleScope } from 'sonarwhal/dist/src/lib/enums/rulescope';
import { ScriptParse } from '@sonarwhal/parser-javascript/dist/src/types';

const debug: debug.IDebugger = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */
export default class MinifiedJsRule implements IRule {

    public static readonly meta: RuleMetadata = {
        docs: {
            category: Category.performance,
            description: `Rule to check script is minified or not`
        },
        id: 'minified-js',
        schema: [{
            additionalProperties: false,
            properties: { threshold: { type: 'number' } }
        }],
        scope: RuleScope.any
    }

    public constructor(context: RuleContext) {
        /*
         * We derived 75 as a safe threshold value after running tests on 15 popular
         * js libraries and few custom scripts from sonarwhal.com website
         */
        let threshold: number = 75;

        if (context.ruleOptions && context.ruleOptions.threshold) {
            threshold = context.ruleOptions.threshold;
        }

        const getImprovementIndex = (scriptData: ScriptParse) => {
            const contentLength = scriptData.sourceCode.text.length;
            const tokenRatio = scriptData.ast.tokens.length / contentLength;

            return Math.round((1 - tokenRatio) * 100);
        };

        const validateContentMinified = async (scriptData: ScriptParse) => {
            const improvementIndex = getImprovementIndex(scriptData);

            debug(`Calculated improvementIndex for ${scriptData.resource}: ${improvementIndex}`);

            if (improvementIndex > threshold) {
                await context.report(scriptData.resource, null, 'JavaScript content could be minified');
            }
        };

        context.on('parse::javascript::end', validateContentMinified);
    }
}
