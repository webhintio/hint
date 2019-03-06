import anyTest, { TestInterface, ExecutionContext } from 'ava';
import * as sinon from 'sinon';
import * as proxyquire from 'proxyquire';

import { Severity } from 'hint/dist/src/lib/types';

import * as problems from './fixtures/list-of-problems';

type Logging = {
    log: () => void;
};

type JSONContext = {
    logging: Logging;
    loggingLogSpy: sinon.SinonSpy<any, void>;
};

const test = anyTest as TestInterface<JSONContext>;

const initContext = (t: ExecutionContext<JSONContext>) => {
    t.context.logging = { log() { } };
    t.context.loggingLogSpy = sinon.spy(t.context.logging, 'log');
};

const loadScript = (context: JSONContext) => {
    const script = proxyquire('../src/formatter', { 'hint/dist/src/lib/utils/logging': context.logging });

    return script.default;
};

test.beforeEach(initContext);

test.afterEach.always((t) => {
    t.context.loggingLogSpy.restore();
});

test(`JSON formatter doesn't print anything if no values`, (t) => {
    const JsonFormatter = loadScript(t.context);
    const formatter = new JsonFormatter();

    formatter.format(problems.noproblems);

    t.is(t.context.loggingLogSpy.callCount, 0);
});

test(`JSON formatter is called twice per resource with problems and with sorted problems`, (t) => {
    const JsonFormatter = loadScript(t.context);
    const formatter = new JsonFormatter();

    formatter.format(problems.multipleproblems);

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

    const log = t.context.loggingLogSpy;
    const firstCall = log.firstCall;
    const secondCall = log.secondCall;

    t.is(log.callCount, 2);
    t.is(firstCall.args[0], 'http://myresource.com/: 4 issues');
    t.deepEqual(secondCall.args[0], JSON.stringify(sortedMessages, null, 2));
});
