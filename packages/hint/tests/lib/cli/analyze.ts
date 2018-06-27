import test from 'ava';
import { EventEmitter2 as EventEmitter } from 'eventemitter2';
import * as proxyquire from 'proxyquire';
import * as sinon from 'sinon';

import { CLIOptions, Severity, IFormatter, Problem } from '../../../src/lib/types';
const actions = { _: ['http://localhost/'] } as CLIOptions;

const engineContainer = {
    Engine: class Engine extends EventEmitter {
        public get formatters() {
            return [];
        }

        public close() { }
        public executeOn() { }
    }
};

const resourceLoader = {
    loadResources() {
        return {};
    }
};
const logger = {
    error() { },
    log() { }
};

const config = {
    HintConfig: {
        fromConfig() { },
        getFilenameForDirectory() { },
        loadConfigFile() { },
        validateRulesConfig() { }
    }
};

const generator = { initHintrc() { } };

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
const validateRulesConfigResult = { invalid: [] };

proxyquire('../../../src/lib/cli/analyze', {
    '../config': config,
    '../engine': engineContainer,
    '../utils/logging': logger,
    '../utils/resource-loader': resourceLoader,
    './wizards/init': generator,
    inquirer,
    ora
});

import { default as analyze, engine } from '../../../src/lib/cli/analyze';

test.beforeEach((t) => {
    sinon.spy(logger, 'log');
    sinon.spy(logger, 'error');
    sinon.stub(generator, 'initHintrc').resolves();
    sinon.spy(spinner, 'start');
    sinon.spy(spinner, 'fail');
    sinon.spy(spinner, 'succeed');

    t.context.HintConfig = config.HintConfig;
    t.context.generator = generator;
    t.context.logger = logger;
    t.context.spinner = spinner;
    t.context.inquirer = inquirer;
    t.context.resourceLoader = resourceLoader;
});

test.afterEach.always((t) => {
    t.context.logger.log.restore();
    t.context.logger.error.restore();
    t.context.generator.initHintrc.restore();
    t.context.spinner.start.restore();
    t.context.spinner.fail.restore();
    t.context.spinner.succeed.restore();
});

test.serial('If config is not defined, it should get the config file from the directory process.cwd()', async (t) => {
    const sandbox = sinon.createSandbox();

    const engineObj = new engineContainer.Engine();

    sandbox.stub(engineObj, 'executeOn').resolves([]);
    sandbox.stub(engineContainer, 'Engine').returns(engineObj);
    sandbox.stub(t.context.resourceLoader, 'loadResources').returns({
        incompatible: [],
        missing: []
    });
    sandbox.stub(t.context.HintConfig, 'getFilenameForDirectory').returns('/config/path');
    sandbox.stub(t.context.HintConfig, 'fromConfig').returns({});
    sandbox.stub(t.context.HintConfig, 'loadConfigFile')
        .onFirstCall()
        .returns({});
    sandbox.stub(t.context.HintConfig, 'validateRulesConfig').returns(validateRulesConfigResult);
    await analyze(actions);

    t.true(t.context.HintConfig.getFilenameForDirectory.called);

    sandbox.restore();
});

test.serial('If config file does not exist, it should use `web-recommended` as default configuration', async (t) => {
    const sandbox = sinon.createSandbox();

    sandbox.stub(t.context.resourceLoader, 'loadResources').returns({
        incompatible: [],
        missing: []
    });
    sandbox.stub(t.context.HintConfig, 'getFilenameForDirectory')
        .onFirstCall()
        .returns(null);

    sandbox.stub(t.context.HintConfig, 'loadConfigFile').returns({});
    sandbox.stub(t.context.HintConfig, 'fromConfig').returns({});
    sandbox.stub(t.context.HintConfig, 'validateRulesConfig').returns(validateRulesConfigResult);

    sandbox.stub(inquirer, 'prompt').resolves({ confirm: false });
    await t.notThrows(analyze(actions));

    t.true(t.context.HintConfig.fromConfig.calledOnce);
    t.deepEqual(t.context.HintConfig.fromConfig.args[0][0], { extends: ['web-recommended'] });

    sandbox.restore();
});

