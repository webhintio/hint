import { URL } from 'url';

import { EventEmitter2 as EventEmitter } from 'eventemitter2';
import * as proxyquire from 'proxyquire';
import * as sinon from 'sinon';
import anyTest, { AssertContext, Context, RegisterContextual } from 'ava';

import { CLIOptions, Severity, IFormatter, Problem, HintResources, IConnector, UserConfig } from '../../../src/lib/types';
const actions = { _: ['http://localhost/'] } as CLIOptions;

class FakeConnector implements IConnector {
    public collect(target: URL) {
        return Promise.resolve(target);
    }

    public close() {
        return Promise.resolve();
    }

    public evaluate(): any { }

    public fetchContent(): any { }

    public querySelectorAll(): any { }
}

type ResourceLoader = {
    loadResources: () => HintResources | null;
};

type ValidateHintsConfigResult = {
    invalid: any[];
};

type Configuration = {
    fromConfig: (config: UserConfig | null) => {};
    getFilenameForDirectory: () => string | null;
    loadConfigFile: () => {};
    validateHintsConfig: () => ValidateHintsConfigResult | null;
};

type Config = {
    Configuration: Configuration;
};

type Spinner = {
    fail: () => void;
    start: () => void;
    succeed: () => void;
    text: string;
};

type AskQuestion = {
    default: () => any;
};

type Logger = {
    error: (text: string) => any;
    log: (text: string) => any;
};

class Engine extends EventEmitter {
    public get formatters() {
        return [];
    }

    public close() { }
    public executeOn() { }
}

const engineContainer = { Engine };

const resourceLoader: ResourceLoader = {
    loadResources() {
        return null;
    }
};
const logger: Logger = {
    error(text: string) { },
    log(text: string) { }
};

const config: Config = {
    Configuration: {
        fromConfig(config: UserConfig | null) {
            return {};
        },
        getFilenameForDirectory() {
            return '';
        },
        loadConfigFile() {
            return {};
        },
        validateHintsConfig() {
            return null;
        }
    }
};

const spinner: Spinner = {
    fail() { },
    start() { },
    succeed() { },
    text: ''
};

const ora = () => {
    return spinner;
};

const askQuestion: AskQuestion = { default() { } };
const validateHintsConfigResult: ValidateHintsConfigResult = { invalid: [] };
const appinsight = {
    disable() { },
    enable() { },
    isConfigured() { },
    isEnabled() { },
    trackEvent() { }
};

type ConfigTestContext = {
    logSpy: sinon.SinonSpy<[string]>;
    errorSpy: sinon.SinonSpy<[string]>;
    resourceLoader: ResourceLoader;
    startSpy: sinon.SinonSpy<[]>;
    failSpy: sinon.SinonSpy<[]>;
    succeedSpy: sinon.SinonSpy<[]>;
    askQuestion: AskQuestion;
};

type TestContext = Context<ConfigTestContext> & AssertContext;

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

const test = anyTest as RegisterContextual<ConfigTestContext>;

test.beforeEach((t: TestContext) => {
    t.context.logSpy = sinon.spy(logger, 'log');
    t.context.errorSpy = sinon.spy(logger, 'error');
    t.context.startSpy = sinon.spy(spinner, 'start');
    t.context.failSpy = sinon.spy(spinner, 'fail');
    t.context.succeedSpy = sinon.spy(spinner, 'succeed');

    t.context.askQuestion = askQuestion;
    t.context.resourceLoader = resourceLoader;
});

test.afterEach.always((t: TestContext) => {
    t.context.logSpy.restore();
    t.context.errorSpy.restore();
    t.context.startSpy.restore();
    t.context.failSpy.restore();
    t.context.succeedSpy.restore();
});

test.serial('If config is not defined, it should get the config file from the directory process.cwd()', async (t: TestContext) => {
    const sandbox = sinon.createSandbox();

    const engineObj = new engineContainer.Engine();

    sandbox.stub(engineObj, 'executeOn').resolves([]);
    sandbox.stub(engineContainer, 'Engine').returns(engineObj);
    sandbox.stub(t.context.resourceLoader, 'loadResources').returns({
        connector: FakeConnector,
        formatters: [],
        hints: [],
        incompatible: [],
        missing: [],
        parsers: []
    });
    const getFilenameForDirectoryStub = sandbox.stub(config.Configuration, 'getFilenameForDirectory').returns('/config/path');

    sandbox.stub(config.Configuration, 'fromConfig').returns({});
    sandbox.stub(config.Configuration, 'loadConfigFile')
        .onFirstCall()
        .returns({});
    sandbox.stub(config.Configuration, 'validateHintsConfig').returns(validateHintsConfigResult);
    await analyze(actions);

    t.true(getFilenameForDirectoryStub.called);

    sandbox.restore();
});

