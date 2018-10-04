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
    Configuration: {
        fromConfig() { },
        getFilenameForDirectory() { },
        loadConfigFile() { },
        validateHintsConfig() { }
    }
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

const askQuestion = { default() { } };
const validateHintsConfigResult = { invalid: [] };
const appinsight = {
    disable() { },
    enable() { },
    isConfigured() { },
    isEnabled() { },
    trackEvent() { }
};

proxyquire('../../../src/lib/cli/analyze', {
    '../config': config,
    '../engine': engineContainer,
    '../utils/appinsights': appinsight,
    '../utils/logging': logger,
    '../utils/misc/ask-question': askQuestion,
    '../utils/resource-loader': resourceLoader,
    ora
});

import { default as analyze, engine } from '../../../src/lib/cli/analyze';

test.beforeEach((t) => {
    sinon.spy(logger, 'log');
    sinon.spy(logger, 'error');
    sinon.spy(spinner, 'start');
    sinon.spy(spinner, 'fail');
    sinon.spy(spinner, 'succeed');

    t.context.Configuration = config.Configuration;
    t.context.logger = logger;
    t.context.spinner = spinner;
    t.context.askQuestion = askQuestion;
    t.context.resourceLoader = resourceLoader;
});

test.afterEach.always((t) => {
    t.context.logger.log.restore();
    t.context.logger.error.restore();
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
    sandbox.stub(t.context.Configuration, 'getFilenameForDirectory').returns('/config/path');
    sandbox.stub(t.context.Configuration, 'fromConfig').returns({});
    sandbox.stub(t.context.Configuration, 'loadConfigFile')
        .onFirstCall()
        .returns({});
    sandbox.stub(t.context.Configuration, 'validateHintsConfig').returns(validateHintsConfigResult);
    await analyze(actions);

    t.true(t.context.Configuration.getFilenameForDirectory.called);

    sandbox.restore();
});

test.serial('If config file does not exist, it should use `web-recommended` as default configuration', async (t) => {
    const sandbox = sinon.createSandbox();

    sandbox.stub(t.context.resourceLoader, 'loadResources').returns({
        incompatible: [],
        missing: []
    });
    sandbox.stub(t.context.Configuration, 'getFilenameForDirectory')
        .onFirstCall()
        .returns(null);

    sandbox.stub(t.context.Configuration, 'loadConfigFile').returns({});
    sandbox.stub(t.context.Configuration, 'fromConfig').returns({});
    sandbox.stub(t.context.Configuration, 'validateHintsConfig').returns(validateHintsConfigResult);

    sandbox.stub(askQuestion, 'default').resolves(false);
    await t.notThrows(analyze(actions));

    t.true(t.context.Configuration.fromConfig.calledOnce);
    t.deepEqual(t.context.Configuration.fromConfig.args[0][0], { extends: ['web-recommended'] });

    sandbox.restore();
});

test.serial('If config file is an invalid JSON, it should ask to use the default configuration', async (t) => {
    const sandbox = sinon.createSandbox();

    sandbox.stub(t.context.resourceLoader, 'loadResources').returns({
        incompatible: [],
        missing: []
    });
    sandbox.stub(t.context.Configuration, 'getFilenameForDirectory')
        .onFirstCall()
        .returns('config/path');

    sandbox.stub(t.context.Configuration, 'loadConfigFile').throws(new Error('Unexpected end of JSON input'));
    sandbox.stub(t.context.Configuration, 'fromConfig').returns({});
    sandbox.stub(t.context.Configuration, 'validateHintsConfig').returns(validateHintsConfigResult);
    sandbox.stub(askQuestion, 'default').resolves(true);

    await t.notThrows(analyze(actions));

    t.true(t.context.Configuration.fromConfig.calledOnce);
    t.deepEqual(t.context.Configuration.fromConfig.args[0][0], { extends: ['web-recommended'] });
    t.true(t.context.askQuestion.default.calledOnce);

    sandbox.restore();
});

