/**
 * @fileoverview The summary formatter, it outputs the aggregation of all the hint results in a table format.
 */

/*
 * ------------------------------------------------------------------------------
 * Requirements
 * ------------------------------------------------------------------------------
 */

import chalk from 'chalk';
import * as forEach from 'lodash.foreach';
import * as groupBy from 'lodash.groupby';
import * as defaultTo from 'lodash.defaultto';
import * as table from 'text-table';
import * as logSymbols from 'log-symbols';

import { debug as d } from 'hint/dist/src/lib/utils/debug';
import { IFormatter, Problem, Severity } from 'hint/dist/src/lib/types';
import * as logger from 'hint/dist/src/lib/utils/logging';

const _ = {
    defaultTo,
    forEach,
    groupBy
};
const debug = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Formatter
 * ------------------------------------------------------------------------------
 */

export default class SummaryFormatter implements IFormatter {
    /** Format the problems grouped by `resource` name and sorted by line and column number */
    public format(messages: Array<Problem>) {
        debug('Formatting results');

        if (_.defaultTo(messages.length, 0) === 0) {
            return;
        }

        const buildMessage = (count, type) => {
            return `${count} ${type}${count === 1 ? '' : 's'}`;
        };

        const tableData: Array<Array<string>> = [];
        let totalErrors: number = 0;
        let totalWarnings: number = 0;
        const resources: _.Dictionary<Array<Problem>> = _.groupBy(messages, 'hintId');
        const sortedResources = Object.entries(resources).sort(([hintA, problemsA], [hintB, problemsB]) => {
            if (problemsA.length < problemsB.length) {
                return -1;
            }

            if (problemsA.length > problemsB.length) {
                return 1;
            }

            return hintA.localeCompare(hintB);
        });

        _.forEach(sortedResources, ([hintId, problems]) => {
            const msgsBySeverity = _.groupBy(problems, 'severity');
            const errors = msgsBySeverity[Severity.error] ? msgsBySeverity[Severity.error].length : 0;
            const warnings = msgsBySeverity[Severity.warning] ? msgsBySeverity[Severity.warning].length : 0;
            const color: typeof chalk = errors > 0 ? chalk.red : chalk.yellow;
            const message = errors ? buildMessage(errors, 'error') : buildMessage(warnings, 'warning');

            tableData.push([chalk.cyan(hintId), color(message)]);

            totalErrors += errors;
            totalWarnings += warnings;
        });

        logger.log(table(tableData));

        const color: typeof chalk = totalErrors > 0 ? chalk.red : chalk.yellow;

        logger.log(color.bold(`${logSymbols.error} Found a total of ${totalErrors} ${totalErrors === 1 ? 'error' : 'errors'} and ${totalWarnings} ${totalWarnings === 1 ? 'warning' : 'warnings'}`));
    }
}
