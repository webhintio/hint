import test from 'ava';
import * as proxyquire from 'proxyquire';
import * as sinon from 'sinon';

const logger = {
    error() { },
    log() { }
};

proxyquire('../../../src/lib/cli/version', { '../utils/logging': logger });

import printVersion from '../../../src/lib/cli/version';

test.beforeEach((t) => {
    sinon.spy(logger, 'log');
    sinon.spy(logger, 'error');

    t.context.logger = logger;
});

test.afterEach.always((t) => {
    t.context.logger.log.restore();
    t.context.logger.error.restore();
});

test.serial('If version option is defined, it should print the current version and return true', async (t) => {
    const result = await printVersion();

    t.true(result);
    t.true(t.context.logger.log.calledOnce);
    t.true(t.context.logger.log.args[0][0].startsWith('v'));
});
