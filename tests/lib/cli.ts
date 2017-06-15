import { EventEmitter2 as EventEmitter } from 'eventemitter2';
import * as proxyquire from 'proxyquire';
import * as sinon from 'sinon';
import test from 'ava';

class Sonar extends EventEmitter {
    public close() { }
    public executeOn() { }
}

const engine = new Sonar();
const sonar = {
    create: () => {
        return engine;
    }
};
const formatter = { format: () => { } };
const resourceLoader = {
    getFormatters() {
        return new Map([
            ['json', formatter]
        ]);
    }
};
const logger = {
    error() { },
    log() { }
};
const validator = { validateConfig() { } };
const config = {
    generate() { },
    getFilenameForDirectory() { },
    load() { }
};

const spinner = {
    fail() { },
    start() { },
    succeed() { },
    text: ''
};

const ora = () => {
    return spinner;
};

proxyquire('../../src/lib/cli', {
    './config': config,
    './config/config-validator': validator,
    './sonar': sonar,
    './utils/logging': logger,
    './utils/resource-loader': resourceLoader,
    ora
});

import { cli } from '../../src/lib/cli';
import { Severity } from '../../src/lib/types';

test.beforeEach((t) => {
    sinon.spy(logger, 'log');
    sinon.spy(logger, 'error');
    sinon.spy(config, 'getFilenameForDirectory');
    sinon.spy(config, 'load');
    sinon.stub(config, 'generate').resolves();
    sinon.spy(spinner, 'start');
    sinon.spy(spinner, 'fail');
    sinon.spy(spinner, 'succeed');

    t.context.logger = logger;
    t.context.config = config;
    t.context.spinner = spinner;
});

test.afterEach.always((t) => {
    t.context.logger.log.restore();
    t.context.logger.error.restore();
    t.context.config.getFilenameForDirectory.restore();
    t.context.config.load.restore();
    t.context.config.generate.restore();
    t.context.spinner.start.restore();
    t.context.spinner.fail.restore();
    t.context.spinner.succeed.restore();
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

    t.true(t.context.config.generate.calledOnce);
    t.is(exitCode, 0);
});

test.serial('if config is not defined, it should get the config file from the directory process.cwd()', async (t) => {
    // We just want to test `config.getFilenameForDirectory`. To avoid unneeded stub, we return `false` in `validateConfig`
    sinon.stub(validator, 'validateConfig').returns(false);
    t.context.validator = validator;

    await cli.execute('http://localhost/');

    t.true(t.context.config.getFilenameForDirectory.called);

    t.context.validator.validateConfig.restore();
});

test.serial('if configuration file exists, it should use it', async (t) => {
    sinon.stub(validator, 'validateConfig').returns(false);
    t.context.validator = validator;

    await cli.execute('http://localhost/ --config configfile.cfg');

    t.false(t.context.config.getFilenameForDirectory.called);
    t.is(t.context.config.load.args[0][0], 'configfile.cfg');

    t.context.validator.validateConfig.restore();
});

test.serial('if validator fails, exit code should be 1', async (t) => {
    sinon.stub(validator, 'validateConfig').returns(false);
    t.context.validator = validator;

    const exitCode = await cli.execute('http://localhost/');

    t.true(t.context.logger.error.calledOnce);
    t.is(exitCode, 1);

    t.context.validator.validateConfig.restore();
});

test.serial('if executeOn returns an error, it should exit with code 1 and call formatter.format', async (t) => {
    sinon.stub(validator, 'validateConfig').returns(true);
    sinon.stub(engine, 'executeOn').returns([{ severity: Severity.error }]);
    sinon.spy(formatter, 'format');
    t.context.validator = validator;
    t.context.engine = engine;
    t.context.formatter = formatter;

    const exitCode = await cli.execute('http://localhost/');

    t.true(t.context.formatter.format.called);
    t.is(exitCode, 1);

    t.context.validator.validateConfig.restore();
    t.context.engine.executeOn.restore();
    t.context.formatter.format.restore();
});

test.serial('if executeOn returns an error, it should call to spinner.fail()', async (t) => {
    sinon.stub(validator, 'validateConfig').returns(true);
    sinon.stub(engine, 'executeOn').returns([{ severity: Severity.error }]);

    t.context.validator = validator;
    t.context.engine = engine;

    await cli.execute('http://localhost/');

    t.true(t.context.spinner.fail.calledOnce);

    t.context.validator.validateConfig.restore();
    t.context.engine.executeOn.restore();
});