test.serial('If config file is an invalid JSON, it should ask to use the default configuration', async (t) => {
    const sandbox = sinon.createSandbox();

    sandbox.stub(t.context.resourceLoader, 'loadResources').returns({
        incompatible: [],
        missing: []
    });
    sandbox.stub(t.context.HintConfig, 'getFilenameForDirectory')
        .onFirstCall()
        .returns('config/path');

    sandbox.stub(t.context.HintConfig, 'loadConfigFile').throws(new Error('Unexpected end of JSON input'));
    sandbox.stub(t.context.HintConfig, 'fromConfig').returns({});
    sandbox.stub(t.context.HintConfig, 'validateRulesConfig').returns(validateRulesConfigResult);
    sandbox.stub(inquirer, 'prompt').resolves({ confirm: true });

    await t.notThrows(analyze(actions));

    t.true(t.context.HintConfig.fromConfig.calledOnce);
    t.deepEqual(t.context.HintConfig.fromConfig.args[0][0], { extends: ['web-recommended'] });
    t.true(t.context.inquirer.prompt.calledOnce);
    t.is(t.context.inquirer.prompt.args[0][0][0].name, 'confirm');
    t.true(t.context.generator.initHintrc.notCalled);

    sandbox.restore();
});

test.serial('If config file has an invalid configuration, it should ask to use the default configuration', async (t) => {
    const sandbox = sinon.createSandbox();

    sandbox.stub(t.context.resourceLoader, 'loadResources').returns({
        incompatible: [],
        missing: []
    });
    sandbox.stub(t.context.HintConfig, 'getFilenameForDirectory').returns('/config/path');
    sandbox.stub(t.context.HintConfig, 'loadConfigFile').throws(new Error('Unexpected end of JSON input'));
    sandbox.stub(t.context.HintConfig, 'fromConfig')
        .onSecondCall()
        .returns({});
    sandbox.stub(t.context.HintConfig, 'validateRulesConfig').returns(validateRulesConfigResult);
    sandbox.stub(inquirer, 'prompt').resolves({ confirm: true });

    await analyze(actions);

    t.true(t.context.inquirer.prompt.calledOnce);
    t.true(t.context.generator.initHintrc.notCalled);
    t.is(t.context.inquirer.prompt.args[0][0][0].name, 'confirm');
    t.true(t.context.HintConfig.fromConfig.calledOnce);
    t.deepEqual(t.context.HintConfig.fromConfig.args[0][0], { extends: ['web-recommended'] });

    sandbox.restore();
});

test.serial('If config file is invalid and user refuses to use the default or to create a configuration file, it should exit with code 1', async (t) => {
    const error = { message: `Couldn't find any valid configuration` };
    const sandbox = sinon.createSandbox();

    sandbox.stub(t.context.resourceLoader, 'loadResources').returns({
        incompatible: [],
        missing: []
    });
    sandbox.stub(t.context.HintConfig, 'getFilenameForDirectory').returns('/config/path');
    sandbox.stub(t.context.HintConfig, 'loadConfigFile').returns({});
    sandbox.stub(t.context.HintConfig, 'fromConfig').throws(error);
    sandbox.stub(inquirer, 'prompt').resolves({ confirm: false });

    const result = await analyze(actions);

    t.true(t.context.inquirer.prompt.calledTwice);
    t.is(t.context.inquirer.prompt.args[0][0][0].name, 'confirm');
    t.is(t.context.inquirer.prompt.args[1][0][0].name, 'confirm');
    t.false(t.context.generator.initHintrc.called);
    t.false(result);

    sandbox.restore();
});

