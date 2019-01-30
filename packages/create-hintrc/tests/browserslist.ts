import * as proxyquire from 'proxyquire';
import * as sinon from 'sinon';
import anyTest, { TestInterface } from 'ava';

type Inquirer = {
    prompt: () => void;
};

type Logger = {
    log: () => void;
};

type BrowserslistContext = {
    sandbox: sinon.SinonSandbox;
    inquirer: Inquirer;
    logger: Logger;
};

const test = anyTest as TestInterface<BrowserslistContext>;

const defaultOption = { targetBy: 'default' };
const multipleQueries = {
    customQueries: '> 1%, Last 2 versions',
    targetBy: 'custom'
};
const invalidQueries = {
    customQueries: 'invalid query',
    targetBy: 'custom'
};

const loadScript = (context: BrowserslistContext): () => Promise<string> => {
    const browserlist = proxyquire('../src/browserslist', {
        'hint/dist/src/lib/utils/logging': context.logger,
        inquirer: context.inquirer
    });

    return browserlist.generateBrowserslistConfig;
};

test.beforeEach((t) => {
    t.context.inquirer = { prompt() { } };
    t.context.logger = { log() { } };

    t.context.sandbox = sinon.createSandbox();
});

test.afterEach((t) => {
    t.context.sandbox.restore();
});

test('User selects to customize the queries, the format of the queries is wrong in the first trial', async (t) => {
    const sandbox = t.context.sandbox;

    sandbox.stub(t.context.inquirer, 'prompt')
        .onFirstCall()
        .resolves(invalidQueries)
        .onSecondCall()
        .resolves(multipleQueries);
    sandbox.spy(t.context.logger, 'log');

    const generateBrowserslistConfig = loadScript(t.context);
    const config = await generateBrowserslistConfig();
    const log = t.context.logger.log as sinon.SinonSpy;

    t.is(log.callCount, 2);
    t.is(log.args[0][0], 'Unknown browser query `invalid query`. Maybe you are using old Browserslist or made typo in query..');
    t.is(log.args[1][0], 'Please try again.');

    t.is(config.length, 2);
    t.is(config[0], '> 1%');
    t.is(config[1], 'Last 2 versions');
});

test('User selects to customize the queries, and has multile queries', async (t) => {
    const sandbox = t.context.sandbox;

    sandbox.stub(t.context.inquirer, 'prompt').resolves(multipleQueries);

    const generateBrowserslistConfig = loadScript(t.context);
    const config = await generateBrowserslistConfig();

    t.is(config.length, 2);
    t.is(config[0], '> 1%');
    t.is(config[1], 'Last 2 versions');
});

test(`User selects the default option`, async (t) => {
    const sandbox = t.context.sandbox;

    sandbox.stub(t.context.inquirer, 'prompt').resolves(defaultOption);

    const generateBrowserslistConfig = loadScript(t.context);
    const config = await generateBrowserslistConfig();

    t.is(config.length, 0);

    sandbox.restore();
});
