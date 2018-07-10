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
    forEach,
    groupBy,
    sortBy
} from 'lodash';

import { debug as d } from 'hint/dist/src/lib/utils/debug';
import { IFormatter, Problem } from 'hint/dist/src/lib/types';
import * as logger from 'hint/dist/src/lib/utils/logging';

const _ = {
    forEach,
    groupBy,
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
    public format(messages: Array<Problem>) {

        debug('Formatting results');

        const resources: _.Dictionary<Array<Problem>> = _.groupBy(messages, 'resource');

        _.forEach(resources, (msgs: Array<Problem>, resource: string) => {
            const sortedMessages: Array<Problem> = _.sortBy(msgs, ['location.line', 'location.column']);

            logger.log(`${resource}: ${msgs.length} issues`);
            logger.log(JSON.stringify(sortedMessages, null, 2));
        });
    }
}
