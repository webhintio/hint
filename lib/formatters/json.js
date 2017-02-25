/**
 * @fileoverview The most basic formatter, it just stringifyes whatever object is passed to it
 * @author Anton Molleda (@molant)
 */

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------
const debug = require('debug')('sonar:formatters:json');

// ------------------------------------------------------------------------------
// Formatter
// ------------------------------------------------------------------------------
const format = (obj) => {
    debug('Formatting results');
    console.log(JSON.stringify(obj, null, 2));
};

module.exports = format;