test.serial('If config file has an invalid configuration, it should ask to use the default configuration', async (t) => {
    const sandbox = sinon.createSandbox();

    sandbox.stub(t.context.resourceLoader, 'loadResources').returns({
        incompatible: [],
        missing: []
    });
    sandbox.stub(t.context.Configuration, 'getFilenameForDirectory').returns('/config/path');
    sandbox.stub(t.context.Configuration, 'loadConfigFile').throws(new Error('Unexpected end of JSON input'));
    sandbox.stub(t.context.Configuration, 'fromConfig')
        .onSecondCall()
        .returns({});
    sandbox.stub(t.context.Configuration, 'validateHintsConfig').returns(validateHintsConfigResult);
    sandbox.stub(askQuestion, 'default').resolves(true);

    await analyze(actions);

    t.true(t.context.askQuestion.default.calledOnce);
    t.true(t.context.Configuration.fromConfig.calledOnce);
    t.deepEqual(t.context.Configuration.fromConfig.args[0][0], { extends: ['web-recommended'] });

    sandbox.restore();
});

test.serial('If config file is invalid and user refuses to use the default or to create a configuration file, it should exit with code 1', async (t) => {
    const error = { message: `Couldn't find any valid configuration` };
    const sandbox = sinon.createSandbox();

    sandbox.stub(t.context.resourceLoader, 'loadResources').returns({
        incompatible: [],
        missing: []
    });
    sandbox.stub(t.context.Configuration, 'getFilenameForDirectory').returns('/config/path');
    sandbox.stub(t.context.Configuration, 'loadConfigFile').returns({});
    sandbox.stub(t.context.Configuration, 'fromConfig').throws(error);
    sandbox.stub(askQuestion, 'default').resolves(false);

    const result = await analyze(actions);

    t.true(t.context.askQuestion.default.calledOnce);
    t.false(result);

    sandbox.restore();
});

