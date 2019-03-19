/**
 * @fileoverview Validating html using `the Nu HTML checker`;
 * https://validator.w3.org/nu/
 */

/*
 * ------------------------------------------------------------------------------
 * Requirements
 * ------------------------------------------------------------------------------
 */

import uniqBy = require('lodash/uniqBy');
import { OptionsWithUrl } from 'request';

import { debug as d } from 'hint/dist/src/lib/utils/debug';
import { HintContext } from 'hint/dist/src/lib/hint-context';
import { IHint, ProblemLocation, Severity, TraverseStart } from 'hint/dist/src/lib/types';

import meta from './meta';

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

export default class HtmlCheckerHint implements IHint {

    public static readonly meta = meta;

    public constructor(context: HintContext) {

        /** The promise that represents the scan by HTML checker. */
        let htmlCheckerPromises: CheckerData[] = [];
        /** Array of strings that needes to be ignored from the checker result. */
        let ignoredMessages: string[];
        /** The options to pass to the HTML checker. */
        const scanOptions = {
            body: '',
            headers: {
                'Content-Type': 'text/html; charset=utf-8',
                'User-Agent': 'hint'
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
            subType: keyof typeof Severity;
        };

        const loadHintConfig = () => {
            const ignore = (context.hintOptions && context.hintOptions.ignore) || [];
            const validator = (context.hintOptions && context.hintOptions.validator) || 'https://validator.w3.org/nu/';

            groupMessage = !(context.hintOptions && context.hintOptions.details);
            scanOptions.url = validator;

            ignoredMessages = Array.isArray(ignore) ? ignore : [ignore];
        };

        // Filter out ignored and redundant messages.
        const filter = (messages: HtmlError[]): HtmlError[] => {
            const noIgnoredMesssages = messages.filter((message) => {
                return !ignoredMessages.includes(message.message);
            });

            if (!groupMessage) {
                return noIgnoredMesssages;
            }

            return uniqBy(noIgnoredMesssages, 'message');
        };

        const locateAndReport = (resource: string) => {
            return (messageItem: HtmlError): void => {
                const position: ProblemLocation = {
                    column: messageItem.firstColumn,
                    elementColumn: messageItem.hiliteStart + 1,
                    elementLine: 1, // We will pass in the single-line code snippet generated from the HTML checker, so the elementLine is always 1
                    line: messageItem.lastLine
                };

                context.report(resource, messageItem.message, {
                    codeSnippet: messageItem.extract,
                    location: position,
                    severity: Severity[messageItem.subType]
                });
            };
        };

        const notifyError = (resource: string, error: any) => {
            debug(`Error getting HTML checker result for ${resource}.`, error);
            context.report(resource, `Could not get results from HTML checker for '${resource}'. Error: '${error}'.`);
        };

        const requestRetry = async (options: OptionsWithUrl, retries: number = 3): Promise<any> => {
            const requestAsync = (await import('hint/dist/src/lib/utils/network/request-async')).default;
            const delay = (await import('hint/dist/src/lib/utils/misc/delay')).default;

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

        const checkHTML = (data: TraverseStart): CheckerData => {
            const options = Object.assign({}, scanOptions, { body: context.pageContent });

            return {
                event: data,
                failed: false,
                promise: options.body ? requestRetry(options) : Promise.resolve({ messages: [] })
            };
        };

        const start = (data: TraverseStart) => {
            const check: CheckerData = checkHTML(data);

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
                    notifyError(resource, e);

                    return;
                }

                debug(`Received HTML checker results for ${resource}`);

                const filteredMessages: HtmlError[] = filter(result.messages);

                try {
                    filteredMessages.forEach((messageItem: HtmlError) => {
                        locateAndReportByResource(messageItem);
                    });
                } catch (e) {
                    debug(`Error reporting the HTML checker results.`, e);

                    return;
                }
            }

            // Clear htmlCheckerPromises for watcher.
            htmlCheckerPromises = [];
        };

        loadHintConfig();

        context.on('traverse::start', start);
        context.on('scan::end', end);
    }
}
