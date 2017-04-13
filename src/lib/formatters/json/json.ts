/**
 * @fileoverview The most basic formatter, it just stringifyes whatever object is passed to it
 * @author Anton Molleda (@molant)
 */

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

import * as _ from 'lodash';

import * as logger from '../../util/logging';
import { IFormatter } from '../../interfaces'; // eslint-disable-line no-unused-vars
import { debug as d } from '../../util/debug';

const debug = d(__filename);

// ------------------------------------------------------------------------------
// Formatter
// ------------------------------------------------------------------------------

const formatter: IFormatter = {
    /** Format the problems grouped by `resource` name and sorted by line and column number */
    format(messages) {

        debug('Formatting results');

        const resources = _.groupBy(messages, 'resource');

        _.forEach(resources, (msgs, resource) => {
            const sortedMessages = _.sortBy(msgs, ['line', 'column']);

            logger.log(`${resource}: ${msgs.length} issues`);
            logger.log(sortedMessages);
        });
    }
};

export default formatter;
