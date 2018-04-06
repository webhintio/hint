import test from 'ava';
import * as sinon from 'sinon';
import * as proxyquire from 'proxyquire';

const logging = { log() { } };

proxyquire('../src/formatter', { 'sonarwhal/dist/src/lib/utils/logging': logging });

import JsonFormatter from '../src/formatter';
import * as problems from './fixtures/list-of-problems';
import { Severity } from 'sonarwhal/dist/src/lib/types';

test.beforeEach((t) => {
    sinon.spy(logging, 'log');

    t.context.logger = logging;
});

test.afterEach.always((t) => {
    t.context.logger.log.restore();
});

test(`JSON formatter doesn't print anything if no values`, (t) => {
    const formatter = new JsonFormatter();

    formatter.format(problems.noproblems);

    t.is(t.context.logger.log.callCount, 0);
});

test(`JSON formatter is called twice per resource with problems and with sorted problems`, (t) => {
    const formatter = new JsonFormatter();

    formatter.format(problems.multipleproblems);

    const sortedMessages = [
        {
            location: {
                column: 1,
                line: 1
            },
            message: 'This is a problem in line 1 column 1',
            resource: 'http://myresource.com/',
            ruleId: 'random-rule',
            severity: Severity.warning,
            sourceCode: ''
        },
        {
            location: {
                column: 10,
                line: 1
            },
            message: 'This is a problem in line 1 column 10',
            resource: 'http://myresource.com/',
            ruleId: 'random-rule',
            severity: Severity.warning,
            sourceCode: ''
        },
        {
            location: {
                column: 1,
                line: 5
            },
            message: 'This is a problem in line 5',
            resource: 'http://myresource.com/',
            ruleId: 'random-rule',
            severity: Severity.warning,
            sourceCode: ''
        },
        {
            location: {
                column: 1,
                line: 10
            },
            message: 'This is a problem in line 10',
            resource: 'http://myresource.com/',
            ruleId: 'random-rule',
            severity: Severity.warning,
            sourceCode: ''
        }
    ];

    const log = t.context.logger.log;
    const firstCall = log.firstCall;
    const secondCall = log.secondCall;


    t.is(log.callCount, 2);
    t.is(firstCall.args[0], 'http://myresource.com/: 4 issues');
    t.deepEqual(secondCall.args[0], JSON.stringify(sortedMessages, null, 2));
});
