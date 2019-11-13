import anyTest, { TestInterface, ExecutionContext } from 'ava';
import * as chalk from 'chalk';
import * as logSymbols from 'log-symbols';
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

type StylishContext = {
    logging: Logging;
    loggingLogSpy: sinon.SinonSpy<any, void>;
    writeFileAsync: WriteFileAsync;
    writeFileAsyncDefaultStub: sinon.SinonStub<any, void>;
};

const test = anyTest as TestInterface<StylishContext>;

const initContext = (t: ExecutionContext<StylishContext>) => {
    t.context.logging = { log() { } };
    t.context.loggingLogSpy = sinon.spy(t.context.logging, 'log');
    t.context.writeFileAsync = () => { };
    t.context.writeFileAsyncDefaultStub = sinon.stub(t.context, 'writeFileAsync').returns();
};

const loadScript = (context: StylishContext) => {
    const script = proxyquire('../src/formatter', {
        '@hint/utils': { logger: context.logging },
        '@hint/utils-fs': { writeFileAsync: context.writeFileAsync }
    });

    return script.default;
};

const getExpectedLogResult = () => {
    let problem = problems.multipleproblemsandresources[1];
    let tableData = [];

    tableData.push(['', '', severityToColor(Severity.warning)('Warning'), problem.message, problem.hintId]);
    problem = problems.multipleproblemsandresources[0];
    tableData.push([`line ${problem.location.line}`, `col ${problem.location.column}`, severityToColor(Severity.warning)('Warning'), problem.message, problem.hintId]);
    problem = problems.multipleproblemsandresources[4];
    tableData.push([`line ${problem.location.line}`, `col ${problem.location.column}`, severityToColor(Severity.information)('Information'), problem.message, problem.hintId]);

    let tableString = table(tableData);

    let expectedLogResult = `${chalk.cyan('http://myresource.com/')}
${tableString}
${severityToColor(Severity.warning).bold(`${logSymbols.error} Found 0 errors, 2 warnings, 1 information and 0 hints`)}

${chalk.cyan('http://myresource2.com/this/resource/i … /resources/image/imagewithalongname.jpg')}`;

    tableData = [];
    problem = problems.multipleproblemsandresources[2];
    tableData.push([severityToColor(Severity.error)('Error'), problem.message, problem.hintId]);
    problem = problems.multipleproblemsandresources[3];
    tableData.push([severityToColor(Severity.hint)('Hint'), problem.message, problem.hintId]);
    tableString = table(tableData);

    expectedLogResult += `
${tableString}
${severityToColor(Severity.error).bold(`${logSymbols.error} Found 1 error, 0 warnings, 0 informations and 1 hint`)}

${severityToColor(Severity.error).bold(`${logSymbols.error} Found a total of 1 error, 2 warnings, 1 information and 1 hint`)}`;

    return expectedLogResult;
};

const getExpectedOutputResult = () => {
    let problem = problems.multipleproblemsandresources[1];
    let tableData = [];

    tableData.push(['', '', severityToColor(Severity.warning)('Warning'), problem.message, problem.hintId]);
    problem = problems.multipleproblemsandresources[0];
    tableData.push([`line ${problem.location.line}`, `col ${problem.location.column}`, severityToColor(Severity.warning)('Warning'), problem.message, problem.hintId]);
    problem = problems.multipleproblemsandresources[4];
    tableData.push([`line ${problem.location.line}`, `col ${problem.location.column}`, severityToColor(Severity.information)('Information'), problem.message, problem.hintId]);

    let tableString = table(tableData);

    let expectedLogResult = `http://myresource.com/
${tableString}
${logSymbols.error} Found 0 errors, 2 warnings, 1 information and 0 hints

http://myresource2.com/this/resource/i … /resources/image/imagewithalongname.jpg`;

    tableData = [];
    problem = problems.multipleproblemsandresources[2];
    tableData.push([severityToColor(Severity.error)('Error'), problem.message, problem.hintId]);
    problem = problems.multipleproblemsandresources[3];
    tableData.push([severityToColor(Severity.hint)('Hint'), problem.message, problem.hintId]);
    tableString = table(tableData);

    expectedLogResult += `
${tableString}
${logSymbols.error} Found 1 error, 0 warnings, 0 informations and 1 hint

${logSymbols.error} Found a total of 1 error, 2 warnings, 1 information and 1 hint`;

    return stripAnsi(expectedLogResult);
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
    const writeFileStub = t.context.writeFileAsyncDefaultStub;
    const expectedLogResult = getExpectedLogResult();

    t.is(log.args[0][0], expectedLogResult);
    t.is(log.callCount, 1);
    t.false(writeFileStub.called);
});

test(`Stylish formatter called with the output option should write the result in the output file`, (t) => {
    const StylishFormatter = loadScript(t.context);
    const formatter = new StylishFormatter();
    const outputFile = 'test.txt';

    formatter.format(problems.multipleproblemsandresources, { output: outputFile });

    const log = t.context.loggingLogSpy;
    const writeFileStub = t.context.writeFileAsyncDefaultStub;
    const expectedOutputResult = getExpectedOutputResult();
    const actualResult = writeFileStub.args[0][1];

    t.false(log.called);
    t.true(writeFileStub.calledOnce);
    t.is(writeFileStub.args[0][0], outputFile);
    t.is(actualResult, expectedOutputResult);
});
