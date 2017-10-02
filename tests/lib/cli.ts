import * as chalk from 'chalk';
import * as proxyquire from 'proxyquire';
import * as sinon from 'sinon';
import test from 'ava';

import * as misc from '../../src/lib/utils/misc';

const stubbedNotifier = {
    notify() { },
    update: {}
};

const updateNotifier = () => {
    return stubbedNotifier;
};

const cliActions = [];

proxyquire('../../src/lib/cli', {
    './cli/options': cliActions,
    './utils/misc': misc,
    'update-notifier': updateNotifier
});

test.beforeEach((t) => {
    sinon.stub(stubbedNotifier, 'notify').resolves();

    t.context.notifier = stubbedNotifier;
    t.context.misc = misc;
});

test.afterEach.always((t) => {
    t.context.notifier.notify.restore();

    if (t.context.misc.loadJSONFile.restore) {
        t.context.misc.loadJSONFile.restore();
    }
});

test.serial('Users should be notified if there is a new version of sonar', async (t) => {
    const newUpdate = {
        current: '0.2.0',
        latest: '0.3.0',
        name: '@sonarwhal/sonar',
        type: 'minor'
    };

    const expectedMessage = `Update available ${chalk.red(newUpdate.current)}${chalk.reset(' → ')}${chalk.green(newUpdate.latest)}
See ${chalk.cyan('https://sonarwhal.com/about/changelog.html')} for details`;

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
        name: '@sonarwhal/sonar',
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
