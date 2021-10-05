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

import * as chalk from 'chalk';
import forEach = require('lodash/forEach');
import groupBy = require('lodash/groupBy');
import reduce = require('lodash/reduce');
import sortBy = require('lodash/sortBy');
import logSymbols from 'log-symbols';
import * as table from 'text-table';
const stripAnsi = require('strip-ansi');

import { logger, severityToColor, occurencesToColor } from '@hint/utils';
import { cutString } from '@hint/utils-string';
import { writeFileAsync } from '@hint/utils-fs';
import { debug as d } from '@hint/utils-debug';
import { FormatterOptions, IFormatter } from 'hint';
import { Problem, Severity } from '@hint/utils-types';

import { getMessage, MessageName } from './i18n.import';

const _ = {
    forEach,
    groupBy,
    reduce,
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
    public async format(messages: Problem[], options: FormatterOptions = {}) {
        const language: string = options.language!;

        debug('Formatting results');

        if (messages.length === 0) {
            return;
        }

        const resources: _.Dictionary<Problem[]> = _.groupBy(messages, 'resource');
        const totals = {
            [Severity.error.toString()]: 0,
            [Severity.warning.toString()]: 0,
            [Severity.information.toString()]: 0,
            [Severity.hint.toString()]: 0
        };

        let result = _.reduce(resources, (total: string, msgs: Problem[], resource: string) => {
            const partials = {
                [Severity.error.toString()]: 0,
                [Severity.warning.toString()]: 0,
                [Severity.information.toString()]: 0,
                [Severity.hint.toString()]: 0
            };
            const sortedMessages: Problem[] = _.sortBy(msgs, ['location.line', 'location.column']);
            const tableData: string[][] = [];
            let hasPosition: boolean = false;

            let partialResult = `${chalk.cyan(cutString(resource, 80))}\n`;

            _.forEach(sortedMessages, (msg: Problem) => {
                const color = severityToColor(msg.severity);
                const severity = color(getMessage(`capitalized${Severity[msg.severity].toString()}` as MessageName, language));

                partials[msg.severity.toString()]++;

                const line: string = printPosition(msg.location.line, getMessage('line', language));
                const column: string = printPosition(msg.location.column, getMessage('col', language));

                if (line) {
                    hasPosition = true;
                }

                tableData.push([line, column, severity, msg.message, msg.hintId]);
            });

            /*
             * If no message in this resource has a position, then we remove the
             * position components from the array to avoid unnecessary white spaces
             */
            if (!hasPosition) {
                tableData.forEach((row: string[]) => {
                    row.splice(0, 2);
                });
            }

            partialResult += `${table(tableData)}\n`;

            const color = occurencesToColor(partials);

            totals[Severity.error] += partials[Severity.error];
            totals[Severity.warning] += partials[Severity.warning];
            totals[Severity.information] += partials[Severity.information];
            totals[Severity.hint] += partials[Severity.hint];

            const foundMessage = getMessage('partialFound', language, [
                partials[Severity.error].toString(),
                partials[Severity.error] === 1 ? getMessage('error', language) : getMessage('errors', language),
                partials[Severity.warning].toString(),
                partials[Severity.warning] === 1 ? getMessage('warning', language) : getMessage('warnings', language),
                partials[Severity.hint].toString(),
                partials[Severity.hint] === 1 ? getMessage('hint', language) : getMessage('hints', language),
                partials[Severity.information].toString(),
                partials[Severity.information] === 1 ? getMessage('information', language) : getMessage('informations', language)
            ]);

            partialResult += color.bold(`${logSymbols.error} ${foundMessage}`);
            partialResult += '\n\n';

            return total + partialResult;
        }, '');

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

        result += color.bold(`${logSymbols.error} ${foundTotalMessage}`);

        if (!options.output) {
            logger.log(result);

            return;
        }

        await writeFileAsync(options.output, stripAnsi(result));
    }
}
