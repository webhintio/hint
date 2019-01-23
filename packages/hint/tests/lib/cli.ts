import chalk from 'chalk';
import * as proxyquire from 'proxyquire';
import * as sinon from 'sinon';
import anyTest, { TestInterface } from 'ava';
import { NotifyOptions, UpdateInfo } from 'update-notifier';

const loadHintPackage = {
    default() {
        return { version: '' };
    }
};

const logger = { error(text: string): any { } };

type ConfigTestContext = {
    notifyStub: sinon.SinonStub<[(NotifyOptions | undefined)?]>;
    updateInfo: UpdateInfo | null;
    errorStub: sinon.SinonSpy<[string]>;
};

const notifier = {
    notify(customMessage?: NotifyOptions) { },
    update: {} as UpdateInfo | null
};

const updateNotifier = () => {
    return notifier;
};

const cliActions = [] as any;

const test = anyTest as TestInterface<ConfigTestContext>;

proxyquire('../../src/lib/cli', {
    './cli/actions': cliActions,
    './utils/logging': logger,
    './utils/packages/load-hint-package': loadHintPackage,
    'update-notifier': updateNotifier
});

test.beforeEach((t) => {
    const notifyStub = sinon.stub(notifier, 'notify');

    notifyStub.resolves();
    t.context.errorStub = sinon.spy(logger, 'error');
    t.context.notifyStub = notifyStub;
});

test.afterEach.always((t) => {
    t.context.notifyStub.restore();
    t.context.errorStub.restore();
});

test.serial('Users should be notified if there is a new version of hint', async (t) => {
    const newUpdate = {
        current: '0.2.0',
        latest: '0.3.0',
        name: 'hint',
        type: 'minor'
    };

    const expectedMessage = `Update available ${chalk.red(newUpdate.current)}${chalk.reset(' → ')}${chalk.green(newUpdate.latest)}
See ${chalk.cyan('https://webhint.io/about/changelog/')} for details`;

    notifier.update = newUpdate;
    const loadHintPackageStub = sinon.stub(loadHintPackage, 'default').returns({ version: '0.2.0' });

    const cli = await import('../../src/lib/cli');

    await cli.execute('');

    t.true(t.context.notifyStub.calledOnce);
    t.is(t.context.notifyStub.args[0][0]!.message, expectedMessage);

    loadHintPackageStub.restore();
});

test.serial(`Users shouldn't be notified if the current version is up to date`, async (t) => {
    notifier.update = null;
    const cli = await import('../../src/lib/cli');

    await cli.execute('');

    t.is(t.context.notifyStub.callCount, 0);
});

test.serial(`Users shouldn't be notified if they just updated to the latest version and the data is still cached`, async (t) => {
    const newUpdate = {
        current: '0.2.0',
        latest: '0.3.0',
        name: 'hint',
        type: 'minor'
    };

    notifier.update = newUpdate;
    const loadHintPackageStub = sinon.stub(loadHintPackage, 'default').returns({ version: '0.3.0' });

    const cli = await import('../../src/lib/cli');

    await cli.execute('');

    t.is(t.context.notifyStub.callCount, 0);

    loadHintPackageStub.restore();
});

test.serial(`The process should exit if non-existing arguments are passed in to 'execute'`, async (t) => {
    notifier.update = null;

    const cli = await import('../../src/lib/cli');

    await t.notThrowsAsync(cli.execute(['', '', '--inti']));

    t.true(t.context.errorStub.calledOnce);
    t.is(t.context.errorStub.args[0][0], `Invalid option '--inti' - perhaps you meant '--hints'?`);
});