test.serial('If configuration file exists, it should use it', async (t) => {
    const sandbox = sinon.createSandbox();

    sandbox.stub(t.context.resourceLoader, 'loadResources').returns({
        incompatible: [],
        missing: []
    });
    sandbox.stub(t.context.HintConfig, 'getFilenameForDirectory').returns('/config/path');
    sandbox.stub(t.context.HintConfig, 'loadConfigFile').returns({});
    sandbox.stub(t.context.HintConfig, 'fromConfig').returns({});
    sandbox.stub(t.context.HintConfig, 'validateRulesConfig').returns(validateRulesConfigResult);

    const customConfigOptions = ({ _: ['http://localhost'], config: 'configfile.cfg' } as CLIOptions);

    await analyze(customConfigOptions);

    t.false(t.context.HintConfig.getFilenameForDirectory.called);
    t.true(t.context.HintConfig.loadConfigFile.args[0][0].endsWith('configfile.cfg'));

    sandbox.restore();
});

test.serial('If executeOn returns an error, it should exit with code 1 and call formatter.format', async (t) => {
    const sandbox = sinon.createSandbox();

    class FakeFormatter implements IFormatter {
        public static called: boolean = false;
        public constructor() { }

        public format(problems: Array<Problem>) {
            FakeFormatter.called = true;
            console.log(problems);
        }
    }

    sandbox.stub(t.context.resourceLoader, 'loadResources').returns({
        formatters: [FakeFormatter],
        incompatible: [],
        missing: []
    });

    sandbox.stub(t.context.HintConfig, 'validateRulesConfig').returns(validateRulesConfigResult);

    const engineObj = new engineContainer.Engine();

    sandbox.stub(engineObj, 'formatters').get(() => {
        return [new FakeFormatter()];
    });
    sandbox.stub(engineObj, 'executeOn').resolves([{ severity: Severity.error }]);
    sandbox.stub(engineContainer, 'Engine').returns(engineObj);
    sandbox.stub(inquirer, 'prompt').resolves({ confirm: false });
    sandbox.stub(t.context.HintConfig, 'getFilenameForDirectory').returns('/config/path');
    sandbox.stub(t.context.HintConfig, 'fromConfig').returns({});
    sandbox.stub(t.context.HintConfig, 'loadConfigFile').returns({});

    const exitCode = await analyze(actions);

    t.true(FakeFormatter.called);
    t.false(exitCode);

    sandbox.restore();
});

test.serial('If executeOn returns an error, it should call to spinner.fail()', async (t) => {
    const sandbox = sinon.createSandbox();

    sandbox.stub(t.context.resourceLoader, 'loadResources').returns({
        incompatible: [],
        missing: []
    });
    sandbox.stub(t.context.HintConfig, 'getFilenameForDirectory').returns('/config/path');
    sandbox.stub(t.context.HintConfig, 'fromConfig').returns({});
    sandbox.stub(t.context.HintConfig, 'loadConfigFile').returns({});
    sandbox.stub(t.context.HintConfig, 'validateRulesConfig').returns(validateRulesConfigResult);
    sandbox.stub(engineContainer.Engine.prototype, 'executeOn').resolves([{ severity: Severity.error }]);

    await analyze(actions);

    t.true(t.context.spinner.fail.calledOnce);

    sandbox.restore();
});

test.serial('If executeOn throws an exception, it should exit with code 1', async (t) => {
    const sandbox = sinon.createSandbox();

    sandbox.stub(t.context.resourceLoader, 'loadResources').returns({
        incompatible: [],
        missing: []
    });
    sandbox.stub(t.context.HintConfig, 'getFilenameForDirectory').returns('/config/path');
    sandbox.stub(t.context.HintConfig, 'loadConfigFile').returns({});
    sandbox.stub(t.context.HintConfig, 'fromConfig').returns({});
    sandbox.stub(engineContainer.Engine.prototype, 'executeOn').throws(new Error());
    sandbox.stub(t.context.HintConfig, 'validateRulesConfig').returns(validateRulesConfigResult);

    const result = await analyze(actions);

    t.false(result);

    sandbox.restore();
});

