/**
 * @fileoverview The stylish formatter, it outputs the results in a table format with different colors.
 *
 * This formatter is based on [eslint stylish formatter](https://github.com/eslint/eslint/blob/master/lib/formatters/stylish.js)
 */

/*
 * ------------------------------------------------------------------------------
 * Requirements
 * ------------------------------------------------------------------------------
 */

import chalk from 'chalk';
import * as forEach from 'lodash.foreach';
import * as groupBy from 'lodash.groupby';
import * as logSymbols from 'log-symbols';
import * as pluralize from 'pluralize';
import * as sortBy from 'lodash.sortby';
import * as table from 'text-table';

import { cutString } from 'sonarwhal/dist/src/lib/utils/misc';
import { debug as d } from 'sonarwhal/dist/src/lib/utils/debug';
import { IFormatter, Problem, Severity } from 'sonarwhal/dist/src/lib/types';
import * as logger from 'sonarwhal/dist/src/lib/utils/logging';

const _ = {
    forEach,
    groupBy,
    sortBy
};
const debug = d(__filename);

const printPosition = (position: number, text: string) => {
    if (position === -1) {
        return '';
    }

    return `${text} ${position}`;
};

/*
 * ------------------------------------------------------------------------------
 * Formatter
 * ------------------------------------------------------------------------------
 */

export default class StylishFormatter implements IFormatter {
    /** Format the problems grouped by `resource` name and sorted by line and column number */
    public format(messages: Array<Problem>) {

        debug('Formatting results');

        if (messages.length === 0) {
            return;
        }

        const resources: _.Dictionary<Array<Problem>> = _.groupBy(messages, 'resource');
        let totalErrors = 0;
        let totalWarnings = 0;

        _.forEach(resources, (msgs: Array<Problem>, resource: string) => {
            let warnings = 0;
            let errors = 0;
            const sortedMessages: Array<Problem> = _.sortBy(msgs, ['location.line', 'location.column']);
            const tableData: Array<Array<string>> = [];
            let hasPosition = false;

            logger.log(chalk.cyan(`${cutString(resource, 80)}`));

            _.forEach(sortedMessages, (msg: Problem) => {
                const severity: string = Severity.error === msg.severity ? chalk.red('Error') : chalk.yellow('Warning');

                if (Severity.error === msg.severity) {
                    errors++;
                } else {
                    warnings++;
                }

                const line: string = printPosition(msg.location.line, 'line');
                const column: string = printPosition(msg.location.column, 'col');

                if (line) {
                    hasPosition = true;
                }

                tableData.push([line, column, severity, msg.message, msg.ruleId]);
            });

            /*
             * If no message in this resource has a position, then we remove the
             * position components from the array to avoid unnecessary white spaces
             */
            if (!hasPosition) {
                tableData.forEach((row: Array<string>) => {
                    row.splice(0, 2);
                });
            }

            logger.log(table(tableData));

            const color: typeof chalk = errors > 0 ? chalk.red : chalk.yellow;

            totalErrors += errors;
            totalWarnings += warnings;

            logger.log(color.bold(`${logSymbols.error} Found ${errors} ${pluralize('error', errors)} and ${warnings} ${pluralize('warning', warnings)}`));
            logger.log('');
        });

        const color: typeof chalk = totalErrors > 0 ? chalk.red : chalk.yellow;

        logger.log(color.bold(`${logSymbols.error} Found a total of ${totalErrors} ${pluralize('error', totalErrors)} and ${totalWarnings} ${pluralize('warning', totalWarnings)}`));
    }
}
