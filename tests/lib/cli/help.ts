import test from 'ava';
import * as proxyquire from 'proxyquire';
import * as sinon from 'sinon';

const logger = {
    error() { },
    log() { }
};

proxyquire('../../../src/lib/cli/help', { '../utils/logging': logger });

import { printHelp } from '../../../src/lib/cli/help';

test.beforeEach((t) => {
    sinon.spy(logger, 'log');
    sinon.spy(logger, 'error');

    t.context.logger = logger;
});

test.afterEach.always((t) => {
    t.context.logger.log.restore();
    t.context.logger.error.restore();
});

test.serial('Help should always print and return true', async (t) => {
    const result = await printHelp();

    t.true(result);
    t.true(t.context.logger.log.calledOnce);
    t.true(t.context.logger.log.args[0][0].includes('Basic configuration'));
});
