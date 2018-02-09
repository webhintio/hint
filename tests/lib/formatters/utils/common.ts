import test from 'ava';
import chalk from 'chalk';
import * as logSymbols from 'log-symbols';
import * as sinon from 'sinon';
import * as proxyquire from 'proxyquire';
import * as table from 'text-table';

const logging = { log() { } };

proxyquire('../../../../src/lib/formatters/utils/common', { '../../utils/logging': logging });

import * as common from '../../../../src/lib/formatters/utils/common';
import * as problems from '../fixtures/list-of-problems';

const generateTableStringHasLocation = (problem) => {
    const tableData = [];
    let p = problem;

    tableData.push(['', '', chalk.yellow('Warning'), p.message, p.ruleId]);
    p = problems.multipleproblemsandresources[0];
    tableData.push([`line ${p.location.line}`, `col ${p.location.column}`, chalk.yellow('Warning'), p.message, p.ruleId]);
    p = problems.multipleproblemsandresources[4];
    tableData.push([`line ${p.location.line}`, `col ${p.location.column}`, chalk.yellow('Warning'), p.message, p.ruleId]);

    return table(tableData);
};

const generateTableStringnoLocation = (problem) => {
    const tableData = [];
    let p = problem;

    tableData.push([chalk.red('Error'), p.message, p.ruleId]);
    p = problems.multipleproblemsandresources[3];
    tableData.push([chalk.yellow('Warning'), p.message, p.ruleId]);

    return table(tableData);
};

test.beforeEach((t) => {
    sinon.spy(logging, 'log');

    t.context.logger = logging;
});

test.afterEach.always((t) => {
    t.context.logger.log.restore();
});

test(`'printMessageByResource' prints a table and a summary for each resource if flag set to 'true'`, (t) => {
    common.printMessageByResource(problems.multipleproblemsandresources, true);

    const log = t.context.logger.log;
    const hasLocationTableString = generateTableStringHasLocation(problems.multipleproblemsandresources[1]);
    const noLocationTableString = generateTableStringnoLocation(problems.multipleproblemsandresources[2]);

    t.is(log.args[0][0], chalk.cyan('http://myresource.com/'));
    t.is(log.args[1][0], hasLocationTableString);
    t.is(log.args[2][0], chalk.yellow.bold(`${logSymbols.error} Found 0 errors and 3 warnings`));
    t.is(log.args[3][0], '');
    t.is(log.args[4][0], chalk.cyan('http://myresource2.com/this/resource/i … /resources/image/imagewithalongname.jpg'));
    t.is(log.args[5][0], noLocationTableString);
    t.is(log.args[6][0], chalk.red.bold(`${logSymbols.error} Found 1 error and 1 warning`));
    t.is(log.args[7][0], '');
});

test(`'printMessageByResource' prints a table and no summary for each resource if flag is not set to 'true'`, (t) => {
    common.printMessageByResource(problems.multipleproblemsandresources);
    const log = t.context.logger.log;
    const hasLocationTableString = generateTableStringHasLocation(problems.multipleproblemsandresources[1]);
    const noLocationTableString = generateTableStringnoLocation(problems.multipleproblemsandresources[2]);

    t.is(log.args[0][0], chalk.cyan('http://myresource.com/'));
    t.is(log.args[1][0], hasLocationTableString);
    t.is(log.args[2][0], chalk.cyan('http://myresource2.com/this/resource/i … /resources/image/imagewithalongname.jpg'));
    t.is(log.args[3][0], noLocationTableString);
});

test(`'getSummary' sort the grouped messages and return the tableData and stats to be printed`, (t) => {
    const { tableData, sequence, totalErrors, totalWarnings } = common.getSummary(problems.groupedProblems);

    t.is(tableData[0][0], chalk.cyan('interoperability'));
    t.is(tableData[0][1], chalk.yellow('1 warning'));
    t.is(tableData[1][0], chalk.cyan('security'));
    t.is(tableData[1][1], chalk.yellow('3 warnings'));
    t.is(sequence[0], 'interoperability');
    t.is(sequence[1], 'security');
    t.is(totalErrors, 0);
    t.is(totalWarnings, 4);
});

test(`'reportTotal' reports the correct messages`, (t) => {
    const log = t.context.logger.log;

    common.reportTotal(1, 2, false);
    common.reportTotal(0, 2, true);

    t.is(log.args[0][0], chalk.red.bold(`${logSymbols.error} Found 1 error and 2 warnings`));
    t.is(log.args[1][0], chalk.yellow.bold(`${logSymbols.error} Found a total of 0 errors and 2 warnings`));
});
