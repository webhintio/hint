import chalk from 'chalk';
import * as _ from 'lodash';
import * as logSymbols from 'log-symbols';
import * as pluralize from 'pluralize';
import * as table from 'text-table';

import { cutString } from '../../utils/misc';
import { IProblem, Severity } from '../../types';
import { ISummaryResult } from './types';
import * as logger from '../../utils/logging';


const buildMessage = (count, type): string => {
    return `${count} ${pluralize(type, count)}`;
};

const printPosition = (position: number, text: string) => {
    if (position === -1) {
        return '';
    }

    return `${text} ${position}`;
};

/** Report number of errors and warnings. */
export const reportSummary = (errors: number, warnings: number, total: boolean = false) => {
    const color: typeof chalk = errors > 0 ? chalk.red : chalk.yellow;

    const message = `${logSymbols.error} Found ${total ? 'a total of ' : ''}${errors} ${pluralize('error', errors)} and ${warnings} ${pluralize('warning', warnings)}`;

    logger.log(color.bold(message));
};

/** Get summary from messages grouped by ruleId/category name. */
export const getSummary = (groupedMessages: _.Dictionary<Array<IProblem>>): ISummaryResult => {
    const tableData: Array<Array<string>> = [];
    let totalErrors: number = 0;
    let totalWarnings: number = 0;
    const ids: Array<string> = []; // category/rule ids to keep track of the data pushed to `tableData`.
    const sortedMessages = Object.entries(groupedMessages).sort(([keyA, problemsA], [keyB, problemsB]) => {
        if (problemsA.length < problemsB.length) {
            return -1;
        }

        if (problemsA.length > problemsB.length) {
            return 1;
        }

        return keyA.localeCompare(keyB);
    });

    _.forEach(sortedMessages, ([key, problems]) => {
        const msgsBySeverity = _.groupBy(problems, 'severity');
        const errors = msgsBySeverity[Severity.error] ? msgsBySeverity[Severity.error].length : 0;
        const warnings = msgsBySeverity[Severity.warning] ? msgsBySeverity[Severity.warning].length : 0;
        const color: typeof chalk = errors > 0 ? chalk.red : chalk.yellow;
        const message = errors ? buildMessage(errors, 'error') : buildMessage(warnings, 'warning');

        tableData.push([chalk.cyan(key), color(message)]);
        ids.push(key);

        totalErrors += errors;
        totalWarnings += warnings;
    });

    return {
        ids,
        tableData,
        totalErrors,
        totalWarnings
    };
};

/*
 * Print messages in table rows, grouped by `resource`.
 * For example:
 * https://cdn.jsdelivr.net/docsearch.js/2/docsearch.min.js
 * line 1  col 10676  Warning  'content-type' header should have media type 'text/javascript' (not 'application/javascript')  content-type
 */
export const printMessageByResource = (rawMsgs: Array<IProblem> | IProblem, logTotal: boolean = false) => {
    const messages: Array<IProblem> = Array.isArray(rawMsgs) ? rawMsgs : [rawMsgs];
    const resources: _.Dictionary<Array<IProblem>> = _.groupBy(messages, 'resource');
    let totalErrors: number = 0;
    let totalWarnings: number = 0;

    _.forEach(resources, (msgs: Array<IProblem>, resource: string) => {
        let warnings: number = 0;
        let errors: number = 0;
        const sortedMessages: Array<IProblem> = _.sortBy(msgs, ['location.line', 'location.column']);
        const tableData: Array<Array<string>> = [];
        let hasPosition: boolean = false;

        logger.log(chalk.cyan(`${cutString(resource, 80)}`));

        _.forEach(sortedMessages, (msg: IProblem) => {
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

        totalErrors += errors;
        totalWarnings += warnings;

        if (logTotal) {
            reportSummary(errors, warnings);
            logger.log('');
        }
    });

    return {
        totalErrors,
        totalWarnings
    };
};
