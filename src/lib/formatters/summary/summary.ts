/**
 * @fileoverview The summary formatter, it outputs the aggregation of all the rule results in a table format.
 */

/*
 * ------------------------------------------------------------------------------
 * Requirements
 * ------------------------------------------------------------------------------
 */

import * as _ from 'lodash';
import { getSummary, reportTotal } from '../utils/common';
import { ISummaryResult } from '../utils/types';
import * as table from 'text-table';

import { debug as d } from '../../utils/debug';
import { IFormatter, IProblem } from '../../types';
import * as logger from '../../utils/logging';

const debug = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Formatter
 * ------------------------------------------------------------------------------
 */

const formatter: IFormatter = {
    /** Format the problems grouped by `ruleId` and sorted by line and column number */
    format(messages: Array<IProblem>) {
        debug('Formatting results');

        if (_.defaultTo(messages.length, 0) === 0) {
            return;
        }

        const resources: _.Dictionary<Array<IProblem>> = _.groupBy(messages, 'ruleId');
        const { tableData, totalErrors, totalWarnings }: ISummaryResult = getSummary(resources);

        logger.log(table(tableData));
        reportTotal(totalErrors, totalWarnings);
    }
};

export default formatter;
