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
        schema: [
            /*
             * If you want to allow the user to configure your rule
             * you should use a valid JSON schema. More info in:
             * https://sonarwhal.com/docs/contributor-guide/rules/#themetaproperty
             */
        ],
        scope: RuleScope.any
    }

    public constructor(context: RuleContext) {

        let maxRules = context.targetedBrowsers.includes('ie 9') ? 4095 : 65534;

        if (context.ruleOptions && context.ruleOptions['max-css-rules'])
            maxRules = context.ruleOptions['max-css-rules'];

        //  this function will be evaluated in the context of the page
        const injectedCode = function() {

            //  helper function to recursively count rules in stylesheets
            const countRules = (styleSheet: CSSStyleSheet) => {

                try {

                    //  count rules in this stylesheet
                    return Array.from(styleSheet.cssRules).reduce((count, rule) => {

                        //  count each selector in a style rule separately
                        if (rule instanceof CSSStyleRule)
                            return count + rule.selectorText.split(',').length;

                        //  recursively count rules in imported stylesheets
                        if (rule instanceof CSSImportRule)
                            return count + countRules(rule.styleSheet) + 1;

                        //  other rules count as one each
                        return count + 1;

                    }, 0);

                } catch(e) {

                    //  accessing cssRules of a cross-origin stylesheet can throw
                    //  if this happens, exclude the stylesheet from the count
                    return 0;

                }
            };

            //  get the recursive count of rules for all stylesheets in the page
            return Array.from(document.styleSheets)
                .map(countRules)
                .reduce((a, b) => a + b, 0);
        };

        const validateScanEnd = async (scanEnd: ScanEnd) => {

            const totalRules = await context.evaluate(`(${injectedCode})()`);

            //  report if we hit the limit to support flagging on platforms which will drop subsequent rules
            if (totalRules >= maxRules) {
                context.report(null, null, `Maximum of ${maxRules} CSS rules reached (${totalRules})`);
            }

            return;
        };

        context.on('scan::end', validateScanEnd);
    }
}
