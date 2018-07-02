import test from 'ava';
import * as proxyquire from 'proxyquire';
import * as sinon from 'sinon';

import { CLIOptions } from '../../../src/lib/types';

const logger = {
    error() { },
    log() { }
};

proxyquire('../../../src/lib/cli/help', { '../utils/logging': logger });

import printHelp from '../../../src/lib/cli/help';

test.beforeEach((t) => {
    sinon.spy(logger, 'log');
    sinon.spy(logger, 'error');

    t.context.logger = logger;
});

test.afterEach.always((t) => {
    t.context.logger.log.restore();
    t.context.logger.error.restore();
});

test.serial('Help should print if it is an option and return true', async (t) => {
    const result = await printHelp({ help: true } as CLIOptions);

    t.true(result);
    t.true(t.context.logger.log.calledOnce);
    t.true(t.context.logger.log.args[0][0].includes('Basic configuration'));
});

test.serial(`Help should if there isn't any other option and return true`, async (t) => {
    const result = await printHelp({} as CLIOptions);

    t.true(result);
    t.true(t.context.logger.log.calledOnce);
    t.true(t.context.logger.log.args[0][0].includes('Basic configuration'));
});

test.serial(`Help shouldn't print if there is another option and return false`, async (t) => {
    const result = await printHelp({ version: true } as CLIOptions);

    t.false(result);
});
