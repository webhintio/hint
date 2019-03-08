/**
 * @fileoverview Validates if the HTML of a page is AMP valid
 */

import * as path from 'path';

import * as amphtmlValidator from 'amphtml-validator';

import { debug as d } from 'hint/dist/src/lib/utils/debug';
import { IHint, FetchEnd } from 'hint/dist/src/lib/types';
import { HintContext } from 'hint/dist/src/lib/hint-context';

import meta from './meta';

const debug: debug.IDebugger = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class AmpValidatorHint implements IHint {
    public static readonly meta = meta;

    public constructor(context: HintContext) {
        let validPromise: Promise<amphtmlValidator.Validator>;
        const errorsOnly = context.hintOptions && /* istanbul ignore next */ context.hintOptions['errors-only'] || false;
        let events: FetchEnd[] = [];

        const onFetchEndHTML = (fetchEnd: FetchEnd) => {
            const { response: { body: { content }, statusCode } } = fetchEnd;

            if (statusCode !== 200 || !content) {
                return;
            }

            /*
             * `events` has to be an array in order
             * to work with the local connector.
             */
            events.push(fetchEnd);
            validPromise = amphtmlValidator.getInstance(path.join(__dirname, 'validator'));
        };

        const onScanEnd = async () => {
            if (!events || events.length === 0) {
                debug('No valid content');

                return;
            }

            for (const event of events) {
                const { resource, response: { body: { content } } } = event;
                const validator = await validPromise;
                const result = validator.validateString(content);

                for (let i = 0; i < result.errors.length; i++) {
                    const error = result.errors[i];
                    let message = error.message;

                    if (error.specUrl !== null) {
                        message += ` (${error.specUrl})`;
                    }

                    /*
                     * We ignore errors that are not 'ERROR'
                     * if user has configured the hint like that.
                     */
                    /* istanbul ignore if */
                    if (errorsOnly && /* istanbul ignore next */ error.severity !== 'ERROR') {
                        debug(`AMP error doesn't meet threshold for reporting`);
                    } else {
                        const location = {
                            column: error.col,
                            line: error.line
                        };

                        context.report(resource, message, { location });
                    }
                }
            }

            // clear events for watcher.
            events = [];
        };

        context.on('fetch::end::html', onFetchEndHTML);
        context.on('scan::end', onScanEnd);
    }
}
