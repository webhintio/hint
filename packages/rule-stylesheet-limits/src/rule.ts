/**
 * @fileoverview Checks if CSS exceeds known stylesheet limits
 */

import { Category } from 'sonarwhal/dist/src/lib/enums/category';
import { RuleContext } from 'sonarwhal/dist/src/lib/rule-context';
// The list of types depends on the events you want to capture.
import { IRule, ScanEnd, RuleMetadata } from 'sonarwhal/dist/src/lib/types';
import { debug as d } from 'sonarwhal/dist/src/lib/utils/debug';
import { RuleScope } from 'sonarwhal/dist/src/lib/enums/rulescope';

const debug: debug.IDebugger = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class StylesheetLimitsRule implements IRule {

    public static readonly meta: RuleMetadata = {
        docs: {
            category: Category.interoperability,
            description: `Checks if CSS exceeds known stylesheet limits`
        },
        id: 'stylesheet-limits',
        schema: [{
            additionalProperties: false,
            properties: {
                maxRules: { type: 'number' },
                maxSheets: { type: 'number' },
                maxImports: { type: 'number' }
            },
            type: ['object', 'null']
        }],
        scope: RuleScope.any
    }

    public constructor(context: RuleContext) {

        const includesIE9 = context.targetedBrowsers.includes('ie 9');

        let maxRules = includesIE9 ? 4095 : 65534;
        let maxSheets = includesIE9 ? 31 : 4095;
        let maxImports = includesIE9 ? 4 : 0;

        //  allow limits to be overridden by rule options
        if (context.ruleOptions) {
            maxRules = context.ruleOptions.maxRules || maxRules;
            maxSheets = context.ruleOptions.maxSheets || maxSheets;
            maxImports = context.ruleOptions.maxImports || maxImports;
        }

        //  this function will be evaluated in the context of the page
        const injectedCode = function() {

            //  helper function to recursively count rules in stylesheets
            const countRules = (styleSheet: CSSStyleSheet) => {

                const results = {
                    rules: 0,
                    sheets: 1,
                    imports: 0
                };

                try {

                    //  count rules in this stylesheet
                    Array.from(styleSheet.cssRules).forEach(rule => {

                        if (rule instanceof CSSStyleRule) {

                            //  count each selector in a style rule separately
                            results.rules += rule.selectorText.split(',').length;

                        } else if (rule instanceof CSSImportRule) {

                            //  recursively count rules in imported stylesheets
                            const subResults = countRules(rule.styleSheet);
                            results.rules += subResults.rules + 1;
                            results.sheets += subResults.sheets;
                            results.imports += Math.max(results.imports, subResults.imports + 1);

                        } else {

                            //  other rules count as one each
                            results.rules += 1;

                        }
                    });

                } catch(e) {

                    //  accessing cssRules of a cross-origin stylesheet can throw
                    //  if this happens, exclude the stylesheet from the count

                }

                return results;
            };

            const combinedResults = {
                rules: 0,
                sheets: 0,
                imports: 0
            };

            //  get the recursive count of rules for all stylesheets in the page
            Array.from(document.styleSheets).forEach(sheet => {
                if (sheet instanceof CSSStyleSheet) {
                    const subResults = countRules(sheet);
                    combinedResults.rules += subResults.rules;
                    combinedResults.sheets += subResults.sheets;
                    combinedResults.imports += Math.max(combinedResults.imports, subResults.imports);
                }
            });

            return combinedResults;
        };

        const validateScanEnd = async (scanEnd: ScanEnd) => {

            const results = await context.evaluate(`(${injectedCode})()`);

            //  report once we hit a limit to support flagging on platforms which will drop subsequent rules

            if (results.rules >= maxRules)
                context.report(null, null, `Maximum of ${maxRules} CSS rules reached (${results.rules})`);

            if (results.sheets >= maxSheets)
                context.report(null, null, `Maximum of ${maxSheets} stylesheets reached (${results.sheets})`);

            if (maxImports && results.imports >= maxImports)
                context.report(null, null, `Maximum of ${maxImports} nested imports reached (${results.imports})`);

        };

        context.on('scan::end', validateScanEnd);
    }
}
