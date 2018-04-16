import test from 'ava';
import chalk from 'chalk';
import * as sinon from 'sinon';
import * as proxyquire from 'proxyquire';
import * as table from 'text-table';
import * as logSymbols from 'log-symbols';

const logging = { log() { } };

proxyquire('../src/formatter', { 'sonarwhal/dist/src/lib/utils/logging': logging });

import StylishFormatter from '../src/formatter';
import * as problems from './fixtures/list-of-problems';

test.beforeEach((t) => {
    sinon.spy(logging, 'log');

    t.context.logger = logging;
});

test.afterEach.always((t) => {
    t.context.logger.log.restore();
});

test(`Stylish formatter doesn't print anything if no values`, (t) => {
    const formatter = new StylishFormatter();

    formatter.format(problems.noproblems);

    t.is(t.context.logger.log.callCount, 0);
});

test(`Stylish formatter prints a table and a summary for each resource`, (t) => {
    const formatter = new StylishFormatter();

    formatter.format(problems.multipleproblemsandresources);

    const log = t.context.logger.log;
    let problem = problems.multipleproblemsandresources[1];
    let tableData = [];

    tableData.push(['', '', chalk.yellow('Warning'), problem.message, problem.ruleId]);
    problem = problems.multipleproblemsandresources[0];
    tableData.push([`line ${problem.location.line}`, `col ${problem.location.column}`, chalk.yellow('Warning'), problem.message, problem.ruleId]);
    problem = problems.multipleproblemsandresources[4];
    tableData.push([`line ${problem.location.line}`, `col ${problem.location.column}`, chalk.yellow('Warning'), problem.message, problem.ruleId]);

    let tableString = table(tableData);

    t.is(log.args[0][0], chalk.cyan('http://myresource.com/'));
    t.is(log.args[1][0], tableString);
    t.is(log.args[2][0], chalk.yellow.bold(`${logSymbols.error} Found 0 errors and 3 warnings`));
    t.is(log.args[3][0], '');
    t.is(log.args[4][0], chalk.cyan('http://myresource2.com/this/resource/i … /resources/image/imagewithalongname.jpg'));

    tableData = [];
    problem = problems.multipleproblemsandresources[2];
    tableData.push([chalk.red('Error'), problem.message, problem.ruleId]);
    problem = problems.multipleproblemsandresources[3];
    tableData.push([chalk.yellow('Warning'), problem.message, problem.ruleId]);
    tableString = table(tableData);

    t.is(log.args[5][0], tableString);
    t.is(log.args[6][0], chalk.red.bold(`${logSymbols.error} Found 1 error and 1 warning`));
    t.is(log.args[7][0], '');
});
