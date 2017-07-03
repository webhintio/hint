/**
 * @fileoverview The codeframe formatter creates a report with errors, warnings,
 * and the code with a pointer where the problem was found (if applicable).
 *
 * This formatter is based on [eslint's codeframe formatter](https://github.com/eslint/eslint/blob/master/lib/formatters/codeframe.js)
 */

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

import * as chalk from 'chalk';
import * as _ from 'lodash';
import * as pluralize from 'pluralize';

import { cutString } from '../../utils/misc';
import { IFormatter, IProblem, IProblemLocation, Severity } from '../../types'; // eslint-disable-line no-unused-vars

const countLeftWhiteSpaces = (txt: string): number => {
    const match = txt.match(/(\s+)/);

    if (!match) {
        return 0;
    }

    return match[0].length;
};

const safeTrim = (txt: string, charsToRemove: number): boolean => {
    return (/^\s+$/).test(txt.substr(0, charsToRemove));
};

const codeFrame = (code: string, location: IProblemLocation) => {
    const logger = require('../../utils/logging')(__filename, false); // Initiate logger here so that methods could be stubbed in the tests
    const codeInLines: Array<string> = `\n${code}`.split('\n');
    const whiteSpacesToRemove: number = countLeftWhiteSpaces(codeInLines[codeInLines.length - 1]);
    const line: number = location.elementLine;
    const column: number = location.elementColumn;
    const offsetColumn: number = location.column;
    const extraLinesToShow: number = 2;
    const firstLine: number = line - extraLinesToShow > 0 ? line - extraLinesToShow : 0;
    const lastLine: number = line + (extraLinesToShow + 1) < codeInLines.length ? line + (extraLinesToShow + 1) : codeInLines.length;

    if (firstLine !== 0) {
        logger.log('…');
    }

    for (let i: number = firstLine; i < lastLine; i++) {
        let result: string = null;
        let mark: string = null;
        const canTrim: boolean = safeTrim(codeInLines[i], whiteSpacesToRemove);

        if (i === 1 || !canTrim) {
            result = codeInLines[i];
        } else {
            //The first line doesn't have spaces but the other elements keep the original format
            result = codeInLines[i].substr(whiteSpacesToRemove);
        }

        if (i === line) {
            let markPosition: number = column;

            if (canTrim) {
                markPosition -= whiteSpacesToRemove;
            }

            if (line !== 1 && canTrim) {
                markPosition += offsetColumn;
            }

            if (markPosition < 0) {
                markPosition = 0;
            }

            const cutPosition: number = line !== 1 ? markPosition : column;

            if (cutPosition > 50) {
                markPosition = 50 + 3;
                result = `… ${result.substr(column - 50)}`;
            }

            if (result.length > cutPosition + 50) {
                result = `${result.substr(0, cutPosition + 50)} …`;
            }

            mark = `${new Array(markPosition).join(' ')}^`;
        }

        logger.log(result);

        if (mark) {
            logger.log(mark);
        }
    }

    if (lastLine !== codeInLines.length) {
        logger.log('…');
    }
};

// ------------------------------------------------------------------------------
// Formatter
// ------------------------------------------------------------------------------

const formatter: IFormatter = {
    /** Format the problems grouped by `resource` name and sorted by line and column number,
     *  indicating where in the element there is an error.
     */
    format(messages: Array<IProblem>) {
        const logger = require('../../utils/logging')(__filename, false); // Initiate logger here so that methods could be stubbed in tests

        logger.debug('Formatting results');

        if (messages.length === 0) {
            return;
        }

        const resources: _.Dictionary<Array<IProblem>> = _.groupBy(messages, 'resource');
        let totalErrors: number = 0;
        let totalWarnings: number = 0;

        _.forEach(resources, (msgs: Array<IProblem>, resource: string) => {
            const sortedMessages: Array<IProblem> = _.sortBy(msgs, ['location.line', 'location.column']);
            const resourceString = chalk.cyan(`${cutString(resource, 80)}`);

            _.forEach(sortedMessages, (msg: IProblem) => {
                const severity = Severity.error === msg.severity ? chalk.red('Error') : chalk.yellow('Warning');
                const location = msg.location;

                if (Severity.error === msg.severity) {
                    totalErrors++;
                } else {
                    totalWarnings++;
                }

                logger.log(`${severity}: ${msg.message} (${msg.ruleId}) at ${resourceString}${msg.sourceCode ? `:${location.line}:${location.column}` : ''}`);

                if (msg.sourceCode) {
                    codeFrame(msg.sourceCode, location);
                }

                logger.log('');
            });
        });

        const color: chalk.ChalkChain = totalErrors > 0 ? chalk.red : chalk.yellow;

        logger.log(color.bold(`\u2716 Found a total of ${totalErrors} ${pluralize('error', totalErrors)} and ${totalWarnings} ${pluralize('warning', totalWarnings)}`));
    }
};

export default formatter;
