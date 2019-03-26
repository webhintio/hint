/**
 * @fileoverview The most basic formatter, it stringifyes whatever
 * object is passed to it.
 */

/*
 * ------------------------------------------------------------------------------
 * Requirements
 * ------------------------------------------------------------------------------
 */

import groupBy = require('lodash/groupBy');
import reduce = require('lodash/reduce');
import sortBy = require('lodash/sortBy');

import { debug as d, fs, logger } from '@hint/utils';
import { FormatterOptions, IFormatter, Problem } from 'hint';

const _ = {
    groupBy,
    reduce,
    sortBy
};
const { writeFileAsync } = fs;
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
