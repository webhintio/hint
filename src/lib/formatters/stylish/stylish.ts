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
import { debug as d } from '../../utils/debug';
import { printMessageByResource, reportTotal } from '../utils/common';
import { IFormatter, IProblem } from '../../types';

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

        if (messages.length === 0) {
            return;
        }

        const { totalErrors, totalWarnings } = printMessageByResource(messages, true);

        reportTotal(totalErrors, totalWarnings);
    }
};

export default formatter;