test.serial('If config file does not exist, it should use `web-recommended` as default configuration', async (t: TestContext) => {
    const sandbox = sinon.createSandbox();

    sandbox.stub(t.context.resourceLoader, 'loadResources').returns({
        connector: FakeConnector,
        formatters: [],
        hints: [],
        incompatible: [],
        missing: [],
        parsers: []
    });
    sandbox.stub(config.Configuration, 'getFilenameForDirectory')
        .onFirstCall()
        .returns(null);

    sandbox.stub(config.Configuration, 'loadConfigFile').returns({});
    const fromConfigStub = sandbox.stub(config.Configuration, 'fromConfig').returns({});

    sandbox.stub(config.Configuration, 'validateHintsConfig').returns(validateHintsConfigResult);

    sandbox.stub(askQuestion, 'default').resolves(false);
    await t.notThrows(analyze(actions));

    t.true(fromConfigStub.calledOnce);
    t.deepEqual(fromConfigStub.args[0][0], { extends: ['web-recommended'] });

    sandbox.restore();
});

test.serial('If config file is an invalid JSON, it should ask to use the default configuration', async (t: TestContext) => {
    const sandbox = sinon.createSandbox();

    sandbox.stub(t.context.resourceLoader, 'loadResources').returns({
        connector: FakeConnector,
        formatters: [],
        hints: [],
        incompatible: [],
        missing: [],
        parsers: []
    });
    sandbox.stub(config.Configuration, 'getFilenameForDirectory')
        .onFirstCall()
        .returns('config/path');

    sandbox.stub(config.Configuration, 'loadConfigFile').throws(new Error('Unexpected end of JSON input'));
    sandbox.stub(config.Configuration, 'fromConfig').returns({});
    sandbox.stub(config.Configuration, 'validateHintsConfig').returns(validateHintsConfigResult);
    sandbox.stub(askQuestion, 'default').resolves(true);

    await t.notThrows(analyze(actions));

    t.true((config.Configuration.fromConfig as any).calledOnce);
    t.deepEqual((config.Configuration.fromConfig as any).args[0][0], { extends: ['web-recommended'] });
    t.true((t.context.askQuestion.default as any).calledOnce);

    sandbox.restore();
});

test.serial('If config file has an invalid configuration, it should ask to use the default configuration', async (t: TestContext) => {
    const sandbox = sinon.createSandbox();

    sandbox.stub(t.context.resourceLoader, 'loadResources').returns({
        connector: FakeConnector,
        formatters: [],
        hints: [],
        incompatible: [],
        missing: [],
        parsers: []
    });
    sandbox.stub(config.Configuration, 'getFilenameForDirectory').returns('/config/path');
    sandbox.stub(config.Configuration, 'loadConfigFile').throws(new Error('Unexpected end of JSON input'));
    sandbox.stub(config.Configuration, 'fromConfig')
        .onSecondCall()
        .returns({});
    sandbox.stub(config.Configuration, 'validateHintsConfig').returns(validateHintsConfigResult);
    sandbox.stub(askQuestion, 'default').resolves(true);

    await analyze(actions);

    t.true((t.context.askQuestion.default as any).calledOnce);
    t.true((config.Configuration.fromConfig as any).calledOnce);
    t.deepEqual((config.Configuration.fromConfig as any).args[0][0], { extends: ['web-recommended'] });

    sandbox.restore();
});

