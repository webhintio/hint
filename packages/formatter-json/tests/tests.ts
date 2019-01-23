import anyTest, { TestInterface } from 'ava';
import * as sinon from 'sinon';
import * as proxyquire from 'proxyquire';

type JSONContext = {
    loggingLogSpy: sinon.SinonSpy;
};

const test = anyTest as TestInterface<JSONContext>;

const logging = { log() { } };

proxyquire('../src/formatter', { 'hint/dist/src/lib/utils/logging': logging });

import JsonFormatter from '../src/formatter';
import * as problems from './fixtures/list-of-problems';
import { Severity } from 'hint/dist/src/lib/types';

test.beforeEach((t) => {
    t.context.loggingLogSpy = sinon.spy(logging, 'log');
});

test.afterEach.always((t) => {
    t.context.loggingLogSpy.restore();
});

test.serial(`JSON formatter doesn't print anything if no values`, (t) => {
    const formatter = new JsonFormatter();

    formatter.format(problems.noproblems);

    t.is(t.context.loggingLogSpy.callCount, 0);
});

test.serial(`JSON formatter is called twice per resource with problems and with sorted problems`, (t) => {
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
