/**
 * @fileoverview The most basic formatter, it just stringifyes whatever object is passed to it
 * @author Anton Molleda (@molant)
 */

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------
const _ = require('lodash');
const debug = require('debug')('sonar:formatters:json');

// ------------------------------------------------------------------------------
// Formatter
// ------------------------------------------------------------------------------
const format = (messages) => {
    debug('Formatting results');

    const resources = _.groupBy(messages, 'resource');

    _.forEach(resources, (msgs, resource) => {
        console.log(`${resource}: ${msgs.length} issues`);

        const sortedMessages = _.sortBy(msgs, ['line', 'column']);

        console.log(sortedMessages);
    });
};

module.exports = format;
