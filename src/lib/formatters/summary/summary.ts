/**
 * @fileoverview The summary formatter, it outputs the aggregation of all the rule results in a table format.
 */

/*
 * ------------------------------------------------------------------------------
 * Requirements
 * ------------------------------------------------------------------------------
 */

import * as chalk from 'chalk';
import * as _ from 'lodash';
import * as pluralize from 'pluralize';
import * as table from 'text-table';
import * as logSymbols from 'log-symbols';

import { debug as d } from '../../utils/debug';
import { IFormatter, IProblem, Severity } from '../../types';
import * as logger from '../../utils/logging';

const debug = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Formatter
 * ------------------------------------------------------------------------------
 */

const formatter: IFormatter = {
    /** Format the problems grouped by `resource` name and sorted by line and column number */
    format(messages: Array<IProblem>) {
        debug('Formatting results');

        if (_.defaultTo(messages.length, 0) === 0) {
            return;
        }

        const buildMessage = (count, type) => {
            return `${count} ${pluralize(type, count)}`;
        };

        const tableData: Array<Array<string>> = [];
        let totalErrors: number = 0;
        let totalWarnings: number = 0;
        const resources: _.Dictionary<Array<IProblem>> = _.groupBy(messages, 'ruleId');
        const sortedResources = Object.entries(resources).sort(([ruleA, problemsA], [ruleB, problemsB]) => {
            if (problemsA.length < problemsB.length) {
                return -1;
            }

            if (problemsA.length > problemsB.length) {
                return 1;
            }

            return ruleA.localeCompare(ruleB);
        });

        _.forEach(sortedResources, ([ruleId, problems]) => {
            const msgsBySeverity = _.groupBy(problems, 'severity');
            const errors = msgsBySeverity[Severity.error] ? msgsBySeverity[Severity.error].length : 0;
            const warnings = msgsBySeverity[Severity.warning] ? msgsBySeverity[Severity.warning].length : 0;
            const color: chalk.ChalkChain = errors > 0 ? chalk.red : chalk.yellow;
            const message = errors ? buildMessage(errors, 'error') : buildMessage(warnings, 'warning');

            tableData.push([chalk.cyan(ruleId), color(message)]);

            totalErrors += errors;
            totalWarnings += warnings;
        });

        logger.log(table(tableData));

        const color: chalk.ChalkChain = totalErrors > 0 ? chalk.red : chalk.yellow;

        logger.log(color.bold(`${logSymbols.error} Found a total of ${totalErrors} ${pluralize('error', totalErrors)} and ${totalWarnings} ${pluralize('warning', totalWarnings)}`));
    }
};

export default formatter;