test.serial('If executeOn throws an exception, it should call to spinner.fail()', async (t) => {
    const sandbox = sinon.createSandbox();

    sandbox.stub(t.context.resourceLoader, 'loadResources').returns({
        incompatible: [],
        missing: []
    });
    sandbox.stub(t.context.HintConfig, 'getFilenameForDirectory').returns('/config/path');
    sandbox.stub(t.context.HintConfig, 'loadConfigFile').returns({});
    sandbox.stub(t.context.HintConfig, 'fromConfig').returns({});
    sandbox.stub(engineContainer.Engine.prototype, 'executeOn').throws(new Error());
    sandbox.stub(t.context.HintConfig, 'validateRulesConfig').returns(validateRulesConfigResult);

    await analyze(actions);

    t.true(t.context.spinner.fail.calledOnce);

    sandbox.restore();
});

test.serial('If executeOn returns no errors, it should exit with code 0 and call formatter.format', async (t) => {
    const sandbox = sinon.createSandbox();

    class FakeFormatter implements IFormatter {
        public static called: boolean = false;
        public constructor() { }

        public format(problems: Array<Problem>) {
            FakeFormatter.called = true;
            console.log(problems);
        }
    }

    sandbox.stub(t.context.resourceLoader, 'loadResources').returns({
        formatters: [FakeFormatter],
        incompatible: [],
        missing: []
    });

    const engineObj = new engineContainer.Engine();

    sandbox.stub(engineObj, 'formatters').get(() => {
        return [new FakeFormatter()];
    });
    sandbox.stub(engineObj, 'executeOn').resolves([{ severity: 0 }]);
    sandbox.stub(engineContainer, 'Engine').returns(engineObj);

    sandbox.stub(t.context.HintConfig, 'getFilenameForDirectory').returns('/config/path');
    sandbox.stub(t.context.HintConfig, 'loadConfigFile').returns({});
    sandbox.stub(t.context.HintConfig, 'fromConfig').returns({});
    sandbox.stub(t.context.HintConfig, 'validateRulesConfig').returns(validateRulesConfigResult);

    const exitCode = await analyze(actions);

    t.true(FakeFormatter.called);
    t.true(exitCode);

    sandbox.restore();
});

test.serial('If executeOn returns no errors, it should call to spinner.succeed()', async (t) => {
    const sandbox = sinon.createSandbox();

    class FakeFormatter implements IFormatter {
        public static called: boolean = false;
        public constructor() { }

        public format(problems: Array<Problem>) {
            FakeFormatter.called = true;
            console.log(problems);
        }
    }

    sandbox.stub(t.context.resourceLoader, 'loadResources').returns({
        formatters: [FakeFormatter],
        incompatible: [],
        missing: []
    });

    const engineObj = new engineContainer.Engine();

    sandbox.stub(engineObj, 'formatters').get(() => {
        return [new FakeFormatter()];
    });
    sandbox.stub(engineObj, 'executeOn').resolves([{ severity: 0 }]);
    sandbox.stub(engineContainer, 'Engine').returns(engineObj);

    sandbox.stub(t.context.HintConfig, 'getFilenameForDirectory').returns('/config/path');
    sandbox.stub(t.context.HintConfig, 'loadConfigFile').returns({});
    sandbox.stub(t.context.HintConfig, 'fromConfig').returns({});
    sandbox.stub(t.context.HintConfig, 'validateRulesConfig').returns(validateRulesConfigResult);

    await analyze(actions);

    t.true(t.context.spinner.succeed.calledOnce);

    sandbox.restore();
});

