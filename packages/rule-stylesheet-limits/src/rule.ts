/**
 * @fileoverview Checks if CSS exceeds known stylesheet limits.
 */

import { Category } from 'sonarwhal/dist/src/lib/enums/category';
import { RuleContext } from 'sonarwhal/dist/src/lib/rule-context';
import { IRule, RuleMetadata } from 'sonarwhal/dist/src/lib/types';
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
            description: `Checks if CSS exceeds known stylesheet limits.`
        },
        id: 'stylesheet-limits',
        schema: [{
            additionalProperties: false,
            properties: {
                maxImports: { type: 'number' },
                maxRules: { type: 'number' },
                maxSheets: { type: 'number' }
            },
            type: ['object', 'null']
        }],
        scope: RuleScope.any
    }

    public constructor(context: RuleContext) {

        const includesIE9 = context.targetedBrowsers.includes('ie 9');

        let maxImports = includesIE9 ? 4 : 0;
        let maxRules = includesIE9 ? 4095 : 65534;
        let maxSheets = includesIE9 ? 31 : 4095;

        // Allow limits to be overridden by rule options.
        const options = context.ruleOptions;

        if (options) {
            if (options.maxImports && (maxImports === 0 || options.maxImports < maxImports)) {
                maxImports = options.maxImports;
            }
            if (options.maxRules && options.maxRules < maxRules) {
                maxRules = options.maxRules;
            }
            if (options.maxSheets && options.maxSheets < maxSheets) {
                maxSheets =options.maxSheets;
            }
        }

        // The following function will be evaluated in the context of the page.
        const injectedCode = function() {

            // Recursively count rules and imports in the passed stylesheet.
            const countRules = (styleSheet: CSSStyleSheet) => {

                const results = {
                    imports: 0,
                    rules: 0,
                    sheets: 1
                };

                try {

                    // Count rules in this stylesheet.
                    Array.from(styleSheet.cssRules).forEach((rule) => {

                        if (rule instanceof CSSStyleRule) {

                            // Count each selector in a style rule separately.
                            results.rules += rule.selectorText.split(',').length;

                        } else if (rule instanceof CSSImportRule) {

                            // Recursively count rules in imported stylesheets.
                            const subResults = countRules(rule.styleSheet);

                            results.imports += Math.max(results.imports, subResults.imports + 1);
                            results.rules += subResults.rules + 1;
                            results.sheets += subResults.sheets;

                        } else {

                            // Other rules count as one each.
                            results.rules += 1;

                        }
                    });

                } catch (e) {

                    /*
                     * Accessing cssRules of a cross-origin stylesheet can throw.
                     * If this happens, exclude the stylesheet from the count.
                     */
                }

                return results;
            };

            const combinedResults = {
                imports: 0,
                rules: 0,
                sheets: 0
            };

            // Get the recursive count of rules for all stylesheets in the page.
            Array.from(document.styleSheets).forEach((sheet) => {
                if (sheet instanceof CSSStyleSheet) {
                    const subResults = countRules(sheet);

                    combinedResults.imports += Math.max(combinedResults.imports, subResults.imports);
                    combinedResults.rules += subResults.rules;
                    combinedResults.sheets += subResults.sheets;
                }
            });

            return combinedResults;
        };

        const validateScanEnd = async () => {

            const results = await context.evaluate(`(${injectedCode})()`);

            // Report once we hit a limit to support flagging on platforms which will drop subsequent rules.

            if (maxImports && results.imports >= maxImports) {
                context.report(null, null, `Maximum of ${maxImports} nested imports reached (${results.imports})`);
            }

            if (results.rules >= maxRules) {
                context.report(null, null, `Maximum of ${maxRules} CSS rules reached (${results.rules})`);
            }

            if (results.sheets >= maxSheets) {
                context.report(null, null, `Maximum of ${maxSheets} stylesheets reached (${results.sheets})`);
            }
        };

        context.on('scan::end', validateScanEnd);
    }
}
