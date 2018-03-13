import chalk from 'chalk';
import * as proxyquire from 'proxyquire';
import * as sinon from 'sinon';
import test from 'ava';

import * as misc from '../../src/lib/utils/misc';

const stubbedNotifier = {
    notify() { },
    update: {}
};

const stubbedLogger = { error() { } };

const updateNotifier = () => {
    return stubbedNotifier;
};

const cliActions = [];

proxyquire('../../src/lib/cli', {
    './cli/actions': cliActions,
    './utils/logging': stubbedLogger,
    './utils/misc': misc,
    'update-notifier': updateNotifier
});

test.beforeEach((t) => {
    sinon.stub(stubbedNotifier, 'notify').resolves();
    sinon.spy(stubbedLogger, 'error');
    t.context.notifier = stubbedNotifier;
    t.context.misc = misc;
    t.context.logger = stubbedLogger;
});

test.afterEach.always((t) => {
    t.context.notifier.notify.restore();

    if (t.context.misc.loadJSONFile.restore) {
        t.context.misc.loadJSONFile.restore();
    }

    t.context.logger.error.restore();
});

test.serial('Users should be notified if there is a new version of sonarwhal', async (t) => {
    const newUpdate = {
        current: '0.2.0',
        latest: '0.3.0',
        name: 'sonarwhal',
        type: 'minor'
    };

    const expectedMessage = `Update available ${chalk.red(newUpdate.current)}${chalk.reset(' → ')}${chalk.green(newUpdate.latest)}
See ${chalk.cyan('https://sonarwhal.com/about/changelog/')} for details`;

    t.context.notifier.update = newUpdate;
    const cli = require('../../src/lib/cli');

    await cli.execute('');

    t.true(t.context.notifier.notify.calledOnce);
    t.is(t.context.notifier.notify.args[0][0].message, expectedMessage);
});

test.serial(`Users shouldn't be notified if the current version is up to date`, async (t) => {
    t.context.notifier.update = null;
    const cli = require('../../src/lib/cli');

    await cli.execute('');

    t.is(t.context.notifier.notify.callCount, 0);
});

test.serial(`Users shouldn't be notified if they just updated to the latest version and the data is still cached`, async (t) => {
    const newUpdate = {
        current: '0.2.0',
        latest: '0.3.0',
        name: 'sonarwhal',
        type: 'minor'
    };

    t.context.notifier.update = newUpdate;
    sinon.stub(t.context.misc, 'loadJSONFile').callsFake(() => {
        return { version: '0.3.0' };
    });

    const cli = require('../../src/lib/cli');

    await cli.execute('');

    t.is(t.context.notifier.notify.callCount, 0);
});

test.serial(`The process should exit if non-existing arguments are passed in to 'execute'`, async (t) => {
    t.context.notifier.update = null;

    const cli = require('../../src/lib/cli');

    await t.notThrows(cli.execute(['', '', '--inti']));

    t.true(t.context.logger.error.calledOnce);
    t.is(t.context.logger.error.args[0][0], `Invalid option '--inti' - perhaps you meant '--init'?`);
});
