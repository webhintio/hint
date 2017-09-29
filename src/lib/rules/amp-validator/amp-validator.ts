/**
 * @fileoverview Validates if the HTML of a page is AMP valid
 */

import * as amphtmlValidator from 'amphtml-validator';

import { Category } from '../../enums/category';
import { RuleContext } from '../../rule-context';
import { IRule, IRuleBuilder } from '../../types';
import { debug as d } from '../../utils/debug';

const debug: debug.IDebugger = d(__filename);

import { ITargetFetchEnd, IScanEnd } from '../../types';

// ------------------------------------------------------------------------------
// Public
// ------------------------------------------------------------------------------

const rule: IRuleBuilder = {
    create(context: RuleContext): IRule {
        let validPromise;
        const errorsOnly = context.ruleOptions && context.ruleOptions['errors-only'] || false;
        let html;

        const onTargetFetchEnd = (fetchEnd: ITargetFetchEnd) => {
            const { response: { body: { content }, statusCode } } = fetchEnd;

            if (statusCode !== 200 || !content) {
                return;
            }

            html = content;
            validPromise = amphtmlValidator.getInstance();
        };

        const onScanEnd = async (scanEnd: IScanEnd) => {
            if (!html) {
                debug('No valid content');

                return;
            }

            const resource = scanEnd.resource;
            const validator = await validPromise;
            const result = validator.validateString(html);

            for (let i = 0; i < result.errors.length; i++) {
                const error = result.errors[i];
                let message = error.message;

                if (error.specUrl !== null) {
                    message += ` (${error.specUrl})`;
                }

                // We ignore errors that are not 'ERROR' if user has configured the rule like that
                if (errorsOnly && error.severity !== 'ERROR') {
                    debug(`AMP error doesn't meet threshold for reporting`);
                } else {
                    await context.report(resource, null, message, null, { column: error.column, line: error.line });
                }
            }
        };

        return {
            'scan::end': onScanEnd,
            'targetfetch::end': onTargetFetchEnd
        };
    },
    meta: {
        docs: {
            category: Category.performance,
            description: `Require HTML page to be AMP valid.`
        },
        recommended: false,
        schema: [{
            additionalProperties: false,
            properties: { 'errors-only': { type: 'boolean' } },
            type: 'object'
        }],
        worksWithLocalFiles: true
    }
};

module.exports = rule;