test.serial('Event fetch::start should write a message in the spinner', async (t) => {
    const sandbox = sinon.createSandbox();

    class FakeFormatter implements IFormatter {
        public static called: boolean = false;
        public constructor() { }

        public format(problems: Array<Problem>) {
            FakeFormatter.called = true;
            console.log(problems);
        }
    }

    sandbox.stub(t.context.resourceLoader, 'loadResources').returns({
        formatters: [FakeFormatter],
        incompatible: [],
        missing: []
    });

    const engineObj = new engineContainer.Engine();

    sandbox.stub(engineObj, 'formatters').get(() => {
        return [new FakeFormatter()];
    });
    sandbox.stub(engineObj, 'executeOn').callsFake(async () => {
        await engine.emitAsync('fetch::start', { resource: 'http://localhost/' });
    });
    sandbox.stub(engineContainer, 'Engine').returns(engineObj);
    sandbox.stub(t.context.HintConfig, 'getFilenameForDirectory').returns('/config/path');
    sandbox.stub(t.context.HintConfig, 'loadConfigFile').returns({});
    sandbox.stub(t.context.HintConfig, 'fromConfig').returns({});
    sandbox.stub(t.context.HintConfig, 'validateRulesConfig').returns(validateRulesConfigResult);

    await analyze(actions);

    t.is(spinner.text, 'Downloading http://localhost/');

    sandbox.restore();
});

test.serial('Event fetch::end should write a message in the spinner', async (t) => {
    const sandbox = sinon.createSandbox();

    class FakeFormatter implements IFormatter {
        public static called: boolean = false;
        public constructor() { }

        public format(problems: Array<Problem>) {
            FakeFormatter.called = true;
            console.log(problems);
        }
    }

    sandbox.stub(t.context.resourceLoader, 'loadResources').returns({
        formatters: [FakeFormatter],
        incompatible: [],
        missing: []
    });

    const engineObj = new engineContainer.Engine();

    sandbox.stub(engineObj, 'formatters').get(() => {
        return [new FakeFormatter()];
    });
    sandbox.stub(engineObj, 'executeOn').callsFake(async () => {
        await engine.emitAsync('fetch::end', { resource: 'http://localhost/' });
    });
    sandbox.stub(engineContainer, 'Engine').returns(engineObj);
    sandbox.stub(t.context.HintConfig, 'getFilenameForDirectory').returns('/config/path');
    sandbox.stub(t.context.HintConfig, 'loadConfigFile').returns({});
    sandbox.stub(t.context.HintConfig, 'fromConfig').returns({});
    sandbox.stub(t.context.HintConfig, 'validateRulesConfig').returns(validateRulesConfigResult);

    await analyze(actions);

    t.is(spinner.text, 'http://localhost/ downloaded');

    sandbox.restore();
});

test.serial('Event fetch::end::html should write a message in the spinner', async (t) => {
    const sandbox = sinon.createSandbox();

    class FakeFormatter implements IFormatter {
        public static called: boolean = false;
        public constructor() { }

        public format(problems: Array<Problem>) {
            FakeFormatter.called = true;
            console.log(problems);
        }
    }

    sandbox.stub(t.context.resourceLoader, 'loadResources').returns({
        formatters: [FakeFormatter],
        incompatible: [],
        missing: []
    });

    const engineObj = new engineContainer.Engine();

    sandbox.stub(engineObj, 'formatters').get(() => {
        return [new FakeFormatter()];
    });
    sandbox.stub(engineObj, 'executeOn').callsFake(async () => {
        await engine.emitAsync('fetch::end::html', { resource: 'http://localhost/' });
    });
    sandbox.stub(engineContainer, 'Engine').returns(engineObj);
    sandbox.stub(t.context.HintConfig, 'getFilenameForDirectory').returns('/config/path');
    sandbox.stub(t.context.HintConfig, 'loadConfigFile').returns({});
    sandbox.stub(t.context.HintConfig, 'fromConfig').returns({});
    sandbox.stub(t.context.HintConfig, 'validateRulesConfig').returns(validateRulesConfigResult);

    await analyze(actions);

    t.is(spinner.text, 'http://localhost/ downloaded');

    sandbox.restore();
});

