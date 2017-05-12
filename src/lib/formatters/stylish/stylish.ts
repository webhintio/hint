/**
 * @fileoverview The basic formatter, it just a table format with diferent colors
 * for errors and warnings.
 *
 * This formatter is based on [eslint stylish formatter](https://github.com/eslint/eslint/blob/master/lib/formatters/stylish.js)
 */

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

import * as chalk from 'chalk';
import * as _ from 'lodash';
import * as table from 'text-table';

import { debug as d } from '../../utils/debug';
import { IFormatter, Severity } from '../../types'; // eslint-disable-line no-unused-vars
import * as logger from '../../utils/logging';

const debug = d(__filename);

const pluralize = (text, count) => {
    return `${text}${count !== 1 ? 's' : ''}`;
};

// ------------------------------------------------------------------------------
// Formatter
// ------------------------------------------------------------------------------

const formatter: IFormatter = {
    /** Format the problems grouped by `resource` name and sorted by line and column number */
    format(messages) {

        debug('Formatting results');

        if (messages.length === 0) {
            return;
        }

        const resources = _.groupBy(messages, 'resource');
        let totalErrors = 0;
        let totalWarnings = 0;

        _.forEach(resources, (msgs, resource) => {
            let warnings = 0;
            let errors = 0;
            const sortedMessages = _.sortBy(msgs, ['line', 'column']);
            const tableData = [];

            logger.log(chalk.cyan(`${resource}`));
            _.forEach(sortedMessages, (msg) => {
                const severity = Severity.error === msg.severity ? chalk.red('Error') : chalk.yellow('Warning');

                if (Severity.error === msg.severity) {
                    errors++;
                } else {
                    warnings++;
                }
                tableData.push([severity, msg.message, msg.ruleId]);
            });

            logger.log(table(tableData));

            const color = errors > 0 ? chalk.red : chalk.yellow;

            totalErrors += errors;
            totalWarnings += warnings;

            logger.log(color.bold(`\u2716 Found ${errors} ${pluralize('error', errors)} and ${warnings} ${pluralize('warning', warnings)}`));
            logger.log('');
        });

        const color = totalErrors > 0 ? chalk.red : chalk.yellow;

        logger.log(color.bold(`\u2716 Found a total of ${totalErrors} ${pluralize('error', totalErrors)} and ${totalWarnings} ${pluralize('warning', totalWarnings)}`));
    }
};

export default formatter;
