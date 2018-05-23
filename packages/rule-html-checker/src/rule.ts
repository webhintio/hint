/**
 * @fileoverview Validating html using `the Nu HTML checker`;
 * https://validator.w3.org/nu/
 */

/*
 * ------------------------------------------------------------------------------
 * Requirements
 * ------------------------------------------------------------------------------
 */

import * as uniqBy from 'lodash.uniqby';

import { Category } from 'sonarwhal/dist/src/lib/enums/category';
import { debug as d } from 'sonarwhal/dist/src/lib/utils/debug';
import { RuleContext } from 'sonarwhal/dist/src/lib/rule-context';
import { IRule, ProblemLocation, Severity, RuleMetadata, TraverseStart } from 'sonarwhal/dist/src/lib/types';
import { RuleScope } from 'sonarwhal/dist/src/lib/enums/rulescope';

const debug: debug.IDebugger = d(__filename);

type CheckerData = {
    event: TraverseStart;
    failed: boolean;
    promise: Promise<any>;
};

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class HtmlCheckerRule implements IRule {

    public static readonly meta: RuleMetadata = {
        docs: {
            category: Category.interoperability,
            description: `Validate HTML using 'the Nu HTML checker'`
        },
        id: 'html-checker',
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
        scope: RuleScope.any
    }

    public constructor(context: RuleContext) {

        /** The promise that represents the scan by HTML checker. */
        let htmlCheckerPromises: Array<CheckerData> = [];
        /** Array of strings that needes to be ignored from the checker result. */
        let ignoredMessages;
        /** The options to pass to the HTML checker. */
        const scanOptions = {
            body: '',
            headers: {
                'Content-Type': 'text/html; charset=utf-8',
                'User-Agent': 'sonarwhal'
            },
            method: 'POST',
            qs: { out: 'json' },
            url: ''
        };
        /** If the result messages should be grouped. */
        let groupMessage: boolean;

        type HtmlError = {
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
            scanOptions.url = validator;

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

            return uniqBy(noIgnoredMesssages, 'message');
        };

        const locateAndReport = (resource: string) => {
            return (messageItem: HtmlError): Promise<void> => {
                const position: ProblemLocation = {
                    column: messageItem.firstColumn,
                    elementColumn: messageItem.hiliteStart + 1,
                    elementLine: 1, // We will pass in the single-line code snippet generated from the HTML checker, so the elementLine is always 1
                    line: messageItem.lastLine
                };

                return context.report(resource, null, messageItem.message, null, position, Severity[messageItem.subType], messageItem.extract);
            };
        };

        const notifyError = async (resource: string, error: any) => {
            debug(`Error getting HTML checker result for ${resource}.`, error);
            await context.report(resource, null, `Couldn't get results from HTML checker for ${resource}. Error: ${error}`);
        };

        const requestRetry = async (options, retries: number = 3) => {
            /*
             * HACK: Need to do a require here in order to be capable
             * of mocking when testing the rule and `import` doesn't
             * work here.
             */
            const { requestAsync, delay } = await import('sonarwhal/dist/src/lib/utils/misc');

            try {
                return await requestAsync(options);
            } catch (e) {
                if (retries === 0) {
                    throw e;
                }

                await delay(500);

                return await requestRetry(options, retries - 1);
            }
        };

        const checkHTML = async (data: TraverseStart): Promise<CheckerData> => {
            const options = Object.assign({}, scanOptions, { body: await context.pageContent });

            return {
                event: data,
                failed: false,
                promise: options.body ? requestRetry(options) : Promise.resolve({ messages: [] })
            };
        };

        const start = async (data: TraverseStart) => {
            const check: CheckerData = await checkHTML(data);

            htmlCheckerPromises.push(check);
        };

        const end = async () => {
            if (htmlCheckerPromises.length === 0) {
                return;
            }

            for (const check of htmlCheckerPromises) {

                if (check.failed) {
                    return;
                }

                const { resource } = check.event;
                const locateAndReportByResource = locateAndReport(resource);
                let result;

                debug(`Waiting for HTML checker results for ${resource}`);
                try {
                    result = JSON.parse(await check.promise);
                } catch (e) {
                    await notifyError(resource, e);

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
            }

            // Clear htmlCheckerPromises for watcher.
            htmlCheckerPromises = [];
        };

        loadRuleConfig();

        context.on('traverse::start', start);
        context.on('scan::end', end);
    }
}
