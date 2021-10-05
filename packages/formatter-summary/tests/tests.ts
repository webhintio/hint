import anyTest, { TestInterface, ExecutionContext } from 'ava';
import * as chalk from 'chalk';
import logSymbols from 'log-symbols';
import * as proxyquire from 'proxyquire';
import * as sinon from 'sinon';
import * as table from 'text-table';
const stripAnsi = require('strip-ansi');

import * as problems from './fixtures/list-of-problems';
import { severityToColor } from '@hint/utils';
import { Severity } from '@hint/utils-types';

type Logging = {
    log: () => void;
};

type WriteFileAsync = () => void;

type SummaryContext = {
    logging: Logging;
    loggingLogSpy: sinon.SinonSpy<any, void>;
    writeFileAsync: WriteFileAsync;
    writeFileAsyncDefaultStub: sinon.SinonStub<any, void>;
};

const test = anyTest as TestInterface<SummaryContext>;

const initContext = (t: ExecutionContext<SummaryContext>) => {
    t.context.logging = { log() { } };
    t.context.loggingLogSpy = sinon.spy(t.context.logging, 'log');
    t.context.writeFileAsync = () => { };
    t.context.writeFileAsyncDefaultStub = sinon.stub(t.context, 'writeFileAsync').returns();
};

const loadScript = (context: SummaryContext) => {
    const script = proxyquire('../src/formatter', {
        '@hint/utils': { logger: context.logging },
        '@hint/utils-fs': { writeFileAsync: context.writeFileAsync }
    });

    return script.default;
};

test.beforeEach(initContext);

test.afterEach.always((t) => {
    t.context.loggingLogSpy.restore();
});

test(`Summary formatter doesn't print anything if no values`, (t) => {
    const SummaryFormatter = loadScript(t.context);
    const formatter = new SummaryFormatter();

    formatter.format(problems.noproblems);

    t.is(t.context.loggingLogSpy.callCount, 0);
});

test(`Summary formatter prints in yellow if only warnings found`, (t) => {
    const log = t.context.loggingLogSpy;
    const writeFileStub = t.context.writeFileAsyncDefaultStub;
    const tableData = [];

    const SummaryFormatter = loadScript(t.context);
    const formatter = new SummaryFormatter();

    formatter.format(problems.summaryWarnings);

    tableData.push([chalk.cyan('random-hint'), severityToColor(Severity.warning)(`2 warnings`)]);

    const expectedResult = `${table(tableData)}
${severityToColor(Severity.warning).bold(`${logSymbols.error.trim()} Found a total of 0 errors, 2 warnings, 0 hints and 0 informations`)}`;

    t.true(log.calledOnce);
    t.false(writeFileStub.calledOnce);
    t.is(log.args[0][0], expectedResult);
});

test(`Summary formatter prints a table and a summary for all resources combined`, (t) => {
    const log = t.context.loggingLogSpy;
    const writeFileStub = t.context.writeFileAsyncDefaultStub;
    const tableData = [];

    const SummaryFormatter = loadScript(t.context);
    const formatter = new SummaryFormatter();

    formatter.format(problems.summaryProblems);

    tableData.push([chalk.cyan('random-hint2'), severityToColor(Severity.error)(`1 error`)]);
    tableData.push([chalk.cyan('random-hint'), severityToColor(Severity.warning)(`2 warnings`), severityToColor(Severity.hint)('1 hint'), severityToColor(Severity.information)('1 information')]);

    const expectedResult = `${table(tableData)}
${severityToColor(Severity.error).bold(`${logSymbols.error.trim()} Found a total of 1 error, 2 warnings, 1 hint and 1 information`)}`;

    t.true(log.calledOnce);
    t.false(writeFileStub.calledOnce);
    t.is(log.args[0][0], expectedResult);
});

test(`Summary formatter sorts by name if same number of errors`, (t) => {
    const log = t.context.loggingLogSpy;
    const writeFileStub = t.context.writeFileAsyncDefaultStub;
    const tableData = [];

    const SummaryFormatter = loadScript(t.context);
    const formatter = new SummaryFormatter();

    formatter.format(problems.summarySameNumberOfErrors);

    tableData.push([chalk.cyan('random-hint'), severityToColor(Severity.error)(`1 error`)]);
    tableData.push([chalk.cyan('random-hint2'), severityToColor(Severity.error)(`1 error`)]);

    const expectedResult = `${table(tableData)}
${severityToColor(Severity.error).bold(`${logSymbols.error.trim()} Found a total of 2 errors, 0 warnings, 0 hints and 0 informations`)}`;

    t.true(log.calledOnce);
    t.false(writeFileStub.calledOnce);
    t.is(log.args[0][0], expectedResult);
});

test(`Summary formatter prints errors and warnings for a hint that reports both`, (t) => {
    const log = t.context.loggingLogSpy;
    const writeFileStub = t.context.writeFileAsyncDefaultStub;
    const tableData = [];

    const SummaryFormatter = loadScript(t.context);
    const formatter = new SummaryFormatter();

    formatter.format(problems.summaryErrorWarnings);

    tableData.push([chalk.cyan('random-hint'), severityToColor(Severity.error)(`1 error`), severityToColor(Severity.warning)(`1 warning`)]);

    const expectedResult = `${table(tableData)}
${severityToColor(Severity.error).bold(`${logSymbols.error.trim()} Found a total of 1 error, 1 warning, 0 hints and 0 informations`)}`;

    t.true(log.calledOnce);
    t.false(writeFileStub.calledOnce);
    t.is(log.args[0][0], expectedResult);
});

test(`Summary formatter called with the output option should write the result in the output file`, (t) => {
    const log = t.context.loggingLogSpy;
    const writeFileStub = t.context.writeFileAsyncDefaultStub;
    const tableData = [];
    const outputFile = 'output.json';

    const SummaryFormatter = loadScript(t.context);
    const formatter = new SummaryFormatter();

    formatter.format(problems.summaryErrorWarnings, { output: outputFile });

    tableData.push(['random-hint', '1 error', '1 warning']);

    const expectedResult = `${table(tableData)}
${stripAnsi(logSymbols.error.trim())} Found a total of 1 error, 1 warning, 0 hints and 0 informations`;

    t.false(log.calledOnce);
    t.true(writeFileStub.calledOnce);
    t.is(writeFileStub.args[0][0], outputFile);
    t.is(writeFileStub.args[0][1], expectedResult);
});
