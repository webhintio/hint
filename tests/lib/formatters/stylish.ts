import test from 'ava';
import * as sinon from 'sinon';
import * as proxyquire from 'proxyquire';

const logging = { log() { } };
const common = {
    printMessageByResource: () => {
        return {
            totalErrors: 0,
            totalWarnings: 1
        };
    },
    reportTotal() { }
};

proxyquire('../../../src/lib/formatters/stylish/stylish', {
    '../../utils/logging': logging,
    '../utils/common': common
});

import stylish from '../../../src/lib/formatters/stylish/stylish';
import * as problems from './fixtures/list-of-problems';

test.beforeEach((t) => {
    sinon.spy(logging, 'log');
    sinon.spy(common, 'reportTotal');
    sinon.spy(common, 'printMessageByResource');

    t.context.logger = logging;
    t.context.common = common;
});

test.afterEach.always((t) => {
    t.context.logger.log.restore();
    t.context.common.reportTotal.restore();
    t.context.common.printMessageByResource.restore();
});

test(`Stylish formatter doesn't print anything if no values`, (t) => {
    stylish.format(problems.noproblems);

    t.is(t.context.logger.log.callCount, 0);
});

test(`Stylish formatter prints the messages by resource and a combined total summary in the end`, (t) => {
    const comm = t.context.common;

    stylish.format(problems.multipleproblemsandresources);

    t.true(comm.printMessageByResource.calledOnce);
    t.true(comm.reportTotal.calledOnce);
    t.true(comm.printMessageByResource.args[0][1]);
});