test.serial('if executeOn throws an exception, it should exit with code 1', async (t) => {
    sinon.stub(validator, 'validateConfig').returns(true);
    sinon.stub(engine, 'executeOn').throws(new Error());
    t.context.validator = validator;
    t.context.engine = engine;

    const exitCode = await cli.execute('http://localhost/');

    t.is(exitCode, 1);

    t.context.validator.validateConfig.restore();
    t.context.engine.executeOn.restore();
});

test.serial('if executeOn throws an exception, it should call to spinner.fail()', async (t) => {
    sinon.stub(validator, 'validateConfig').returns(true);
    sinon.stub(engine, 'executeOn').throws(new Error());
    t.context.validator = validator;
    t.context.engine = engine;

    await cli.execute('http://localhost/');

    t.true(t.context.spinner.fail.calledOnce);

    t.context.validator.validateConfig.restore();
    t.context.engine.executeOn.restore();
});

test.serial('if executeOn returns no errors, it should exit with code 0 and call formatter.format', async (t) => {
    sinon.stub(validator, 'validateConfig').returns(true);
    sinon.stub(engine, 'executeOn').returns([{ severity: 0 }]);
    sinon.spy(formatter, 'format');
    t.context.validator = validator;
    t.context.engine = engine;
    t.context.formatter = formatter;

    const exitCode = await cli.execute('http://localhost/');

    t.true(t.context.formatter.format.called);
    t.is(exitCode, 0);

    t.context.validator.validateConfig.restore();
    t.context.engine.executeOn.restore();
    t.context.formatter.format.restore();
});

test.serial('if executeOn returns no errors, it should call to spinner.succeed()', async (t) => {
    sinon.stub(validator, 'validateConfig').returns(true);
    sinon.stub(engine, 'executeOn').returns([{ severity: 0 }]);
    t.context.validator = validator;
    t.context.engine = engine;
    t.context.formatter = formatter;

    await cli.execute('http://localhost/');

    t.true(t.context.spinner.succeed.calledOnce);

    t.context.validator.validateConfig.restore();
    t.context.engine.executeOn.restore();
});

test.serial('Event fetch::start should write a message in the spinner', async (t) => {
    sinon.stub(validator, 'validateConfig').returns(true);
    sinon.stub(engine, 'executeOn').callsFake(async () => {
        await engine.emitAsync('fetch::start', { resource: 'http://localhost/' });
    });

    t.context.validator = validator;
    t.context.engine = engine;

    await cli.execute('http://localhost/');

    t.is(spinner.text, 'Downloading http://localhost/');

    t.context.validator.validateConfig.restore();
    t.context.engine.executeOn.restore();
});

test.serial('Event fetch::end should write a message in the spinner', async (t) => {
    sinon.stub(validator, 'validateConfig').returns(true);
    sinon.stub(engine, 'executeOn').callsFake(async () => {
        await engine.emitAsync('fetch::end', { resource: 'http://localhost/' });
    });

    t.context.validator = validator;
    t.context.engine = engine;

    await cli.execute('http://localhost/');

    t.is(spinner.text, 'http://localhost/ Downloaded');

    t.context.validator.validateConfig.restore();
    t.context.engine.executeOn.restore();
});

test.serial('Event traverse::up should write a message in the spinner', async (t) => {
    sinon.stub(validator, 'validateConfig').returns(true);
    sinon.stub(engine, 'executeOn').callsFake(async () => {
        await engine.emitAsync('traverse::up', { resource: 'http://localhost/' });
    });

    t.context.validator = validator;
    t.context.engine = engine;

    await cli.execute('http://localhost/');

    t.is(spinner.text, 'Traversing the DOM');

    t.context.validator.validateConfig.restore();
    t.context.engine.executeOn.restore();
});

test.serial('Event traverse::end should write a message in the spinner', async (t) => {
    sinon.stub(validator, 'validateConfig').returns(true);
    sinon.stub(engine, 'executeOn').callsFake(async () => {
        await engine.emitAsync('traverse::end', { resource: 'http://localhost/' });
    });

    t.context.validator = validator;
    t.context.engine = engine;

    await cli.execute('http://localhost/');

    t.is(spinner.text, 'Traversing finished');

    t.context.validator.validateConfig.restore();
    t.context.engine.executeOn.restore();
});

test.serial('Event scann::end should write a message in the spinner', async (t) => {
    sinon.stub(validator, 'validateConfig').returns(true);
    sinon.stub(engine, 'executeOn').callsFake(async () => {
        await engine.emitAsync('scan::end', { resource: 'http://localhost/' });
    });

    t.context.validator = validator;
    t.context.engine = engine;

    await cli.execute('http://localhost/');

    t.is(spinner.text, 'Finishing...');

    t.context.validator.validateConfig.restore();
    t.context.engine.executeOn.restore();
});