test.serial('If config file is invalid and user refuses to use the default or to create a configuration file, it should exit with code 1', async (t: TestContext) => {
    const error = { message: `Couldn't find any valid configuration` };
    const sandbox = sinon.createSandbox();

    sandbox.stub(t.context.resourceLoader, 'loadResources').returns({
        connector: FakeConnector,
        formatters: [],
        hints: [],
        incompatible: [],
        missing: [],
        parsers: []
    });
    sandbox.stub(config.Configuration, 'getFilenameForDirectory').returns('/config/path');
    sandbox.stub(config.Configuration, 'loadConfigFile').returns({});
    sandbox.stub(config.Configuration, 'fromConfig').throws(error);
    sandbox.stub(askQuestion, 'default').resolves(false);

    const result = await analyze(actions);

    t.true((t.context.askQuestion.default as any).calledOnce);
    t.false(result);

    sandbox.restore();
});

test.serial('If configuration file exists, it should use it', async (t: TestContext) => {
    const sandbox = sinon.createSandbox();

    sandbox.stub(t.context.resourceLoader, 'loadResources').returns({
        connector: FakeConnector,
        formatters: [],
        hints: [],
        incompatible: [],
        missing: [],
        parsers: []
    });
    sandbox.stub(config.Configuration, 'getFilenameForDirectory').returns('/config/path');
    sandbox.stub(config.Configuration, 'loadConfigFile').returns({});
    sandbox.stub(config.Configuration, 'fromConfig').returns({});
    sandbox.stub(config.Configuration, 'validateHintsConfig').returns(validateHintsConfigResult);

    const customConfigOptions = ({ _: ['http://localhost'], config: 'configfile.cfg' } as CLIOptions);

    await analyze(customConfigOptions);

    t.true((config.Configuration.getFilenameForDirectory as any).notCalled);
    t.true((config.Configuration.loadConfigFile as any).args[0][0].endsWith('configfile.cfg'));

    sandbox.restore();
});

test.serial('If executeOn returns an error, it should exit with code 1 and call formatter.format', async (t: TestContext) => {
    const sandbox = sinon.createSandbox();

    class FakeFormatter implements IFormatter {
        public static called: boolean = false;
        public constructor() { }

        public format(problems: Problem[]) {
            FakeFormatter.called = true;
            console.log(problems);
        }
    }

    sandbox.stub(t.context.resourceLoader, 'loadResources').returns({
        connector: FakeConnector,
        formatters: [FakeFormatter],
        hints: [],
        incompatible: [],
        missing: [],
        parsers: []
    });

    sandbox.stub(config.Configuration, 'validateHintsConfig').returns(validateHintsConfigResult);

    const engineObj = new engineContainer.Engine();

    sandbox.stub(engineObj, 'formatters').get(() => {
        return [new FakeFormatter()];
    });
    sandbox.stub(engineObj, 'executeOn').resolves([{ severity: Severity.error }]);
    sandbox.stub(engineContainer, 'Engine').returns(engineObj);
    sandbox.stub(askQuestion, 'default').resolves(false);
    sandbox.stub(config.Configuration, 'getFilenameForDirectory').returns('/config/path');
    sandbox.stub(config.Configuration, 'fromConfig').returns({});
    sandbox.stub(config.Configuration, 'loadConfigFile').returns({});

    const exitCode = await analyze(actions);

    t.true(FakeFormatter.called);
    t.false(exitCode);

    sandbox.restore();
});

test.serial('If executeOn returns an error, it should call to spinner.fail()', async (t: TestContext) => {
    const sandbox = sinon.createSandbox();

    sandbox.stub(t.context.resourceLoader, 'loadResources').returns({
        connector: FakeConnector,
        formatters: [],
        hints: [],
        incompatible: [],
        missing: [],
        parsers: []
    });
    sandbox.stub(config.Configuration, 'getFilenameForDirectory').returns('/config/path');
    sandbox.stub(config.Configuration, 'fromConfig').returns({});
    sandbox.stub(config.Configuration, 'loadConfigFile').returns({});
    sandbox.stub(config.Configuration, 'validateHintsConfig').returns(validateHintsConfigResult);
    sandbox.stub(engineContainer.Engine.prototype, 'executeOn').resolves([{ severity: Severity.error }]);

    await analyze(actions);

    t.true(t.context.failSpy.calledOnce);

    sandbox.restore();
});

