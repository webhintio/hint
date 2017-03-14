/**
 * @fileoverview The most basic formatter, it just stringifyes whatever object is passed to it
 * @author Anton Molleda (@molant)
 */

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------
import * as _ from 'lodash';

import {Formatter} from '../types'; // eslint-disable-line no-unused-vars

const debug = require('debug')('sonar:formatters:json');

// ------------------------------------------------------------------------------
// Formatter
// ------------------------------------------------------------------------------
const formatter: Formatter = {
    /** Format the problems grouped by `resource` name and sorted by line and column number */
    format(messages) {

        debug('Formatting results');

        const resources = _.groupBy(messages, 'resource');

        _.forEach(resources, (msgs, resource) => {
            console.log(`${resource}: ${msgs.length} issues`);
            const sortedMessages = _.sortBy(msgs, ['line', 'column']);

            console.log(sortedMessages);
        });

    }
};

module.exports = formatter;
