import * as chalk from 'chalk';
import * as proxyquire from 'proxyquire';
import * as sinon from 'sinon';
import test from 'ava';

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
    'update-notifier': updateNotifier
});

import * as cli from '../../src/lib/cli';

test.beforeEach((t) => {
    sinon.stub(stubbedNotifier, 'notify').resolves();

    t.context.notifier = stubbedNotifier;
});

test.afterEach.always((t) => {
    t.context.notifier.notify.restore();
});

test.serial('User should be notified if there is a new version of sonar', async (t) => {
    const newUpdate = {
        current: '0.2.0',
        latest: '0.3.0',
        name: '@sonarwhal/sonar',
        type: 'minor'
    };

    const expectedMessage = `Update available ${chalk.red(newUpdate.current)}${chalk.reset(' → ')}${chalk.green(newUpdate.latest)}
See ${chalk.cyan('https://sonarwhal.com/about/changelog.html')} for details`;

    t.context.notifier.update = newUpdate;

    await cli.execute('');

    t.true(t.context.notifier.notify.calledOnce);
    t.is(t.context.notifier.notify.args[0][0].message, expectedMessage);
});

test.serial(`User shouldn't be notified if the current version is up to date`, async (t) => {
    t.context.notifier.update = null;

    await cli.execute('');

    t.is(t.context.notifier.notify.callCount, 0);
});