test.serial('If executeOn throws an exception, it should exit with code 1', async (t: TestContext) => {
    const sandbox = sinon.createSandbox();

    sandbox.stub(t.context.resourceLoader, 'loadResources').returns({
        connector: FakeConnector,
        formatters: [],
        hints: [],
        incompatible: [],
        missing: [],
        parsers: []
    });
    sandbox.stub(config.Configuration, 'getFilenameForDirectory').returns('/config/path');
    sandbox.stub(config.Configuration, 'loadConfigFile').returns({});
    sandbox.stub(config.Configuration, 'fromConfig').returns({});
    sandbox.stub(engineContainer.Engine.prototype, 'executeOn').throws(new Error());
    sandbox.stub(config.Configuration, 'validateHintsConfig').returns(validateHintsConfigResult);

    const result = await analyze(actions);

    t.false(result);

    sandbox.restore();
});

test.serial('If executeOn throws an exception, it should call to spinner.fail()', async (t: TestContext) => {
    const sandbox = sinon.createSandbox();

    sandbox.stub(t.context.resourceLoader, 'loadResources').returns({
        connector: FakeConnector,
        formatters: [],
        hints: [],
        incompatible: [],
        missing: [],
        parsers: []
    });
    sandbox.stub(config.Configuration, 'getFilenameForDirectory').returns('/config/path');
    sandbox.stub(config.Configuration, 'loadConfigFile').returns({});
    sandbox.stub(config.Configuration, 'fromConfig').returns({});
    sandbox.stub(engineContainer.Engine.prototype, 'executeOn').throws(new Error());
    sandbox.stub(config.Configuration, 'validateHintsConfig').returns(validateHintsConfigResult);

    await analyze(actions);

    t.true(t.context.failSpy.calledOnce);

    sandbox.restore();
});

test.serial('If executeOn returns no errors, it should exit with code 0 and call formatter.format', async (t: TestContext) => {
    const sandbox = sinon.createSandbox();

    class FakeFormatter implements IFormatter {
        public static called: boolean = false;
        public constructor() { }

        public format(problems: Problem[]) {
            FakeFormatter.called = true;
            console.log(problems);
        }
    }

    sandbox.stub(t.context.resourceLoader, 'loadResources').returns({
        connector: FakeConnector,
        formatters: [FakeFormatter],
        hints: [],
        incompatible: [],
        missing: [],
        parsers: []
    });

    const engineObj = new engineContainer.Engine();

    sandbox.stub(engineObj, 'formatters').get(() => {
        return [new FakeFormatter()];
    });
    sandbox.stub(engineObj, 'executeOn').resolves([{ severity: 0 }]);
    sandbox.stub(engineContainer, 'Engine').returns(engineObj);

    sandbox.stub(config.Configuration, 'getFilenameForDirectory').returns('/config/path');
    sandbox.stub(config.Configuration, 'loadConfigFile').returns({});
    sandbox.stub(config.Configuration, 'fromConfig').returns({});
    sandbox.stub(config.Configuration, 'validateHintsConfig').returns(validateHintsConfigResult);

    const exitCode = await analyze(actions);

    t.true(FakeFormatter.called);
    t.true(exitCode);

    sandbox.restore();
});

test.serial('If executeOn returns no errors, it should call to spinner.succeed()', async (t: TestContext) => {
    const sandbox = sinon.createSandbox();

    class FakeFormatter implements IFormatter {
        public static called: boolean = false;
        public constructor() { }

        public format(problems: Problem[]) {
            FakeFormatter.called = true;
            console.log(problems);
        }
    }

    sandbox.stub(t.context.resourceLoader, 'loadResources').returns({
        connector: FakeConnector,
        formatters: [FakeFormatter],
        hints: [],
        incompatible: [],
        missing: [],
        parsers: []
    });

    const engineObj = new engineContainer.Engine();

    sandbox.stub(engineObj, 'formatters').get(() => {
        return [new FakeFormatter()];
    });
    sandbox.stub(engineObj, 'executeOn').resolves([{ severity: 0 }]);
    sandbox.stub(engineContainer, 'Engine').returns(engineObj);

    sandbox.stub(config.Configuration, 'getFilenameForDirectory').returns('/config/path');
    sandbox.stub(config.Configuration, 'loadConfigFile').returns({});
    sandbox.stub(config.Configuration, 'fromConfig').returns({});
    sandbox.stub(config.Configuration, 'validateHintsConfig').returns(validateHintsConfigResult);

    await analyze(actions);

    t.true(t.context.succeedSpy.calledOnce);

    sandbox.restore();
});

