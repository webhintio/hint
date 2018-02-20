import test from 'ava';
import chalk from 'chalk';
import * as logSymbols from 'log-symbols';
import * as proxyquire from 'proxyquire';
import * as sinon from 'sinon';
import * as table from 'text-table';

const logging = { log() { } };

proxyquire('../src/summary', { 'sonarwhal/dist/src/lib/utils/logging': logging });

import summary from '../src/summary';
import * as problems from './fixtures/list-of-problems';

test.beforeEach((t) => {
    sinon.spy(logging, 'log');

    t.context.logger = logging;
});

test.afterEach.always((t) => {
    t.context.logger.log.restore();
});

test(`Summary formatter doesn't print anything if no values`, (t) => {
    summary.format(problems.noproblems);

    t.is(t.context.logger.log.callCount, 0);
});

test(`Summary formatter prints in yellow if only warnings found`, (t) => {
    const log = t.context.logger.log;
    const tableData = [];

    summary.format(problems.summaryWarnings);

    tableData.push([chalk.cyan('random-rule'), chalk.yellow(`2 warnings`)]);

    const tableString = table(tableData);

    t.is(log.args[0][0], tableString);
    t.is(log.args[1][0], chalk.yellow.bold(`${logSymbols.error.trim()} Found a total of 0 errors and 2 warnings`));
});

test(`Summary formatter prints a table and a summary for all resources combined`, (t) => {
    const log = t.context.logger.log;
    const tableData = [];

    summary.format(problems.summaryProblems);

    tableData.push([chalk.cyan('random-rule2'), chalk.red(`1 error`)]);
    tableData.push([chalk.cyan('random-rule'), chalk.yellow(`4 warnings`)]);

    const tableString = table(tableData);

    t.is(log.args[0][0], tableString);
    t.is(log.args[1][0], chalk.red.bold(`${logSymbols.error.trim()} Found a total of 1 error and 4 warnings`));
});

test(`Summary formatter sorts by name if same number of errors`, (t) => {
    const log = t.context.logger.log;
    const tableData = [];

    summary.format(problems.summarySameNumberOfErrors);

    tableData.push([chalk.cyan('random-rule'), chalk.red(`1 error`)]);
    tableData.push([chalk.cyan('random-rule2'), chalk.red(`1 error`)]);

    const tableString = table(tableData);

    t.is(log.args[0][0], tableString);
    t.is(log.args[1][0], chalk.red.bold(`${logSymbols.error.trim()} Found a total of 2 errors and 0 warnings`));
});
