/**
 * @fileoverview The stylish formatter, it outputs the results in a table format with different colors.
 *
 * This formatter is based on [eslint stylish formatter](https://github.com/eslint/eslint/blob/master/lib/formatters/stylish.js)
 */

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

import * as chalk from 'chalk';
import * as _ from 'lodash';
import * as table from 'text-table';
import * as pluralize from 'pluralize';

import { cutString } from '../../utils/misc';
import { debug as d } from '../../utils/debug';
import { IFormatter, Severity } from '../../types'; // eslint-disable-line no-unused-vars
import * as logger from '../../utils/logging';

const debug = d(__filename);

const printPosition = (position, text) => {
    if (position === -1) {
        return '';
    }

    return `${text} ${position}`;
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
            const sortedMessages = _.sortBy(msgs, ['location.line', 'location.column']);
            const tableData = [];
            let hasPosition = false;

            logger.log(chalk.cyan(`${cutString(resource, 80)}`));
            _.forEach(sortedMessages, (msg) => {
                const severity = Severity.error === msg.severity ? chalk.red('Error') : chalk.yellow('Warning');

                if (Severity.error === msg.severity) {
                    errors++;
                } else {
                    warnings++;
                }

                const line = printPosition(msg.location.line, 'line');
                const column = printPosition(msg.location.column, 'col');

                if (line) {
                    hasPosition = true;
                }

                tableData.push([line, column, severity, msg.message, msg.ruleId]);
            });

            /* If no message in this resource has a position, then we remove the
             * position components from the array to avoid unnecessary white spaces
             */
            if (!hasPosition) {
                tableData.forEach((row) => {
                    row.splice(0, 2);
                });
            }

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