test.serial('Event fetch::start should write a message in the spinner', async (t: TestContext) => {
    const sandbox = sinon.createSandbox();

    class FakeFormatter implements IFormatter {
        public static called: boolean = false;
        public constructor() { }

        public format(problems: Problem[]) {
            FakeFormatter.called = true;
            console.log(problems);
        }
    }

    sandbox.stub(t.context.resourceLoader, 'loadResources').returns({
        connector: FakeConnector,
        formatters: [FakeFormatter],
        hints: [],
        incompatible: [],
        missing: [],
        parsers: []
    });

    const engineObj = new engineContainer.Engine();

    sandbox.stub(engineObj, 'formatters').get(() => {
        return [new FakeFormatter()];
    });
    sandbox.stub(engineObj, 'executeOn').callsFake(async () => {
        await engine!.emitAsync('fetch::start', { resource: 'http://localhost/' });
    });
    sandbox.stub(engineContainer, 'Engine').returns(engineObj);
    sandbox.stub(config.Configuration, 'getFilenameForDirectory').returns('/config/path');
    sandbox.stub(config.Configuration, 'loadConfigFile').returns({});
    sandbox.stub(config.Configuration, 'fromConfig').returns({});
    sandbox.stub(config.Configuration, 'validateHintsConfig').returns(validateHintsConfigResult);

    await analyze(actions);

    t.is(spinner.text, 'Downloading http://localhost/');

    sandbox.restore();
});

test.serial('Event fetch::end should write a message in the spinner', async (t: TestContext) => {
    const sandbox = sinon.createSandbox();

    class FakeFormatter implements IFormatter {
        public static called: boolean = false;
        public constructor() { }

        public format(problems: Problem[]) {
            FakeFormatter.called = true;
            console.log(problems);
        }
    }

    sandbox.stub(t.context.resourceLoader, 'loadResources').returns({
        connector: FakeConnector,
        formatters: [FakeFormatter],
        hints: [],
        incompatible: [],
        missing: [],
        parsers: []
    });

    const engineObj = new engineContainer.Engine();

    sandbox.stub(engineObj, 'formatters').get(() => {
        return [new FakeFormatter()];
    });
    sandbox.stub(engineObj, 'executeOn').callsFake(async () => {
        await engine!.emitAsync('fetch::end::html', {
            element: null,
            request: {} as any,
            resource: 'http://localhost/',
            response: {} as any
        });
    });
    sandbox.stub(engineContainer, 'Engine').returns(engineObj);
    sandbox.stub(config.Configuration, 'getFilenameForDirectory').returns('/config/path');
    sandbox.stub(config.Configuration, 'loadConfigFile').returns({});
    sandbox.stub(config.Configuration, 'fromConfig').returns({});
    sandbox.stub(config.Configuration, 'validateHintsConfig').returns(validateHintsConfigResult);

    await analyze(actions);

    t.is(spinner.text, 'http://localhost/ downloaded');

    sandbox.restore();
});

test.serial('Event fetch::end::html should write a message in the spinner', async (t: TestContext) => {
    const sandbox = sinon.createSandbox();

    class FakeFormatter implements IFormatter {
        public static called: boolean = false;
        public constructor() { }

        public format(problems: Problem[]) {
            FakeFormatter.called = true;
            console.log(problems);
        }
    }

    sandbox.stub(t.context.resourceLoader, 'loadResources').returns({
        connector: FakeConnector,
        formatters: [FakeFormatter],
        hints: [],
        incompatible: [],
        missing: [],
        parsers: []
    });

    const engineObj = new engineContainer.Engine();

    sandbox.stub(engineObj, 'formatters').get(() => {
        return [new FakeFormatter()];
    });
    sandbox.stub(engineObj, 'executeOn').callsFake(async () => {
        await engine!.emitAsync('fetch::end::html', {
            element: null,
            request: {} as any,
            resource: 'http://localhost/',
            response: {} as any
        });
    });
    sandbox.stub(engineContainer, 'Engine').returns(engineObj);
    sandbox.stub(config.Configuration, 'getFilenameForDirectory').returns('/config/path');
    sandbox.stub(config.Configuration, 'loadConfigFile').returns({});
    sandbox.stub(config.Configuration, 'fromConfig').returns({});
    sandbox.stub(config.Configuration, 'validateHintsConfig').returns(validateHintsConfigResult);

    await analyze(actions);

    t.is(spinner.text, 'http://localhost/ downloaded');

    sandbox.restore();
});

