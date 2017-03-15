import test from 'ava';
import sinon from 'sinon';
import proxyquire from 'proxyquire';

const logging = { log() { } };

proxyquire('../../../dist/lib/formatters/json', { '../util/logging': logging });

const json = require('../../../dist/lib/formatters/json');
const problems = require('../../fixtures/formatters/list-of-problems');


test.beforeEach((t) => {
    // const log = sinon.spy(logger, 'log');
    sinon.spy(logging, 'log');

    t.context.logger = logging;
});

test.afterEach((t) => {
    t.context.logger.log.restore();
});

test(`JSON formatter doesn't print anything if no values`, (t) => {
    json.format(problems.noproblems);

    t.is(t.context.logger.log.callCount, 0);
});

test(`JSON formatter is called twice per resource with problems and with sorted problems`, (t) => {
    json.format(problems.multipleproblems);

    const sortedMessages = [
        {
            column: 1,
            line: 1,
            message: 'This is a problem in line 1 column 1',
            resource: 'http://myresource.com/',
            ruleId: 'random-rule',
            severity: 'warning'
        },
        {
            column: 10,
            line: 1,
            message: 'This is a problem in line 1 column 10',
            resource: 'http://myresource.com/',
            ruleId: 'random-rule',
            severity: 'warning'
        },
        {
            column: 1,
            line: 5,
            message: 'This is a problem in line 5',
            resource: 'http://myresource.com/',
            ruleId: 'random-rule',
            severity: 'warning'
        },
        {
            column: 1,
            line: 10,
            message: 'This is a problem in line 10',
            resource: 'http://myresource.com/',
            ruleId: 'random-rule',
            severity: 'warning'
        }
    ];

    const log = t.context.logger.log;
    const firstCall = log.firstCall;
    const secondCall = log.secondCall;


    t.is(log.callCount, 2);
    t.is(firstCall.args[0], 'http://myresource.com/: 4 issues');
    t.deepEqual(secondCall.args[0], sortedMessages);
});
