/**
 * @fileoverview The summary formatter, it outputs the aggregation of all the hint results in a table format.
 */

/*
 * ------------------------------------------------------------------------------
 * Requirements
 * ------------------------------------------------------------------------------
 */

import * as chalk from 'chalk';
import forEach = require('lodash/forEach');
import groupBy = require('lodash/groupBy');
import * as table from 'text-table';
import logSymbols from 'log-symbols';
const stripAnsi = require('strip-ansi');

import { logger, severityToColor, occurencesToColor } from '@hint/utils';
import { writeFileAsync } from '@hint/utils-fs';
import { debug as d } from '@hint/utils-debug';
import { FormatterOptions, IFormatter } from 'hint';
import { Problem, Severity } from '@hint/utils-types';

import { getMessage } from './i18n.import';

const _ = {
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
    public async format(messages: Problem[], options: FormatterOptions = {}) {
        debug('Formatting results');

        if (messages.length === 0) {
            return;
        }

        const tableData: string[][] = [];
        const language: string = options.language!;
        const totals = {
            [Severity.error.toString()]: 0,
            [Severity.warning.toString()]: 0,
            [Severity.information.toString()]: 0,
            [Severity.hint.toString()]: 0
        };
        const resources: _.Dictionary<Problem[]> = _.groupBy(messages, 'hintId');
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
            const informations = msgsBySeverity[Severity.information] ? msgsBySeverity[Severity.information].length : 0;
            const hints = msgsBySeverity[Severity.hint] ? msgsBySeverity[Severity.hint].length : 0;
            const red = severityToColor(Severity.error);
            const yellow = severityToColor(Severity.warning);
            const gray = severityToColor(Severity.information);
            const pink = severityToColor(Severity.hint);
            const line: string[] = [chalk.cyan(hintId)];

            if (errors > 0) {
                line.push(red(getMessage(errors === 1 ? 'errorCount' : 'errorsCount', language, errors.toString())));
            }
            if (warnings > 0) {
                line.push(yellow(getMessage(warnings === 1 ? 'warningCount' : 'warningsCount', language, warnings.toString())));
            }
            if (hints > 0) {
                line.push(pink(getMessage(hints === 1 ? 'hintCount' : 'hintsCount', language, hints.toString())));
            }
            if (informations > 0) {
                line.push(gray(getMessage(informations === 1 ? 'informationCount' : 'informationsCount', language, informations.toString())));
            }

            tableData.push(line);

            totals[Severity.error.toString()] += errors;
            totals[Severity.warning.toString()] += warnings;
            totals[Severity.information.toString()] += informations;
            totals[Severity.hint.toString()] += hints;
        });

        const color = occurencesToColor(totals);
        const foundTotalMessage = getMessage('totalFound', language, [
            totals[Severity.error].toString(),
            totals[Severity.error] === 1 ? getMessage('error', language) : getMessage('errors', language),
            totals[Severity.warning].toString(),
            totals[Severity.warning] === 1 ? getMessage('warning', language) : getMessage('warnings', language),
            totals[Severity.hint].toString(),
            totals[Severity.hint] === 1 ? getMessage('hint', language) : getMessage('hints', language),
            totals[Severity.information].toString(),
            totals[Severity.information] === 1 ? getMessage('information', language) : getMessage('informations', language)
        ]);

        const result = `${table(tableData)}
${color.bold(`${logSymbols.error} ${foundTotalMessage}`)}`;

        if (!options.output) {
            logger.log(result);

            return;
        }

        await writeFileAsync(options.output, stripAnsi(result));
    }
}
