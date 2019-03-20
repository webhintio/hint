/**
 * @fileoverview The most basic formatter, it stringifyes whatever
 * object is passed to it.
 */

/*
 * ------------------------------------------------------------------------------
 * Requirements
 * ------------------------------------------------------------------------------
 */

import {
    groupBy,
    reduce,
    sortBy
} from 'lodash';

import { debug as d } from 'hint/dist/src/lib/utils/debug';
import { IFormatter, Problem, FormatterOptions } from 'hint/dist/src/lib/types';
import * as logger from 'hint/dist/src/lib/utils/logging';
import writeFileAsync from 'hint/dist/src/lib/utils/fs/write-file-async';

const _ = {
    groupBy,
    reduce,
    sortBy
};
const debug = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Formatter
 * ------------------------------------------------------------------------------
 */

export default class JSONFormatter implements IFormatter {
    /** Format the problems grouped by `resource` name and sorted by line and column number */
    public async format(messages: Problem[], options: FormatterOptions = {}) {

        debug('Formatting results');

        if (messages.length === 0) {
            return;
        }

        const resources: _.Dictionary<Problem[]> = _.groupBy(messages, 'resource');

        const result = _.reduce(resources, (total: string, msgs: Problem[], resource: string) => {
            const sortedMessages: Problem[] = _.sortBy(msgs, ['location.line', 'location.column']);
            const result = `${total ? '\n\n' : ''}${resource}: ${msgs.length} issues
${JSON.stringify(sortedMessages, null, 2)}`;

            return total + result;
        }, '');

        if (!options.output) {
            logger.log(result);

            return;
        }

        await writeFileAsync(options.output, result);
    }
}
