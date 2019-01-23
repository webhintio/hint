import anyTest, { TestInterface } from 'ava';
import * as proxyquire from 'proxyquire';
import * as sinon from 'sinon';

type Logger = {
    error: (error: string) => void;
    log: (log: string) => void;
};

type VersionContext = {
    loggerLogSpy: sinon.SinonSpy;
    loggerErrorSpy: sinon.SinonSpy;
};

const test = anyTest as TestInterface<VersionContext>;

const logger: Logger = {
    error(error: string) { },
    log(log: string) { }
};

proxyquire('../../../src/lib/cli/version', { '../utils/logging': logger });

import printVersion from '../../../src/lib/cli/version';

test.beforeEach((t) => {
    t.context.loggerLogSpy = sinon.spy(logger, 'log');
    t.context.loggerErrorSpy = sinon.spy(logger, 'error');
});

test.afterEach.always((t) => {
    t.context.loggerLogSpy.restore();
    t.context.loggerErrorSpy.restore();
});

test.serial('If version option is defined, it should print the current version and return true', async (t) => {
    const result = await printVersion();

    t.true(result);
    t.true(t.context.loggerLogSpy.calledOnce);
    t.true(t.context.loggerLogSpy.args[0][0].startsWith('v'));
});
