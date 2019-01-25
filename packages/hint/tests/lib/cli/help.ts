import anyTest, { TestInterface, ExecutionContext } from 'ava';
import * as proxyquire from 'proxyquire';
import * as sinon from 'sinon';

import { CLIOptions } from '../../../src/lib/types';

type Logger = {
    error: (error: string) => void;
    log: (log: string) => void;
};

type HelpContext = {
    logger: Logger;
    loggerLogSpy: sinon.SinonSpy;
    loggerErrorSpy: sinon.SinonSpy;
    sandbox: sinon.SinonSandbox;
};

const test = anyTest as TestInterface<HelpContext>;

const initContext = (t: ExecutionContext<HelpContext>) => {
    const sandbox = sinon.createSandbox();

    t.context.logger = {
        error(error: string) { },
        log(log: string) { }
    };
    t.context.loggerLogSpy = sandbox.spy(t.context.logger, 'log');
    t.context.loggerErrorSpy = sandbox.spy(t.context.logger, 'error');
    t.context.sandbox = sandbox;
};

const loadScript = (context: HelpContext) => {
    const script = proxyquire('../../../src/lib/cli/help', { '../utils/logging': context.logger });

    return script.default;
};

test.beforeEach(initContext);

test.afterEach.always((t) => {
    t.context.sandbox.restore();
});

test('Help should print if it is an option and return true', async (t) => {
    const printHelp = loadScript(t.context);
    const result = await printHelp({ help: true } as CLIOptions);

    t.true(result);
    t.true(t.context.loggerLogSpy.calledOnce);
    t.true(t.context.loggerLogSpy.args[0][0].includes('Basic configuration'));
});

test(`Help should if there isn't any other option and return true`, async (t) => {
    const printHelp = loadScript(t.context);
    const result = await printHelp({} as CLIOptions);

    t.true(result);
    t.true(t.context.loggerLogSpy.calledOnce);
    t.true(t.context.loggerLogSpy.args[0][0].includes('Basic configuration'));
});

test(`Help shouldn't print if there is another option and return false`, async (t) => {
    const printHelp = loadScript(t.context);
    const result = await printHelp({ version: true } as CLIOptions);

    t.false(result);
});
