import * as path from 'path';

import anyTest, { TestInterface, ExecutionContext } from 'ava';
import * as sinon from 'sinon';
import * as proxyquire from 'proxyquire';

import { Severity } from 'hint/dist/src/lib/types';

import * as problems from './fixtures/list-of-problems';

type Logging = {
    log: () => void;
};

type WriteFileAsync = {
    default: () => void;
};

type JSONContext = {
    logging: Logging;
    loggingLogSpy: sinon.SinonSpy<any, void>;
    writeFileAsync: WriteFileAsync;
    writeFileAsyncDefaultStub: sinon.SinonStub<any, void>;
};

const test = anyTest as TestInterface<JSONContext>;

const initContext = (t: ExecutionContext<JSONContext>) => {
    t.context.logging = { log() { } };
    t.context.loggingLogSpy = sinon.spy(t.context.logging, 'log');
    t.context.writeFileAsync = { default() { } };
    t.context.writeFileAsyncDefaultStub = sinon.stub(t.context.writeFileAsync, 'default').returns();
};

const loadScript = (context: JSONContext) => {
    const script = proxyquire('../src/formatter', {
        'hint/dist/src/lib/utils/fs/write-file-async': context.writeFileAsync,
        'hint/dist/src/lib/utils/logging': context.logging
    });

    return script.default;
};

const sortedMessages = [
    {
        category: 'other',
        hintId: 'random-hint',
        location: {
            column: 1,
            line: 1
        },
        message: 'This is a problem in line 1 column 1',
        resource: 'http://myresource.com/',
        severity: Severity.warning,
        sourceCode: ''
    },
    {
        category: 'other',
        hintId: 'random-hint',
        location: {
            column: 10,
            line: 1
        },
        message: 'This is a problem in line 1 column 10',
        resource: 'http://myresource.com/',
        severity: Severity.warning,
        sourceCode: ''
    },
    {
        category: 'other',
        hintId: 'random-hint',
        location: {
            column: 1,
            line: 5
        },
        message: 'This is a problem in line 5',
        resource: 'http://myresource.com/',
        severity: Severity.warning,
        sourceCode: ''
    },
    {
        category: 'other',
        hintId: 'random-hint',
        location: {
            column: 1,
            line: 10
        },
        message: 'This is a problem in line 10',
        resource: 'http://myresource.com/',
        severity: Severity.warning,
        sourceCode: ''
    }
];

const sortedMessagesByResource = [
    [
        {
            category: 'other',
            hintId: 'random-hint',
            location: {
                column: 10,
                line: 1
            },
            message: 'This is a problem in line 1 column 10',
            resource: 'http://myresource2.com/',
            severity: Severity.warning,
            sourceCode: ''
        },
        {
            category: 'other',
            hintId: 'random-hint',
            location: {
                column: 1,
                line: 10
            },
            message: 'This is a problem in line 10',
            resource: 'http://myresource2.com/',
            severity: Severity.warning,
            sourceCode: ''
        }
    ], [
        {
            category: 'other',
            hintId: 'random-hint',
            location: {
                column: 1,
                line: 1
            },
            message: 'This is a problem in line 1 column 1',
            resource: 'http://myresource.com/',
            severity: Severity.warning,
            sourceCode: ''
        },
        {
            category: 'other',
            hintId: 'random-hint',
            location: {
                column: 1,
                line: 5
            },
            message: 'This is a problem in line 5',
            resource: 'http://myresource.com/',
            severity: Severity.warning,
            sourceCode: ''
        }
    ]
];


test.beforeEach(initContext);

test.afterEach.always((t) => {
    t.context.loggingLogSpy.restore();
});

test(`JSON formatter doesn't print anything if no values`, (t) => {
    const JsonFormatter = loadScript(t.context);
    const formatter = new JsonFormatter();

    formatter.format(problems.noproblems);

    t.false(t.context.loggingLogSpy.called);
    t.false(t.context.writeFileAsyncDefaultStub.called);
});

test(`JSON formatter print the result in the console`, (t) => {
    const JsonFormatter = loadScript(t.context);
    const formatter = new JsonFormatter();

    formatter.format(problems.multipleproblems);

    const loggingLogSpy = t.context.loggingLogSpy;
    const writeFileAsyncDefaultStub = t.context.writeFileAsyncDefaultStub;
    const firstCall = loggingLogSpy.firstCall;
    const expectedResult = `http://myresource.com/: 4 issues
${JSON.stringify(sortedMessages, null, 2)}`;

    t.true(loggingLogSpy.calledOnce);
    t.false(writeFileAsyncDefaultStub.called);
    t.is(firstCall.args[0], expectedResult);
    t.false(t.context.writeFileAsyncDefaultStub.called);
});

test('JSON formatter only print once the result even if there is multiple resoruces', (t) => {
    const JsonFormatter = loadScript(t.context);
    const formatter = new JsonFormatter();

    formatter.format(problems.multipleproblemsandresoruces);

    const loggingLogSpy = t.context.loggingLogSpy;
    const writeFileAsyncDefaultStub = t.context.writeFileAsyncDefaultStub;
    const firstCall = loggingLogSpy.firstCall;
    const expectedResult = `http://myresource2.com/: 2 issues
${JSON.stringify(sortedMessagesByResource[0], null, 2)}

http://myresource.com/: 2 issues
${JSON.stringify(sortedMessagesByResource[1], null, 2)}`;

    t.true(loggingLogSpy.calledOnce);
    t.false(writeFileAsyncDefaultStub.called);
    t.is(firstCall.args[0], expectedResult);
    t.false(t.context.writeFileAsyncDefaultStub.called);
});

test(`JSON formatter called with the output option should write the result in the output file`, (t) => {
    const JsonFormatter = loadScript(t.context);
    const formatter = new JsonFormatter();
    const outputFile = 'output.json';

    formatter.format(problems.multipleproblems, { output: outputFile });

    const loggingLogSpy = t.context.loggingLogSpy;
    const writeFileAsyncDefaultStub = t.context.writeFileAsyncDefaultStub;
    const firstCall = writeFileAsyncDefaultStub.firstCall;
    const expectedResult = `http://myresource.com/: 4 issues
${JSON.stringify(sortedMessages, null, 2)}`;

    t.false(loggingLogSpy.called);
    t.true(writeFileAsyncDefaultStub.calledOnce);
    t.is(firstCall.args[0], outputFile);
    t.is(firstCall.args[1], expectedResult);
});

test('JSON formatter only save one file with the result even if there is multiple resoruces', (t) => {
    const JsonFormatter = loadScript(t.context);
    const formatter = new JsonFormatter();
    const outputFile = path.join(process.cwd(), '..', '..', 'output.json');

    formatter.format(problems.multipleproblemsandresoruces, { output: outputFile });

    const loggingLogSpy = t.context.loggingLogSpy;
    const writeFileAsyncDefaultStub = t.context.writeFileAsyncDefaultStub;
    const firstCall = writeFileAsyncDefaultStub.firstCall;
    const expectedResult = `http://myresource2.com/: 2 issues
${JSON.stringify(sortedMessagesByResource[0], null, 2)}

http://myresource.com/: 2 issues
${JSON.stringify(sortedMessagesByResource[1], null, 2)}`;

    t.false(loggingLogSpy.called);
    t.true(writeFileAsyncDefaultStub.calledOnce);
    t.is(firstCall.args[0], outputFile);
    t.is(firstCall.args[1], expectedResult);
});