test.serial('Event traverse::up should write a message in the spinner', async (t: TestContext) => {
    const sandbox = sinon.createSandbox();

    class FakeFormatter implements IFormatter {
        public static called: boolean = false;
        public constructor() { }

        public format(problems: Problem[]) {
            FakeFormatter.called = true;
            console.log(problems);
        }
    }

    sandbox.stub(t.context.resourceLoader, 'loadResources').returns({
        connector: FakeConnector,
        formatters: [FakeFormatter],
        hints: [],
        incompatible: [],
        missing: [],
        parsers: []
    });

    const engineObj = new engineContainer.Engine();

    sandbox.stub(engineObj, 'formatters').get(() => {
        return [new FakeFormatter()];
    });
    sandbox.stub(engineObj, 'executeOn').callsFake(async () => {
        await engine!.emitAsync('traverse::up', {
            element: {} as any,
            resource: 'http://localhost/'
        });
    });
    sandbox.stub(engineContainer, 'Engine').returns(engineObj);
    sandbox.stub(config.Configuration, 'getFilenameForDirectory').returns('/config/path');
    sandbox.stub(config.Configuration, 'loadConfigFile').returns({});
    sandbox.stub(config.Configuration, 'fromConfig').returns({});
    sandbox.stub(config.Configuration, 'validateHintsConfig').returns(validateHintsConfigResult);

    await analyze(actions);

    t.is(spinner.text, 'Traversing the DOM');

    sandbox.restore();
});

test.serial('Event traverse::end should write a message in the spinner', async (t: TestContext) => {
    const sandbox = sinon.createSandbox();

    class FakeFormatter implements IFormatter {
        public static called: boolean = false;
        public constructor() { }

        public format(problems: Problem[]) {
            FakeFormatter.called = true;
            console.log(problems);
        }
    }

    sandbox.stub(t.context.resourceLoader, 'loadResources').returns({
        connector: FakeConnector,
        formatters: [FakeFormatter],
        hints: [],
        incompatible: [],
        missing: [],
        parsers: []
    });

    const engineObj = new engineContainer.Engine();

    sandbox.stub(engineObj, 'formatters').get(() => {
        return [new FakeFormatter()];
    });
    sandbox.stub(engineObj, 'executeOn').callsFake(async () => {
        await engine!.emitAsync('traverse::end', { resource: 'http://localhost/' });
    });
    sandbox.stub(engineContainer, 'Engine').returns(engineObj);
    sandbox.stub(config.Configuration, 'getFilenameForDirectory').returns('/config/path');
    sandbox.stub(config.Configuration, 'loadConfigFile').returns({});
    sandbox.stub(config.Configuration, 'fromConfig').returns({});
    sandbox.stub(config.Configuration, 'validateHintsConfig').returns(validateHintsConfigResult);

    await analyze(actions);

    t.is(spinner.text, 'Traversing finished');

    sandbox.restore();
});

test.serial('Event scan::end should write a message in the spinner', async (t: TestContext) => {
    const sandbox = sinon.createSandbox();

    class FakeFormatter implements IFormatter {
        public static called: boolean = false;
        public constructor() { }

        public format(problems: Problem[]) {
            FakeFormatter.called = true;
            console.log(problems);
        }
    }

    sandbox.stub(t.context.resourceLoader, 'loadResources').returns({
        connector: FakeConnector,
        formatters: [FakeFormatter],
        hints: [],
        incompatible: [],
        missing: [],
        parsers: []
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
    sandbox.stub(config.Configuration, 'loadConfigFile').returns({});
    sandbox.stub(config.Configuration, 'fromConfig').returns({});
    sandbox.stub(config.Configuration, 'validateHintsConfig').returns(validateHintsConfigResult);

    await analyze(actions);

    t.is(spinner.text, 'Finishing...');

    sandbox.restore();
});

test.serial('If no sites are defined, it should return false', async (t: TestContext) => {
    const result = await analyze({ _: [] } as any);

    t.false(result);
});
