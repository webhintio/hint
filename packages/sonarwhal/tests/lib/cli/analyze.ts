import test from 'ava';
import { EventEmitter2 as EventEmitter } from 'eventemitter2';
import * as proxyquire from 'proxyquire';
import * as sinon from 'sinon';

import * as config from '../../../src/lib/config';
import { CLIOptions, Severity } from '../../../src/lib/types';
const actions = { _: ['http://localhost/'] } as CLIOptions;

class Sonarwhal extends EventEmitter {
    public formatters = ['json'];
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

const generator = { initSonarwhalrc() { } };

const spinner = {
    fail() { },
    start() { },
    succeed() { },
    text: ''
};

const ora = () => {
    return spinner;
};

const inquirer = { prompt() { } };

proxyquire('../../../src/lib/cli/analyze', {
    '../config': config,
    '../sonarwhal': { Sonarwhal },
    '../utils/logging': logger,
    '../utils/resource-loader': resourceLoader,
    './init': generator,
    inquirer,
    ora
});

import * as analyzer from '../../../src/lib/cli/analyze';

test.beforeEach((t) => {
    sinon.spy(logger, 'log');
    sinon.spy(logger, 'error');
    sinon.spy(config, 'getFilenameForDirectory');
    sinon.stub(generator, 'initSonarwhalrc').resolves();
    sinon.spy(spinner, 'start');
    sinon.spy(spinner, 'fail');
    sinon.spy(spinner, 'succeed');

    t.context.config = config;
    t.context.generator = generator;
    t.context.logger = logger;
    t.context.spinner = spinner;
    t.context.inquirer = inquirer;
});

test.afterEach.always((t) => {
    t.context.logger.log.restore();
    t.context.logger.error.restore();
    t.context.config.getFilenameForDirectory.restore();
    t.context.generator.initSonarwhalrc.restore();
    t.context.spinner.start.restore();
    t.context.spinner.fail.restore();
    t.context.spinner.succeed.restore();
});

test.serial('If config is not defined, it should get the config file from the directory process.cwd()', async (t) => {
    const sandbox = sinon.createSandbox();

    sandbox.stub(t.context.config, 'load')
        .onFirstCall()
        .returns({});
    await analyzer.analyze(actions);

    t.true(t.context.config.getFilenameForDirectory.called);

    sandbox.restore();
});

test.serial('If config file does not exist, it should create a configuration file if user agrees', async (t) => {
    const error = { message: `Couldn't find any valid configuration` };

    const sandbox = sinon.createSandbox();

    sandbox.stub(t.context.config, 'load')
        .onFirstCall()
        .throws(error)
        .onSecondCall()
        .returns({});
    sandbox.stub(inquirer, 'prompt').resolves({ confirm: true });

    await analyzer.analyze(actions);

    t.true(t.context.inquirer.prompt.calledOnce);
    t.is(t.context.inquirer.prompt.args[0][0][0].name, 'confirm');
    t.true(t.context.generator.initSonarwhalrc.calledOnce);
    t.deepEqual(t.context.generator.initSonarwhalrc.firstCall.args[0], { init: true });

    sandbox.restore();
});

test.serial('If config file does not exist and user refuses to create a configuration file, it should exit with code 1', async (t) => {
    const error = { message: `Couldn't find any valid configuration` };
    const sandbox = sinon.createSandbox();

    sandbox.stub(t.context.config, 'load')
        .onFirstCall()
        .throws(error);
    sandbox.stub(inquirer, 'prompt').resolves({ confirm: false });

    const result = await analyzer.analyze(actions);

    t.true(t.context.inquirer.prompt.calledOnce);
    t.is(t.context.inquirer.prompt.args[0][0][0].name, 'confirm');
    t.false(t.context.generator.initSonarwhalrc.called);
    t.false(result);

    sandbox.restore();
});

test.serial('If configuration file exists, it should use it', async (t) => {
    const sandbox = sinon.createSandbox();

    sandbox.stub(t.context.config, 'load').returns({});

    const customConfigOptions = ({ _: ['http://localhost'], config: 'configfile.cfg' } as CLIOptions);

    await analyzer.analyze(customConfigOptions);

    t.false(t.context.config.getFilenameForDirectory.called);
    t.is(t.context.config.load.args[0][0], 'configfile.cfg');

    sandbox.restore();
});

test.serial('If executeOn returns an error, it should exit with code 1 and call formatter.format', async (t) => {
    const sandbox = sinon.createSandbox();

    sandbox.stub(Sonarwhal.prototype, 'executeOn').resolves([{ severity: Severity.error }]);
    sandbox.spy(formatter, 'format');
    sandbox.stub(inquirer, 'prompt').resolves({ confirm: false });
    sandbox.stub(t.context.config, 'load').returns({});

    const exitCode = await analyzer.analyze(actions);

    t.true((formatter.format as sinon.SinonSpy).called);
    t.false(exitCode);

    sandbox.restore();
});

test.serial('If executeOn returns an error, it should call to spinner.fail()', async (t) => {
    const sandbox = sinon.createSandbox();

    sandbox.stub(t.context.config, 'load').returns({});
    sandbox.stub(Sonarwhal.prototype, 'executeOn').resolves([{ severity: Severity.error }]);

    await analyzer.analyze(actions);

    t.true(t.context.spinner.fail.calledOnce);

    sandbox.restore();
});

test.serial('If executeOn throws an exception, it should exit with code 1', async (t) => {
    const sandbox = sinon.createSandbox();

    sandbox.stub(t.context.config, 'load').returns({});
    sandbox.stub(Sonarwhal.prototype, 'executeOn').throws(new Error());

    const result = await analyzer.analyze(actions);

    t.false(result);

    sandbox.restore();
});

test.serial('If executeOn throws an exception, it should call to spinner.fail()', async (t) => {
    const sandbox = sinon.createSandbox();

    sandbox.stub(t.context.config, 'load').returns({});
    sandbox.stub(Sonarwhal.prototype, 'executeOn').throws(new Error());

    await analyzer.analyze(actions);

    t.true(t.context.spinner.fail.calledOnce);

    sandbox.restore();
});

test.serial('If executeOn returns no errors, it should exit with code 0 and call formatter.format', async (t) => {
    const sandbox = sinon.createSandbox();

    sandbox.stub(t.context.config, 'load').returns({});
    sandbox.stub(Sonarwhal.prototype, 'executeOn').resolves([{ severity: 0 }]);
    sandbox.spy(formatter, 'format');

    const exitCode = await analyzer.analyze(actions);

    t.true((formatter.format as sinon.SinonSpy).called);
    t.true(exitCode);

    sandbox.restore();
});

test.serial('If executeOn returns no errors, it should call to spinner.succeed()', async (t) => {
    const sandbox = sinon.createSandbox();

    sandbox.stub(t.context.config, 'load').returns({});
    sandbox.stub(Sonarwhal.prototype, 'executeOn').resolves([{ severity: 0 }]);

    await analyzer.analyze(actions);

    t.true(t.context.spinner.succeed.calledOnce);

    sandbox.restore();
});

test.serial('Event fetch::start should write a message in the spinner', async (t) => {
    const sandbox = sinon.createSandbox();

    sandbox.stub(t.context.config, 'load').returns({});
    sandbox.stub(Sonarwhal.prototype, 'executeOn').callsFake(async () => {
        await analyzer.sonarwhal.emitAsync('fetch::start', { resource: 'http://localhost/' });
    });

    await analyzer.analyze(actions);

    t.is(spinner.text, 'Downloading http://localhost/');

    sandbox.restore();
});

test.serial('Event fetch::end should write a message in the spinner', async (t) => {
    const sandbox = sinon.createSandbox();

    sandbox.stub(t.context.config, 'load').returns({});
    sandbox.stub(Sonarwhal.prototype, 'executeOn').callsFake(async () => {
        await analyzer.sonarwhal.emitAsync('fetch::end', { resource: 'http://localhost/' });
    });

    await analyzer.analyze(actions);

    t.is(spinner.text, 'http://localhost/ downloaded');

    sandbox.restore();
});

test.serial('Event fetch::end::manifest should write a message in the spinner', async (t) => {
    const sandbox = sinon.createSandbox();

    sandbox.stub(t.context.config, 'load').returns({});
    sandbox.stub(Sonarwhal.prototype, 'executeOn').callsFake(async () => {
        await analyzer.sonarwhal.emitAsync('fetch::end', { resource: 'http://localhost/' });
    });

    await analyzer.analyze(actions);

    t.is(spinner.text, 'http://localhost/ downloaded');

    sandbox.restore();
});

test.serial('Event fetch::end::html should write a message in the spinner', async (t) => {
    const sandbox = sinon.createSandbox();

    sandbox.stub(t.context.config, 'load').returns({});
    sandbox.stub(Sonarwhal.prototype, 'executeOn').callsFake(async () => {
        await analyzer.sonarwhal.emitAsync('fetch::end', { resource: 'http://localhost/' });
    });

    await analyzer.analyze(actions);

    t.is(spinner.text, 'http://localhost/ downloaded');

    sandbox.restore();
});

test.serial('Event traverse::up should write a message in the spinner', async (t) => {
    const sandbox = sinon.createSandbox();

    sandbox.stub(t.context.config, 'load').returns({});
    sandbox.stub(Sonarwhal.prototype, 'executeOn').callsFake(async () => {
        await analyzer.sonarwhal.emitAsync('traverse::up', { resource: 'http://localhost/' });
    });

    await analyzer.analyze(actions);

    t.is(spinner.text, 'Traversing the DOM');

    sandbox.restore();
});

test.serial('Event traverse::end should write a message in the spinner', async (t) => {
    const sandbox = sinon.createSandbox();

    sandbox.stub(t.context.config, 'load').returns({});
    sandbox.stub(Sonarwhal.prototype, 'executeOn').callsFake(async () => {
        await analyzer.sonarwhal.emitAsync('traverse::end', { resource: 'http://localhost/' });
    });

    await analyzer.analyze(actions);

    t.is(spinner.text, 'Traversing finished');

    sandbox.restore();
});

test.serial('Event scan::end should write a message in the spinner', async (t) => {
    const sandbox = sinon.createSandbox();

    sandbox.stub(t.context.config, 'load').returns({});
    sandbox.stub(Sonarwhal.prototype, 'executeOn').callsFake(async () => {
        await analyzer.sonarwhal.emitAsync('scan::end', { resource: 'http://localhost/' });
    });

    await analyzer.analyze(actions);

    t.is(spinner.text, 'Finishing...');

    sandbox.restore();
});

test.serial('If no sites are defined, it should return false', async (t) => {
    const result = await analyzer.analyze({ _: [] } as CLIOptions);

    t.false(result);
});

test.serial('If _ property is not defined in actions, it should return false', async (t) => {
    const result = await analyzer.analyze({} as CLIOptions);

    t.false(result);
});
