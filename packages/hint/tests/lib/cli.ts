import chalk from 'chalk';
import * as proxyquire from 'proxyquire';
import * as sinon from 'sinon';
import anyTest, { TestInterface, ExecutionContext } from 'ava';
import { NotifyOptions, UpdateInfo } from 'update-notifier';

type Package = {
    version: string;
};

type LoadHintPackage = {
    default: () => Package;
};

type Logger = {
    error: (text: string) => void;
};

type Notifier = {
    notify: (customMessage?: NotifyOptions) => void;
    update: UpdateInfo | null;
};

type UpdateNotifier = () => Notifier;

type ConfigTestContext = {
    cliActions: any;
    errorStub: sinon.SinonSpy<[string]>;
    loadHintPackage: LoadHintPackage;
    logger: Logger;
    notifier: Notifier;
    notifyStub: sinon.SinonStub<[(NotifyOptions | undefined)?]>;
    sandbox: sinon.SinonSandbox;
    updateNotifier: UpdateNotifier;
};

const test = anyTest as TestInterface<ConfigTestContext>;

const initContext = (t: ExecutionContext<ConfigTestContext>) => {
    t.context.cliActions = [];
    t.context.logger = { error(text: string): void { } };

    t.context.notifier = {
        notify(customMessage?: NotifyOptions) { },
        update: {} as UpdateInfo | null
    };
    t.context.updateNotifier = () => {
        return t.context.notifier;
    };
    t.context.loadHintPackage = {
        default() {
            return { version: '' };
        }
    };

    const sandbox = sinon.createSandbox();

    t.context.sandbox = sandbox;
    t.context.errorStub = sandbox.spy(t.context.logger, 'error');
    t.context.notifyStub = sandbox.stub(t.context.notifier, 'notify').resolves();
};

const loadScript = (context: ConfigTestContext) => {
    return proxyquire('../../src/lib/cli', {
        './cli/actions': context.cliActions,
        './utils/packages/load-hint-package': context.loadHintPackage,
        '@hint/utils': { logger: context.logger },
        'update-notifier': context.updateNotifier
    });
};

test.beforeEach(initContext);

test.afterEach.always((t) => {
    t.context.sandbox.restore();
});

test('Users should be notified if there is a new version of hint', async (t) => {
    const sandbox = t.context.sandbox;
    const newUpdate = {
        current: '0.2.0',
        latest: '0.3.0',
        name: 'hint',
        type: 'minor'
    };

    const expectedMessage = `Update available ${chalk.red(newUpdate.current)}${chalk.reset(' → ')}${chalk.green(newUpdate.latest)}
See ${chalk.cyan('https://webhint.io/about/changelog/')} for details`;

    t.context.notifier.update = newUpdate;
    sandbox.stub(t.context.loadHintPackage, 'default').returns({ version: '0.2.0' });

    const cli = loadScript(t.context);

    await cli.execute('');

    t.true(t.context.notifyStub.calledOnce);
    t.is(t.context.notifyStub.args[0][0]!.message, expectedMessage);
});

test(`Users shouldn't be notified if the current version is up to date`, async (t) => {
    t.context.notifier.update = null;

    const cli = loadScript(t.context);

    await cli.execute('');

    t.is(t.context.notifyStub.callCount, 0);
});

test(`Users shouldn't be notified if they just updated to the latest version and the data is still cached`, async (t) => {
    const sandbox = t.context.sandbox;
    const newUpdate = {
        current: '0.2.0',
        latest: '0.3.0',
        name: 'hint',
        type: 'minor'
    };

    t.context.notifier.update = newUpdate;
    sandbox.stub(t.context.loadHintPackage, 'default').returns({ version: '0.3.0' });

    const cli = loadScript(t.context);

    await cli.execute('');

    t.is(t.context.notifyStub.callCount, 0);
});

test(`The process should exit if non-existing arguments are passed in to 'execute'`, async (t) => {
    t.context.notifier.update = null;

    const cli = loadScript(t.context);

    await t.notThrowsAsync(cli.execute(['', '', '--inti']));

    t.true(t.context.errorStub.calledOnce);
    t.is(t.context.errorStub.args[0][0], `Invalid option '--inti' - perhaps you meant '--hints'?`);
});
