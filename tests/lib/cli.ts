import { EventEmitter2 as EventEmitter } from 'eventemitter2';
import * as chalk from 'chalk';
import * as proxyquire from 'proxyquire';
import * as sinon from 'sinon';
import test from 'ava';

import * as config from '../../src/lib/config';

class Sonar extends EventEmitter {
    public formatter = 'json';
    public close() { }
    public executeOn() { }
}

const formatter = { format: () => { } };
const resourceLoader = {
    loadFormatter() {
        return formatter;
    }
};
const logger = {
    error() { },
    log() { }
};

const generator = { initSonarrc() { } };

const spinner = {
    fail() { },
    start() { },
    succeed() { },
    text: ''
};

const ora = () => {
    return spinner;
};

const stubbedNotifier = {
    notify() { },
    update: {}
};

const updateNotifier = () => {
    return stubbedNotifier;
};

proxyquire('../../src/lib/cli', {
    './cli/sonarrc-generator': generator,
    './config': config,
    './sonar': { Sonar },
    './utils/logging': logger,
    './utils/resource-loader': resourceLoader,
    ora,
    'update-notifier': updateNotifier
});

import * as cli from '../../src/lib/cli';
import { Severity } from '../../src/lib/types';

test.beforeEach((t) => {
    sinon.spy(logger, 'log');
    sinon.spy(logger, 'error');
    sinon.spy(config, 'getFilenameForDirectory');
    sinon.spy(config, 'load');
    sinon.stub(generator, 'initSonarrc').resolves();
    sinon.stub(stubbedNotifier, 'notify').resolves();
    sinon.spy(spinner, 'start');
    sinon.spy(spinner, 'fail');
    sinon.spy(spinner, 'succeed');

    t.context.config = config;
    t.context.generator = generator;
    t.context.logger = logger;
    t.context.spinner = spinner;
    t.context.notifier = stubbedNotifier;
});

test.afterEach.always((t) => {
    t.context.logger.log.restore();
    t.context.logger.error.restore();
    t.context.config.getFilenameForDirectory.restore();
    t.context.config.load.restore();
    t.context.generator.initSonarrc.restore();
    t.context.spinner.start.restore();
    t.context.spinner.fail.restore();
    t.context.spinner.succeed.restore();
    t.context.notifier.notify.restore();
});

test.serial('if version option is defined, it should print the current version and return with exit code 0', async (t) => {
    const exitCode = await cli.execute('-v');

    t.true(t.context.logger.log.calledOnce);
    t.true(t.context.logger.log.args[0][0].startsWith('v'));
    t.is(exitCode, 0);
});

test.serial('if help option is defined, it should print the help and return with exit code 0', async (t) => {
    const exitCode = await cli.execute('--help');

    t.true(t.context.logger.log.calledOnce);
    t.true(t.context.logger.log.args[0][0].includes('Basic configuration'));
    t.is(exitCode, 0);
});

test.serial('if init option is defined, it should generate the configuration file and return with exit code 0', async (t) => {
    const exitCode = await cli.execute('--init');

    t.true(t.context.generator.initSonarrc.calledOnce);
    t.is(exitCode, 0);
});

test.serial('if config is not defined, it should get the config file from the directory process.cwd()', async (t) => {
    await cli.execute('http://localhost/');

    t.true(t.context.config.getFilenameForDirectory.called);
});

test.serial('if configuration file exists, it should use it', async (t) => {
    t.context.config.load.restore();
    sinon.stub(t.context.config, 'load').returns({});
    await cli.execute('http://localhost/ --config configfile.cfg');

    t.false(t.context.config.getFilenameForDirectory.called);
    t.is(t.context.config.load.args[0][0], 'configfile.cfg');
});

test.serial('if executeOn returns an error, it should exit with code 1 and call formatter.format', async (t) => {
    sinon.stub(Sonar.prototype, 'executeOn').resolves([{ severity: Severity.error }]);
    sinon.spy(formatter, 'format');

    const exitCode = await cli.execute('http://localhost/');

    t.true((formatter.format as sinon.SinonSpy).called);
    t.is(exitCode, 1);

    (Sonar.prototype.executeOn as sinon.SinonStub).restore();
    (formatter.format as sinon.SinonSpy).restore();
});

