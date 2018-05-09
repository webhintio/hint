/**
 * @fileoverview Description for js-minify-check
 */

import { Category } from 'sonarwhal/dist/src/lib/enums/category';
import { RuleContext } from 'sonarwhal/dist/src/lib/rule-context';
// The list of types depends on the events you want to capture.
import { IRule, FetchStart, FetchEnd, FetchError, RuleMetadata } from 'sonarwhal/dist/src/lib/types';
import { debug as d } from 'sonarwhal/dist/src/lib/utils/debug';
import { RuleScope } from 'sonarwhal/dist/src/lib/enums/rulescope';
import { ScriptParse } from '../dist/parser-javascript/src/types'

const debug: debug.IDebugger = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class JsMinifyCheckRule implements IRule {

    public static readonly meta: RuleMetadata = {
        docs: {
            category: Category.performance,
            description: `Description for js-minify-check`
        },
        id: 'js-minify-check',
        schema: [{
            additionalProperties: false,
            properties: {
                threshold: {
                    type: 'number'                    
                }}
            }
        ],
        scope: RuleScope.any
    }

    public constructor(context: RuleContext) {

        
        const validateContentMinified = async (scriptData: ScriptParse) => {
          
            let threshold: number = 75;
            if(context.ruleOptions && context.ruleOptions.threshold)
            {
                threshold = context.ruleOptions.threshold;
            }

            const contentLength = scriptData.sourceCode.text.length;            
            const tokenRatio = scriptData.tokenCount / contentLength;
            const improvementIndex = await getImprovementIndex(scriptData);

            if(improvementIndex > threshold)
            {
                await context.report(scriptData.resource, null, 'Javascript content can be minified');
            }      
        };

        const getImprovementIndex = async (scriptData: ScriptParse) => {            
            const contentLength = scriptData.sourceCode.text.length;            
            const tokenRatio = scriptData.tokenCount / contentLength;
            return  Math.round((1 - tokenRatio) * 100); 
        };
        context.on('parse::javascript::end', validateContentMinified);      
    }
}
