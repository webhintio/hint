import * as proxyquire from 'proxyquire';
import * as sinon from 'sinon';
import test from 'ava';

const inquirer = { prompt() { } };
const logger = { log() { } };

proxyquire('../../../src/lib/cli/browserslist-generator', {
    '../utils/logging': logger,
    inquirer
});

import { generateBrowserslistConfig } from '../../../src/lib/cli/browserslist-generator';

const defaultOption = { targetBy: 'default' };
const multipleQueries = {
    customQueries: '> 1%, Last 2 versions',
    targetBy: 'custom'
};
const invalidQueries = {
    customQueries: 'invalid query',
    targetBy: 'custom'
};

test.beforeEach((t) => {
    t.context.sandbox = sinon.sandbox.create();
});

test.afterEach((t) => {
    t.context.sandbox.restore();
});

test.serial('User selects to customize the queries, the format of the queries is wrong in the first trial', async (t) => {
    const sandbox = t.context.sandbox;

    sandbox.stub(inquirer, 'prompt')
        .onFirstCall()
        .resolves(invalidQueries)
        .onSecondCall()
        .resolves(multipleQueries);
    sandbox.spy(logger, 'log');

    const config = await generateBrowserslistConfig();
    const log = logger.log as sinon.SinonSpy;

    t.is(log.callCount, 2);
    t.is(log.args[0][0], 'Unknown browser query `invalid query`.');
    t.is(log.args[1][0], 'Please try again.');

    t.is(config.length, 2);
    t.is(config[0], '> 1%');
    t.is(config[1], 'Last 2 versions');
});

test.serial('User selects to customize the queries, and has multile queries', async (t) => {
    const sandbox = t.context.sandbox;

    sandbox.stub(inquirer, 'prompt').resolves(multipleQueries);

    const config = await generateBrowserslistConfig();

    t.is(config.length, 2);
    t.is(config[0], '> 1%');
    t.is(config[1], 'Last 2 versions');
});

test.serial(`User selects the default option`, async (t) => {
    const sandbox = t.context.sandbox;

    sandbox.stub(inquirer, 'prompt').resolves(defaultOption);

    const config = await generateBrowserslistConfig();

    t.is(config.length, 0);

    sandbox.restore();
});