test.serial('if executeOn returns an error, it should call to spinner.fail()', async (t) => {
    sinon.stub(Sonar.prototype, 'executeOn').resolves([{ severity: Severity.error }]);

    await cli.execute('http://localhost/');

    t.true(t.context.spinner.fail.calledOnce);

    (Sonar.prototype.executeOn as sinon.SinonStub).restore();
});

test.serial('if executeOn throws an exception, it should exit with code 1', async (t) => {
    sinon.stub(Sonar.prototype, 'executeOn').throws(new Error());

    const exitCode = await cli.execute('http://localhost/');

    t.is(exitCode, 1);

    (Sonar.prototype.executeOn as sinon.SinonStub).restore();
});

test.serial('if executeOn throws an exception, it should call to spinner.fail()', async (t) => {
    sinon.stub(Sonar.prototype, 'executeOn').throws(new Error());

    await cli.execute('http://localhost/');

    t.true(t.context.spinner.fail.calledOnce);

    (Sonar.prototype.executeOn as sinon.SinonStub).restore();
});

test.serial('if executeOn returns no errors, it should exit with code 0 and call formatter.format', async (t) => {
    sinon.stub(Sonar.prototype, 'executeOn').resolves([{ severity: 0 }]);
    sinon.spy(formatter, 'format');

    const exitCode = await cli.execute('http://localhost/');

    t.true((formatter.format as sinon.SinonSpy).called);
    t.is(exitCode, 0);

    (Sonar.prototype.executeOn as sinon.SinonStub).restore();
    (formatter.format as sinon.SinonSpy).restore();
});

test.serial('if executeOn returns no errors, it should call to spinner.succeed()', async (t) => {
    sinon.stub(Sonar.prototype, 'executeOn').resolves([{ severity: 0 }]);

    await cli.execute('http://localhost/');

    t.true(t.context.spinner.succeed.calledOnce);

    (Sonar.prototype.executeOn as sinon.SinonStub).restore();
});

test.serial('Event fetch::start should write a message in the spinner', async (t) => {
    sinon.stub(Sonar.prototype, 'executeOn').callsFake(async () => {
        await cli.sonar.emitAsync('fetch::start', { resource: 'http://localhost/' });
    });

    await cli.execute('http://localhost/');

    t.is(spinner.text, 'Downloading http://localhost/');

    (Sonar.prototype.executeOn as sinon.SinonStub).restore();
});

test.serial('Event fetch::end should write a message in the spinner', async (t) => {
    sinon.stub(Sonar.prototype, 'executeOn').callsFake(async () => {
        await cli.sonar.emitAsync('fetch::end', { resource: 'http://localhost/' });
    });

    await cli.execute('http://localhost/');

    t.is(spinner.text, 'http://localhost/ downloaded');

    (Sonar.prototype.executeOn as sinon.SinonStub).restore();
});

test.serial('Event traverse::up should write a message in the spinner', async (t) => {
    sinon.stub(Sonar.prototype, 'executeOn').callsFake(async () => {
        await cli.sonar.emitAsync('traverse::up', { resource: 'http://localhost/' });
    });

    await cli.execute('http://localhost/');

    t.is(spinner.text, 'Traversing the DOM');

    (Sonar.prototype.executeOn as sinon.SinonStub).restore();
});

test.serial('Event traverse::end should write a message in the spinner', async (t) => {
    sinon.stub(Sonar.prototype, 'executeOn').callsFake(async () => {
        await cli.sonar.emitAsync('traverse::end', { resource: 'http://localhost/' });
    });

    await cli.execute('http://localhost/');

    t.is(spinner.text, 'Traversing finished');

    (Sonar.prototype.executeOn as sinon.SinonStub).restore();
});

test.serial('Event scann::end should write a message in the spinner', async (t) => {
    sinon.stub(Sonar.prototype, 'executeOn').callsFake(async () => {
        await cli.sonar.emitAsync('scan::end', { resource: 'http://localhost/' });
    });

    await cli.execute('http://localhost/');

    t.is(spinner.text, 'Finishing...');

    (Sonar.prototype.executeOn as sinon.SinonStub).restore();
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

    await cli.execute('http://localhost/');

    t.true(t.context.notifier.notify.calledOnce);
    t.is(t.context.notifier.notify.args[0][0].message, expectedMessage);
});

test.serial(`User shouldn't be notified if the current version is up to date`, async (t) => {
    t.context.notifier.update = null;

    await cli.execute('http://localhost/');

    t.is(t.context.notifier.notify.callCount, 0);
});