test.serial('If configuration file exists, it should use it', async (t) => {
    const sandbox = sinon.createSandbox();

    sandbox.stub(t.context.resourceLoader, 'loadResources').returns({
        incompatible: [],
        missing: []
    });
    sandbox.stub(t.context.Configuration, 'getFilenameForDirectory').returns('/config/path');
    sandbox.stub(t.context.Configuration, 'loadConfigFile').returns({});
    sandbox.stub(t.context.Configuration, 'fromConfig').returns({});
    sandbox.stub(t.context.Configuration, 'validateHintsConfig').returns(validateHintsConfigResult);

    const customConfigOptions = ({ _: ['http://localhost'], config: 'configfile.cfg' } as CLIOptions);

    await analyze(customConfigOptions);

    t.true(t.context.Configuration.getFilenameForDirectory.notCalled);
    t.true(t.context.Configuration.loadConfigFile.args[0][0].endsWith('configfile.cfg'));

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

    sandbox.stub(t.context.Configuration, 'validateHintsConfig').returns(validateHintsConfigResult);

    const engineObj = new engineContainer.Engine();

    sandbox.stub(engineObj, 'formatters').get(() => {
        return [new FakeFormatter()];
    });
    sandbox.stub(engineObj, 'executeOn').resolves([{ severity: Severity.error }]);
    sandbox.stub(engineContainer, 'Engine').returns(engineObj);
    sandbox.stub(askQuestion, 'default').resolves(false);
    sandbox.stub(t.context.Configuration, 'getFilenameForDirectory').returns('/config/path');
    sandbox.stub(t.context.Configuration, 'fromConfig').returns({});
    sandbox.stub(t.context.Configuration, 'loadConfigFile').returns({});

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
    sandbox.stub(t.context.Configuration, 'getFilenameForDirectory').returns('/config/path');
    sandbox.stub(t.context.Configuration, 'fromConfig').returns({});
    sandbox.stub(t.context.Configuration, 'loadConfigFile').returns({});
    sandbox.stub(t.context.Configuration, 'validateHintsConfig').returns(validateHintsConfigResult);
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
    sandbox.stub(t.context.Configuration, 'getFilenameForDirectory').returns('/config/path');
    sandbox.stub(t.context.Configuration, 'loadConfigFile').returns({});
    sandbox.stub(t.context.Configuration, 'fromConfig').returns({});
    sandbox.stub(engineContainer.Engine.prototype, 'executeOn').throws(new Error());
    sandbox.stub(t.context.Configuration, 'validateHintsConfig').returns(validateHintsConfigResult);

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
    sandbox.stub(t.context.Configuration, 'getFilenameForDirectory').returns('/config/path');
    sandbox.stub(t.context.Configuration, 'loadConfigFile').returns({});
    sandbox.stub(t.context.Configuration, 'fromConfig').returns({});
    sandbox.stub(engineContainer.Engine.prototype, 'executeOn').throws(new Error());
    sandbox.stub(t.context.Configuration, 'validateHintsConfig').returns(validateHintsConfigResult);

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

    sandbox.stub(t.context.Configuration, 'getFilenameForDirectory').returns('/config/path');
    sandbox.stub(t.context.Configuration, 'loadConfigFile').returns({});
    sandbox.stub(t.context.Configuration, 'fromConfig').returns({});
    sandbox.stub(t.context.Configuration, 'validateHintsConfig').returns(validateHintsConfigResult);

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

    sandbox.stub(t.context.Configuration, 'getFilenameForDirectory').returns('/config/path');
    sandbox.stub(t.context.Configuration, 'loadConfigFile').returns({});
    sandbox.stub(t.context.Configuration, 'fromConfig').returns({});
    sandbox.stub(t.context.Configuration, 'validateHintsConfig').returns(validateHintsConfigResult);

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
        await engine!.emitAsync('fetch::start', { resource: 'http://localhost/' });
    });
    sandbox.stub(engineContainer, 'Engine').returns(engineObj);
    sandbox.stub(t.context.Configuration, 'getFilenameForDirectory').returns('/config/path');
    sandbox.stub(t.context.Configuration, 'loadConfigFile').returns({});
    sandbox.stub(t.context.Configuration, 'fromConfig').returns({});
    sandbox.stub(t.context.Configuration, 'validateHintsConfig').returns(validateHintsConfigResult);

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
        await engine!.emitAsync('fetch::end', { resource: 'http://localhost/' });
    });
    sandbox.stub(engineContainer, 'Engine').returns(engineObj);
    sandbox.stub(t.context.Configuration, 'getFilenameForDirectory').returns('/config/path');
    sandbox.stub(t.context.Configuration, 'loadConfigFile').returns({});
    sandbox.stub(t.context.Configuration, 'fromConfig').returns({});
    sandbox.stub(t.context.Configuration, 'validateHintsConfig').returns(validateHintsConfigResult);

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
        await engine!.emitAsync('fetch::end::html', { resource: 'http://localhost/' });
    });
    sandbox.stub(engineContainer, 'Engine').returns(engineObj);
    sandbox.stub(t.context.Configuration, 'getFilenameForDirectory').returns('/config/path');
    sandbox.stub(t.context.Configuration, 'loadConfigFile').returns({});
    sandbox.stub(t.context.Configuration, 'fromConfig').returns({});
    sandbox.stub(t.context.Configuration, 'validateHintsConfig').returns(validateHintsConfigResult);

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
        await engine!.emitAsync('traverse::up', { resource: 'http://localhost/' });
    });
    sandbox.stub(engineContainer, 'Engine').returns(engineObj);
    sandbox.stub(config.Configuration, 'getFilenameForDirectory').returns('/config/path');
    sandbox.stub(t.context.Configuration, 'loadConfigFile').returns({});
    sandbox.stub(t.context.Configuration, 'fromConfig').returns({});
    sandbox.stub(t.context.Configuration, 'validateHintsConfig').returns(validateHintsConfigResult);

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
        await engine!.emitAsync('traverse::end', { resource: 'http://localhost/' });
    });
    sandbox.stub(engineContainer, 'Engine').returns(engineObj);
    sandbox.stub(t.context.Configuration, 'getFilenameForDirectory').returns('/config/path');
    sandbox.stub(t.context.Configuration, 'loadConfigFile').returns({});
    sandbox.stub(t.context.Configuration, 'fromConfig').returns({});
    sandbox.stub(t.context.Configuration, 'validateHintsConfig').returns(validateHintsConfigResult);

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
        await engine!.emitAsync('scan::end', { resource: 'http://localhost/' });
    });
    sandbox.stub(engineContainer, 'Engine').returns(engineObj);
    sandbox.stub(config.Configuration, 'getFilenameForDirectory').returns('/config/path');
    sandbox.stub(t.context.Configuration, 'loadConfigFile').returns({});
    sandbox.stub(t.context.Configuration, 'fromConfig').returns({});
    sandbox.stub(t.context.Configuration, 'validateHintsConfig').returns(validateHintsConfigResult);

    await analyze(actions);

    t.is(spinner.text, 'Finishing...');

    sandbox.restore();
});

test.serial('If no sites are defined, it should return false', async (t) => {
    const result = await analyze({ _: [] } as any);

    t.false(result);
});
