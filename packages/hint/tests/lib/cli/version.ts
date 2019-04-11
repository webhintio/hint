import anyTest, { TestInterface, ExecutionContext } from 'ava';
import * as proxyquire from 'proxyquire';
import * as sinon from 'sinon';

import * as utils from '@hint/utils';

type Logger = {
    error: (error: string) => void;
    log: (log: string) => void;
};

type VersionContext = {
    logger: Logger;
    loggerLogSpy: sinon.SinonSpy<[string], void>;
    loggerErrorSpy: sinon.SinonSpy<[string], void>;
    sandbox: sinon.SinonSandbox;
};

const test = anyTest as TestInterface<VersionContext>;

const initContext = (t: ExecutionContext<VersionContext>) => {
    const sandbox = sinon.createSandbox();

    t.context.logger = {
        error(error: string) { },
        log(log: string) { }
    };
    t.context.loggerLogSpy = sandbox.spy(t.context.logger, 'log');
    t.context.loggerErrorSpy = sandbox.spy(t.context.logger, 'error');
    t.context.sandbox = sandbox;
};

const loadScript = (context: VersionContext) => {
    const script = proxyquire('../../../src/lib/cli/version', {
        '@hint/utils': {
            ...utils,
            logger: context.logger
        }
    });

    return script.default;
};

test.beforeEach(initContext);

test.afterEach.always((t) => {
    t.context.sandbox.restore();
});

test('If version option is defined, it should print the current version and return true', async (t) => {
    const printVersion = loadScript(t.context);
    const result = await printVersion();

    t.true(result);
    t.true(t.context.loggerLogSpy.calledOnce);
    t.true(t.context.loggerLogSpy.args[0][0].startsWith('v'));
});
