import anyTest, { TestInterface } from 'ava';
import * as proxyquire from 'proxyquire';
import * as sinon from 'sinon';

import { CLIOptions } from '../../../src/lib/types';

type Logger = {
    error: (error: string) => void;
    log: (log: string) => void;
};

type HelpContext = {
    loggerLogSpy: sinon.SinonSpy;
    loggerErrorSpy: sinon.SinonSpy;
};

const test = anyTest as TestInterface<HelpContext>;

const logger: Logger = {
    error(error: string) { },
    log(log: string) { }
};

proxyquire('../../../src/lib/cli/help', { '../utils/logging': logger });

import printHelp from '../../../src/lib/cli/help';

test.beforeEach((t) => {
    t.context.loggerLogSpy = sinon.spy(logger, 'log');
    t.context.loggerErrorSpy = sinon.spy(logger, 'error');
});

test.afterEach.always((t) => {
    t.context.loggerLogSpy.restore();
    t.context.loggerErrorSpy.restore();
});

test.serial('Help should print if it is an option and return true', async (t) => {
    const result = await printHelp({ help: true } as CLIOptions);

    t.true(result);
    t.true(t.context.loggerLogSpy.calledOnce);
    t.true(t.context.loggerLogSpy.args[0][0].includes('Basic configuration'));
});

test.serial(`Help should if there isn't any other option and return true`, async (t) => {
    const result = await printHelp({} as CLIOptions);

    t.true(result);
    t.true(t.context.loggerLogSpy.calledOnce);
    t.true(t.context.loggerLogSpy.args[0][0].includes('Basic configuration'));
});

test.serial(`Help shouldn't print if there is another option and return false`, async (t) => {
    const result = await printHelp({ version: true } as CLIOptions);

    t.false(result);
});
