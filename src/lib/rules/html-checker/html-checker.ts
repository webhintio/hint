/**
 * @fileoverview Validating html using `the Nu HTML checker`;
 * https://validator.w3.org/nu/
 */

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

import * as _ from 'lodash';

import { debug as d } from '../../utils/debug';
import { RuleContext } from '../../rule-context'; // eslint-disable-line no-unused-vars
import { IRule, IRuleBuilder, ITargetFetchEnd, IScanEnd, IProblemLocation, Severity } from '../../types'; // eslint-disable-line no-unused-vars

const debug: debug.IDebugger = d(__filename);

// ------------------------------------------------------------------------------
// Public
// ------------------------------------------------------------------------------

const rule: IRuleBuilder = {
    create(context: RuleContext): IRule {
        /** The promise that represents the scan by HTML checker. */
        let htmlCheckerPromise: Promise<any>;
        /** Array of strings that needes to be ignored from the checker result. */
        let ignoredMessages;
        /** The options to pass to the HTML checker. */
        const scanOptions = {
            data: '',
            format: 'json',
            validator: ''
        };
        /** If the result messages should be grouped */
        let groupMessage: boolean;

        type HtmlError = { // eslint-disable-line no-unused-vars
            extract: string; // code snippet
            firstColumn: number;
            lastLine: number;
            hiliteStart: number;
            message: string;
            subType: string;
        };

        const loadRuleConfig = () => {
            const ignore = (context.ruleOptions && context.ruleOptions.ignore) || [];
            const validator = (context.ruleOptions && context.ruleOptions.validator) || 'https://validator.w3.org/nu/';

            groupMessage = !(context.ruleOptions && context.ruleOptions.details);
            scanOptions.validator = validator;

            // Up to now, the `ignore` setting in `html-validator` only works if `format` is set to `text`
            // So we implement `ignore` in our code rather than pass it to `scanOptions`
            // TODO: Pass `ignore` once this issue (https://github.com/zrrrzzt/html-validator/issues/58) is solved.
            ignoredMessages = Array.isArray(ignore) ? ignore : [ignore];
        };

        // Filter out ignored and redundant messages.
        const filter = (messages): Array<HtmlError> => {
            const noIgnoredMesssages = messages.filter((message) => {
                return !ignoredMessages.includes(message.message);
            });

            if (!groupMessage) {
                return noIgnoredMesssages;
            }

            return _.uniqBy(noIgnoredMesssages, 'message');
        };

        const locateAndReport = (resource: string) => {
            return (messageItem: HtmlError): Promise<void> => {
                const position: IProblemLocation = {
                    column: messageItem.firstColumn,
                    elementColumn: messageItem.hiliteStart + 1,
                    elementLine: 1, // We will pass in the single-line code snippet generated from the HTML checker, so the elementLine is always 1
                    line: messageItem.lastLine
                };

                return context.report(resource, null, messageItem.message, null, position, Severity[messageItem.subType], messageItem.extract);
            };
        };

        const start = (data: ITargetFetchEnd) => {
            const { response } = data;

            /* HACK: Need to do a require here in order to be capable of mocking
               when testing the rule and `import` doesn't work here. */
            const htmlChecker = require('html-validator');

            /* Property `rawContent` can contain the information with
             * different encodings depending on the connector we are using on sonar
             * i.e. In Chrome it is utf8 but in Edge it is base64 */
            scanOptions.data = response.body.rawContent.toString();
            htmlCheckerPromise = scanOptions.data ? htmlChecker(scanOptions) : Promise.resolve({messages: []});
        };

        const end = async (data: IScanEnd) => {
            const { resource } = data;
            const locateAndReportByResource = locateAndReport(resource);
            let result;

            if (!htmlCheckerPromise) {
                return;
            }

            debug(`Waiting for HTML checker results for ${resource}`);

            try {
                result = await htmlCheckerPromise;
            } catch (e) {
                debug(`Error getting HTML checker result for ${resource}.`, e);
                await context.report(resource, null, `Couldn't get results from HTML checker for ${resource}. Error: ${e}`);

                return;
            }

            debug(`Received HTML checker results for ${resource}`);

            const filteredMessages: Array<HtmlError> = filter(result.messages);
            const reportPromises: Array<Promise<void>> = filteredMessages.map((messageItem: HtmlError): Promise<void> => {
                return locateAndReportByResource(messageItem);
            });

            try {
                await Promise.all(reportPromises);
            } catch (e) {
                debug(`Error reporting the HTML checker results.`, e);

                return;
            }
        };

        loadRuleConfig();

        return {
            'scan::end': end,
            'targetfetch::end': start
        };
    },
    meta: {
        docs: {
            category: 'Interoperability',
            description: `Validate HTML using 'the Nu HTML checker'`
        },
        fixable: 'code',
        recommended: true,
        schema: [{
            properties: {
                details: { type: 'boolean' },
                ignore: {
                    anyOf: [
                        {
                            items: { type: 'string' },
                            type: 'array'
                        }, { type: 'string' }
                    ]
                },
                validator: {
                    pattern: '^(http|https)://',
                    type: 'string'
                }
            }
        }],
        worksWithLocalFiles: true
    }
};

module.exports = rule;
