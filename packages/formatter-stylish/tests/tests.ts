import anyTest, { TestInterface, ExecutionContext } from 'ava';
import chalk from 'chalk';
import * as logSymbols from 'log-symbols';
import * as proxyquire from 'proxyquire';
import * as sinon from 'sinon';
import * as table from 'text-table';

import * as problems from './fixtures/list-of-problems';

type Logging = {
    log: () => void;
};

type StylishContext = {
    logging: Logging;
    loggingLogSpy: sinon.SinonSpy<any, void>;
};

const test = anyTest as TestInterface<StylishContext>;

const initContext = (t: ExecutionContext<StylishContext>) => {
    t.context.logging = { log() { } };
    t.context.loggingLogSpy = sinon.spy(t.context.logging, 'log');
};

const loadScript = (context: StylishContext) => {
    const script = proxyquire('../src/formatter', { 'hint/dist/src/lib/utils/logging': context.logging });

    return script.default;
};

test.beforeEach(initContext);

test.afterEach.always((t) => {
    t.context.loggingLogSpy.restore();
});

test(`Stylish formatter doesn't print anything if no values`, (t) => {
    const StylishFormatter = loadScript(t.context);
    const formatter = new StylishFormatter();

    formatter.format(problems.noproblems);

    t.is(t.context.loggingLogSpy.callCount, 0);
});

test(`Stylish formatter prints a table and a summary for each resource`, (t) => {
    const StylishFormatter = loadScript(t.context);
    const formatter = new StylishFormatter();

    formatter.format(problems.multipleproblemsandresources);

    const log = t.context.loggingLogSpy;
    let problem = problems.multipleproblemsandresources[1];
    let tableData = [];

    tableData.push(['', '', chalk.yellow('Warning'), problem.message, problem.hintId]);
    problem = problems.multipleproblemsandresources[0];
    tableData.push([`line ${problem.location.line}`, `col ${problem.location.column}`, chalk.yellow('Warning'), problem.message, problem.hintId]);
    problem = problems.multipleproblemsandresources[4];
    tableData.push([`line ${problem.location.line}`, `col ${problem.location.column}`, chalk.yellow('Warning'), problem.message, problem.hintId]);

    let tableString = table(tableData);

    t.is(log.args[0][0], chalk.cyan('http://myresource.com/'));
    t.is(log.args[1][0], tableString);
    t.is(log.args[2][0], chalk.yellow.bold(`${logSymbols.error} Found 0 errors and 3 warnings`));
    t.is(log.args[3][0], '');
    t.is(log.args[4][0], chalk.cyan('http://myresource2.com/this/resource/i … /resources/image/imagewithalongname.jpg'));

    tableData = [];
    problem = problems.multipleproblemsandresources[2];
    tableData.push([chalk.red('Error'), problem.message, problem.hintId]);
    problem = problems.multipleproblemsandresources[3];
    tableData.push([chalk.yellow('Warning'), problem.message, problem.hintId]);
    tableString = table(tableData);

    t.is(log.args[5][0], tableString);
    t.is(log.args[6][0], chalk.red.bold(`${logSymbols.error} Found 1 error and 1 warning`));
    t.is(log.args[7][0], '');
});