test.serial('Event traverse::up should write a message in the spinner', async (t) => {
    const sandbox = sinon.createSandbox();

    class FakeFormatter implements IFormatter {
        public static called: boolean = false;
        public constructor() { }

        public format(problems: Array<Problem>) {
            FakeFormatter.called = true;
            console.log(problems);
        }
    }

    sandbox.stub(t.context.resourceLoader, 'loadResources').returns({
        formatters: [FakeFormatter],
        incompatible: [],
        missing: []
    });

    const engineObj = new engineContainer.Engine();

    sandbox.stub(engineObj, 'formatters').get(() => {
        return [new FakeFormatter()];
    });
    sandbox.stub(engineObj, 'executeOn').callsFake(async () => {
        await engine.emitAsync('traverse::up', { resource: 'http://localhost/' });
    });
    sandbox.stub(engineContainer, 'Engine').returns(engineObj);
    sandbox.stub(config.HintConfig, 'getFilenameForDirectory').returns('/config/path');
    sandbox.stub(t.context.HintConfig, 'loadConfigFile').returns({});
    sandbox.stub(t.context.HintConfig, 'fromConfig').returns({});
    sandbox.stub(t.context.HintConfig, 'validateRulesConfig').returns(validateRulesConfigResult);

    await analyze(actions);

    t.is(spinner.text, 'Traversing the DOM');

    sandbox.restore();
});

test.serial('Event traverse::end should write a message in the spinner', async (t) => {
    const sandbox = sinon.createSandbox();

    class FakeFormatter implements IFormatter {
        public static called: boolean = false;
        public constructor() { }

        public format(problems: Array<Problem>) {
            FakeFormatter.called = true;
            console.log(problems);
        }
    }

    sandbox.stub(t.context.resourceLoader, 'loadResources').returns({
        formatters: [FakeFormatter],
        incompatible: [],
        missing: []
    });

    const engineObj = new engineContainer.Engine();

    sandbox.stub(engineObj, 'formatters').get(() => {
        return [new FakeFormatter()];
    });
    sandbox.stub(engineObj, 'executeOn').callsFake(async () => {
        await engine.emitAsync('traverse::end', { resource: 'http://localhost/' });
    });
    sandbox.stub(engineContainer, 'Engine').returns(engineObj);
    sandbox.stub(t.context.HintConfig, 'getFilenameForDirectory').returns('/config/path');
    sandbox.stub(t.context.HintConfig, 'loadConfigFile').returns({});
    sandbox.stub(t.context.HintConfig, 'fromConfig').returns({});
    sandbox.stub(t.context.HintConfig, 'validateRulesConfig').returns(validateRulesConfigResult);

    await analyze(actions);

    t.is(spinner.text, 'Traversing finished');

    sandbox.restore();
});

test.serial('Event scan::end should write a message in the spinner', async (t) => {
    const sandbox = sinon.createSandbox();

    class FakeFormatter implements IFormatter {
        public static called: boolean = false;
        public constructor() { }

        public format(problems: Array<Problem>) {
            FakeFormatter.called = true;
            console.log(problems);
        }
    }

    sandbox.stub(t.context.resourceLoader, 'loadResources').returns({
        formatters: [FakeFormatter],
        incompatible: [],
        missing: []
    });

    const engineObj = new engineContainer.Engine();

    sandbox.stub(engineObj, 'formatters').get(() => {
        return [new FakeFormatter()];
    });
    sandbox.stub(engineObj, 'executeOn').callsFake(async () => {
        await engine.emitAsync('scan::end', { resource: 'http://localhost/' });
    });
    sandbox.stub(engineContainer, 'Engine').returns(engineObj);
    sandbox.stub(config.HintConfig, 'getFilenameForDirectory').returns('/config/path');
    sandbox.stub(t.context.HintConfig, 'loadConfigFile').returns({});
    sandbox.stub(t.context.HintConfig, 'fromConfig').returns({});
    sandbox.stub(t.context.HintConfig, 'validateRulesConfig').returns(validateRulesConfigResult);

    await analyze(actions);

    t.is(spinner.text, 'Finishing...');

    sandbox.restore();
});

test.serial('If no sites are defined, it should return false', async (t) => {
    const result = await analyze({ _: [] } as CLIOptions);

    t.false(result);
});
