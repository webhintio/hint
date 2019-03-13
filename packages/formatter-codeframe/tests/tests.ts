import anyTest, { TestInterface, ExecutionContext } from 'ava';
import chalk from 'chalk';
import * as sinon from 'sinon';
import * as proxyquire from 'proxyquire';
import * as logSymbols from 'log-symbols';
const stripAnsi = require('strip-ansi');

import * as problems from './fixtures/list-of-problems';

type Logging = {
    log: () => void;
};

type WriteFileAsync = {
    default: () => void;
};

type CodeframeContext = {
    logging: Logging;
    loggingLogSpy: sinon.SinonSpy<any, void>;
    writeFileAsync: WriteFileAsync;
    writeFileAsyncDefaultStub: sinon.SinonStub<any, void>;
};

const test = anyTest as TestInterface<CodeframeContext>;

const initContext = (t: ExecutionContext<CodeframeContext>) => {
    t.context.logging = { log() { } };
    t.context.loggingLogSpy = sinon.spy(t.context.logging, 'log');
    t.context.writeFileAsync = { default() { } };
    t.context.writeFileAsyncDefaultStub = sinon.stub(t.context.writeFileAsync, 'default').returns();
};

const loadScript = (context: CodeframeContext) => {
    const script = proxyquire('../src/formatter', {
        'hint/dist/src/lib/utils/fs/write-file-async': context.writeFileAsync,
        'hint/dist/src/lib/utils/logging': context.logging
    });

    return script.default;
};

test.beforeEach(initContext);

test.afterEach.always((t) => {
    t.context.loggingLogSpy.restore();
});

test(`Codeframe formatter doesn't print anything if no values`, (t) => {
    const CodeframeFormatter = loadScript(t.context);
    const formatter = new CodeframeFormatter();

    formatter.format(problems.noproblems);

    t.is(t.context.loggingLogSpy.callCount, 0);
});

const generateExpectedLogResult = () => {
    let problem = problems.codeframeproblems[0];

    let expectedLogResult = `${chalk.yellow('Warning')}: ${problem.message} (${problem.hintId}) at ${chalk.cyan(problem.resource)}`;

    problem = problems.codeframeproblems[1];
    let sourceCode = problem.sourceCode.split('\n');

    expectedLogResult += `

${chalk.yellow('Warning')}: ${problem.message} (${problem.hintId}) at ${chalk.cyan(problem.resource)}:${problem.location.line}:${problem.location.column}

${sourceCode[0]}
^
${sourceCode[1]}
${sourceCode[2]}
…`;

    problem = problems.codeframeproblems[2];
    sourceCode = problem.sourceCode.split('\n');

    expectedLogResult += `

${chalk.yellow('Warning')}: ${problem.message} (${problem.hintId}) at ${chalk.cyan(problem.resource)}:${problem.location.line}:${problem.location.column}

${sourceCode[0]}
^
${sourceCode[1]}
${sourceCode[2]}
…`;

    problem = problems.codeframeproblems[3];
    sourceCode = problem.sourceCode.split('\n');

    expectedLogResult += `

${chalk.yellow('Warning')}: ${problem.message} (${problem.hintId}) at ${chalk.cyan(problem.resource)}:${problem.location.line}:${problem.location.column}

${sourceCode[0]}
${sourceCode[1].substr(8)}
              ^
${sourceCode[2].substr(8)}`;

    problem = problems.codeframeproblems[4];
    sourceCode = problem.sourceCode.split('\n');

    expectedLogResult += `

${chalk.red('Error')}: ${problem.message} (${problem.hintId}) at ${chalk.cyan(problem.resource)}:${problem.location.line}:${problem.location.column}

${sourceCode[0]}
${sourceCode[1]}
      ^
${sourceCode[2].substr(8)}
${sourceCode[3]}
…

${chalk.red.bold(`${logSymbols.error} Found a total of 1 error and 4 warnings`)}`;

    return expectedLogResult;
};

const generateExpectedOutputResult = () => {
    let problem = problems.codeframeproblems[0];

    let expectedLogResult = `Warning: ${problem.message} (${problem.hintId}) at ${problem.resource}`;

    problem = problems.codeframeproblems[1];
    let sourceCode = problem.sourceCode.split('\n');

    expectedLogResult += `

Warning: ${problem.message} (${problem.hintId}) at ${problem.resource}:${problem.location.line}:${problem.location.column}

${sourceCode[0]}
^
${sourceCode[1]}
${sourceCode[2]}
…`;

    problem = problems.codeframeproblems[2];
    sourceCode = problem.sourceCode.split('\n');

    expectedLogResult += `

Warning: ${problem.message} (${problem.hintId}) at ${problem.resource}:${problem.location.line}:${problem.location.column}

${sourceCode[0]}
^
${sourceCode[1]}
${sourceCode[2]}
…`;

    problem = problems.codeframeproblems[3];
    sourceCode = problem.sourceCode.split('\n');

    expectedLogResult += `

Warning: ${problem.message} (${problem.hintId}) at ${problem.resource}:${problem.location.line}:${problem.location.column}

${sourceCode[0]}
${sourceCode[1].substr(8)}
              ^
${sourceCode[2].substr(8)}`;

    problem = problems.codeframeproblems[4];
    sourceCode = problem.sourceCode.split('\n');

    expectedLogResult += `

Error: ${problem.message} (${problem.hintId}) at ${problem.resource}:${problem.location.line}:${problem.location.column}

${sourceCode[0]}
${sourceCode[1]}
      ^
${sourceCode[2].substr(8)}
${sourceCode[3]}
…

${stripAnsi(logSymbols.error)} Found a total of 1 error and 4 warnings`;

    return expectedLogResult;
};

test(`Codeframe formatter prints a table and a summary for each resource`, (t) => {
    const CodeframeFormatter = loadScript(t.context);
    const formatter = new CodeframeFormatter();

    formatter.format(problems.codeframeproblems);

    const log = t.context.loggingLogSpy;
    const writeFileStub = t.context.writeFileAsyncDefaultStub;
    const expectedLogResult = generateExpectedLogResult();

    t.is(log.args[0][0], expectedLogResult);
    t.false(writeFileStub.called);
});

test(`Codeframe formatter called with the output option should write the result in the output file`, (t) => {
    const CodeframeFormatter = loadScript(t.context);
    const formatter = new CodeframeFormatter();
    const outputFile = 'output.json';

    formatter.format(problems.codeframeproblems, null, { output: outputFile });

    const log = t.context.loggingLogSpy;
    const writeFileStub = t.context.writeFileAsyncDefaultStub;
    const expectedOutputResult = generateExpectedOutputResult();

    t.false(log.called);
    t.true(writeFileStub.calledOnce);
    t.is(writeFileStub.args[0][0], outputFile);
    t.is(writeFileStub.args[0][1], expectedOutputResult);
});
