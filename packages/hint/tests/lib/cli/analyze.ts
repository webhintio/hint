import { URL } from 'url';

import { EventEmitter2 as EventEmitter } from 'eventemitter2';
import * as proxyquire from 'proxyquire';
import * as sinon from 'sinon';
import anyTest, { TestInterface, ExecutionContext } from 'ava';

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

type AskQuestion = {
    default: () => any;
};

type Logger = {
    error: (text: string) => any;
    log: (text: string) => any;
};

type Configuration = {
    fromConfig: (config: UserConfig | null) => {};
    getFilenameForDirectory: () => string | null;
    loadConfigFile: (path: string) => {};
    validateHintsConfig: () => ValidateHintsConfigResult | null;
};

type Config = {
    Configuration: Configuration;
};

type IEnginePrototype = {
    formatters: any[];
    close(): void;
    emitAsync(eventName: string, data: any): Promise<any>;
    executeOn(): Promise<any>;
};

interface IEngine {
    new(): IEnginePrototype;
}

type EngineContainer = {
    Engine: IEngine;
};

type Spinner = {
    fail: () => void;
    start: () => void;
    succeed: () => void;
    text: string;
};

type Ora = {
    default: () => Spinner;
};

type AnalyzeContext = {
    askQuestion: AskQuestion;
    config: Config;
    engineContainer: EngineContainer;
    errorSpy: sinon.SinonSpy<[string]>;
    failSpy: sinon.SinonSpy<[]>;
    logger: Logger;
    logSpy: sinon.SinonSpy<[string]>;
    ora: Ora;
    resourceLoader: ResourceLoader;
    sandbox: sinon.SinonSandbox;
    spinner: Spinner;
    startSpy: sinon.SinonSpy<[]>;
    succeedSpy: sinon.SinonSpy<[]>;
};

const test = anyTest as TestInterface<AnalyzeContext>;
const validateHintsConfigResult: ValidateHintsConfigResult = { invalid: [] };
const appinsight = {
    disable() { },
    enable() { },
    isConfigured() { },
    isEnabled() { },
    trackEvent() { }
};

// import { default as analyze, engine } from '../../../src/lib/cli/analyze';

const initContext = (t: ExecutionContext<AnalyzeContext>) => {
    const sandbox = sinon.createSandbox();
    const spinner = {
        fail() { },
        start() { },
        succeed() { },
        text: ''
    };

    t.context.config = {
        Configuration: {
            fromConfig(config: UserConfig | null) {
                return {};
            },
            getFilenameForDirectory(): string | null {
                return '';
            },
            loadConfigFile(path: string) {
                return {};
            },
            validateHintsConfig(): ValidateHintsConfigResult | null {
                return null;
            }
        }
    };

    t.context.logger = {
        error(text: string) { },
        log(text: string) { }
    };
    t.context.logSpy = sandbox.spy(t.context.logger, 'log');
    t.context.errorSpy = sandbox.spy(t.context.logger, 'error');
    t.context.spinner = spinner;
    t.context.ora = {
        default() {
            return spinner;
        }
    };
    t.context.startSpy = sandbox.spy(spinner, 'start');
    t.context.failSpy = sandbox.spy(spinner, 'fail');
    t.context.succeedSpy = sandbox.spy(spinner, 'succeed');
    t.context.engineContainer = {
        Engine: class Engine extends EventEmitter {
            public get formatters() {
                return [];
            }

            public close() { }
            public executeOn() {
                return Promise.resolve();
            }
        }
    };

    t.context.askQuestion = { default() { } };
    t.context.resourceLoader = {
        loadResources() {
            return null;
        }
    };
    t.context.sandbox = sandbox;
};

const loadScript = (context: AnalyzeContext) => {
    const script = proxyquire('../../../src/lib/cli/analyze', {
        '../config': context.config,
        '../engine': context.engineContainer,
        '../utils/app-insights': appinsight,
        '../utils/logging': context.logger,
        '../utils/misc/ask-question': context.askQuestion,
        '../utils/resource-loader': context.resourceLoader,
        ora: context.ora
    });

    return script.default;
};

test.beforeEach(initContext);

test.afterEach.always((t) => {
    t.context.sandbox.restore();
});

test('If config is not defined, it should get the config file from the directory process.cwd()', async (t) => {
    const sandbox = sinon.createSandbox();

    const engineObj = new t.context.engineContainer.Engine();

    sandbox.stub(engineObj, 'executeOn').resolves([]);
    sandbox.stub(t.context.engineContainer, 'Engine').returns(engineObj);
    sandbox.stub(t.context.resourceLoader, 'loadResources').returns({
        connector: FakeConnector,
        formatters: [],
        hints: [],
        incompatible: [],
        missing: [],
        parsers: []
    });
    const getFilenameForDirectoryStub = sandbox.stub(t.context.config.Configuration, 'getFilenameForDirectory').returns('/config/path');

    sandbox.stub(t.context.config.Configuration, 'fromConfig').returns({});
    sandbox.stub(t.context.config.Configuration, 'loadConfigFile')
        .onFirstCall()
        .returns({});
    sandbox.stub(t.context.config.Configuration, 'validateHintsConfig').returns(validateHintsConfigResult);

    const analyze = loadScript(t.context);

    await analyze(actions);

    t.true(getFilenameForDirectoryStub.called);
});

test('If config file does not exist, it should use `web-recommended` as default configuration', async (t) => {
    const sandbox = sinon.createSandbox();

    sandbox.stub(t.context.resourceLoader, 'loadResources').returns({
        connector: FakeConnector,
        formatters: [],
        hints: [],
        incompatible: [],
        missing: [],
        parsers: []
    });
    sandbox.stub(t.context.config.Configuration, 'getFilenameForDirectory')
        .onFirstCall()
        .returns(null);

    sandbox.stub(t.context.config.Configuration, 'loadConfigFile').returns({});
    const fromConfigStub = sandbox.stub(t.context.config.Configuration, 'fromConfig').returns({});

    sandbox.stub(t.context.config.Configuration, 'validateHintsConfig').returns(validateHintsConfigResult);

    sandbox.stub(t.context.askQuestion, 'default').resolves(false);

    const analyze = loadScript(t.context);

    await analyze(actions);

    t.true(fromConfigStub.calledOnce);
    t.deepEqual(fromConfigStub.args[0][0], { extends: ['web-recommended'] });
});

test('If config file is an invalid JSON, it should ask to use the default configuration', async (t) => {
    const sandbox = sinon.createSandbox();

    sandbox.stub(t.context.resourceLoader, 'loadResources').returns({
        connector: FakeConnector,
        formatters: [],
        hints: [],
        incompatible: [],
        missing: [],
        parsers: []
    });
    sandbox.stub(t.context.config.Configuration, 'getFilenameForDirectory')
        .onFirstCall()
        .returns('config/path');

    sandbox.stub(t.context.config.Configuration, 'loadConfigFile').throws(new Error('Unexpected end of JSON input'));
    sandbox.stub(t.context.config.Configuration, 'validateHintsConfig').returns(validateHintsConfigResult);

    const configurationFromConfigStub = sandbox.stub(t.context.config.Configuration, 'fromConfig').returns({});
    const askQuestionDefaultStub = sandbox.stub(t.context.askQuestion, 'default').resolves(true);

    const analyze = loadScript(t.context);

    await analyze(actions);

    t.true(configurationFromConfigStub.calledOnce);
    t.deepEqual(configurationFromConfigStub.args[0][0], { extends: ['web-recommended'] });
    t.true(askQuestionDefaultStub.calledOnce);
});

test('If config file has an invalid configuration, it should ask to use the default configuration', async (t) => {
    const sandbox = sinon.createSandbox();

    sandbox.stub(t.context.resourceLoader, 'loadResources').returns({
        connector: FakeConnector,
        formatters: [],
        hints: [],
        incompatible: [],
        missing: [],
        parsers: []
    });
    sandbox.stub(t.context.config.Configuration, 'getFilenameForDirectory').returns('/config/path');
    sandbox.stub(t.context.config.Configuration, 'loadConfigFile').throws(new Error('Unexpected end of JSON input'));
    sandbox.stub(t.context.config.Configuration, 'validateHintsConfig').returns(validateHintsConfigResult);
    const configurationFromConfigStub = sandbox.stub(t.context.config.Configuration, 'fromConfig')
        .onSecondCall()
        .returns({});
    const askQuestionDefaultStub = sandbox.stub(t.context.askQuestion, 'default').resolves(true);

    const analyze = loadScript(t.context);

    await analyze(actions);

    t.true(askQuestionDefaultStub.calledOnce);
    t.true(configurationFromConfigStub.calledOnce);
    t.deepEqual(configurationFromConfigStub.args[0][0], { extends: ['web-recommended'] });
});

test('If config file is invalid and user refuses to use the default or to create a configuration file, it should exit with code 1', async (t) => {
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
    sandbox.stub(t.context.config.Configuration, 'getFilenameForDirectory').returns('/config/path');
    sandbox.stub(t.context.config.Configuration, 'loadConfigFile').returns({});
    sandbox.stub(t.context.config.Configuration, 'fromConfig').throws(error);
    const askQuestionDefaultStub = sandbox.stub(t.context.askQuestion, 'default').resolves(false);

    const analyze = loadScript(t.context);

    const result = await analyze(actions);

    t.true(askQuestionDefaultStub.calledOnce);
    t.false(result);
});

test('If configuration file exists, it should use it', async (t) => {
    const sandbox = sinon.createSandbox();

    sandbox.stub(t.context.resourceLoader, 'loadResources').returns({
        connector: FakeConnector,
        formatters: [],
        hints: [],
        incompatible: [],
        missing: [],
        parsers: []
    });
    sandbox.stub(t.context.config.Configuration, 'fromConfig').returns({});
    sandbox.stub(t.context.config.Configuration, 'validateHintsConfig').returns(validateHintsConfigResult);
    const configurationGetFilenameForDirectoryStub = sandbox.stub(t.context.config.Configuration, 'getFilenameForDirectory').returns('/config/path');
    const configurationLoadConfigFileStub = sandbox.stub(t.context.config.Configuration, 'loadConfigFile').returns({});

    const customConfigOptions = ({ _: ['http://localhost'], config: 'configfile.cfg' } as CLIOptions);

    const analyze = loadScript(t.context);

    await analyze(customConfigOptions);

    t.true(configurationGetFilenameForDirectoryStub.notCalled);
    t.true(configurationLoadConfigFileStub.args[0][0].endsWith('configfile.cfg'));
});

test('If executeOn returns an error, it should exit with code 1 and call formatter.format', async (t) => {
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

    sandbox.stub(t.context.config.Configuration, 'validateHintsConfig').returns(validateHintsConfigResult);

    const engineObj = new t.context.engineContainer.Engine();

    sandbox.stub(engineObj, 'formatters').get(() => {
        return [new FakeFormatter()];
    });
    sandbox.stub(engineObj, 'executeOn').resolves([{ severity: Severity.error }]);
    sandbox.stub(t.context.engineContainer, 'Engine').returns(engineObj);
    sandbox.stub(t.context.askQuestion, 'default').resolves(false);
    sandbox.stub(t.context.config.Configuration, 'getFilenameForDirectory').returns('/config/path');
    sandbox.stub(t.context.config.Configuration, 'fromConfig').returns({});
    sandbox.stub(t.context.config.Configuration, 'loadConfigFile').returns({});

    const analyze = loadScript(t.context);
    const exitCode = await analyze(actions);

    t.true(FakeFormatter.called);
    t.false(exitCode);
});

test('If executeOn returns an error, it should call to spinner.fail()', async (t) => {
    const sandbox = sinon.createSandbox();

    sandbox.stub(t.context.resourceLoader, 'loadResources').returns({
        connector: FakeConnector,
        formatters: [],
        hints: [],
        incompatible: [],
        missing: [],
        parsers: []
    });
    sandbox.stub(t.context.config.Configuration, 'getFilenameForDirectory').returns('/config/path');
    sandbox.stub(t.context.config.Configuration, 'fromConfig').returns({});
    sandbox.stub(t.context.config.Configuration, 'loadConfigFile').returns({});
    sandbox.stub(t.context.config.Configuration, 'validateHintsConfig').returns(validateHintsConfigResult);
    sandbox.stub((t.context.engineContainer.Engine.prototype as IEnginePrototype), 'executeOn').resolves([{ severity: Severity.error }]);

    const analyze = loadScript(t.context);

    await analyze(actions);

    t.true(t.context.failSpy.calledOnce);
});

test('If executeOn throws an exception, it should exit with code 1', async (t) => {
    const sandbox = sinon.createSandbox();

    sandbox.stub(t.context.resourceLoader, 'loadResources').returns({
        connector: FakeConnector,
        formatters: [],
        hints: [],
        incompatible: [],
        missing: [],
        parsers: []
    });
    sandbox.stub(t.context.config.Configuration, 'getFilenameForDirectory').returns('/config/path');
    sandbox.stub(t.context.config.Configuration, 'loadConfigFile').returns({});
    sandbox.stub(t.context.config.Configuration, 'fromConfig').returns({});
    sandbox.stub(t.context.engineContainer.Engine.prototype, 'executeOn').throws(new Error());
    sandbox.stub(t.context.config.Configuration, 'validateHintsConfig').returns(validateHintsConfigResult);

    const analyze = loadScript(t.context);
    const result = await analyze(actions);

    t.false(result);
});

test('If executeOn throws an exception, it should call to spinner.fail()', async (t) => {
    const sandbox = sinon.createSandbox();

    sandbox.stub(t.context.resourceLoader, 'loadResources').returns({
        connector: FakeConnector,
        formatters: [],
        hints: [],
        incompatible: [],
        missing: [],
        parsers: []
    });
    sandbox.stub(t.context.config.Configuration, 'getFilenameForDirectory').returns('/config/path');
    sandbox.stub(t.context.config.Configuration, 'loadConfigFile').returns({});
    sandbox.stub(t.context.config.Configuration, 'fromConfig').returns({});
    sandbox.stub(t.context.engineContainer.Engine.prototype, 'executeOn').throws(new Error());
    sandbox.stub(t.context.config.Configuration, 'validateHintsConfig').returns(validateHintsConfigResult);

    const analyze = loadScript(t.context);

    await analyze(actions);

    t.true(t.context.failSpy.calledOnce);
});

test('If executeOn returns no errors, it should exit with code 0 and call formatter.format', async (t) => {
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

    const engineObj = new t.context.engineContainer.Engine();

    sandbox.stub(engineObj, 'formatters').get(() => {
        return [new FakeFormatter()];
    });
    sandbox.stub(engineObj, 'executeOn').resolves([{ severity: 0 }]);
    sandbox.stub(t.context.engineContainer, 'Engine').returns(engineObj);

    sandbox.stub(t.context.config.Configuration, 'getFilenameForDirectory').returns('/config/path');
    sandbox.stub(t.context.config.Configuration, 'loadConfigFile').returns({});
    sandbox.stub(t.context.config.Configuration, 'fromConfig').returns({});
    sandbox.stub(t.context.config.Configuration, 'validateHintsConfig').returns(validateHintsConfigResult);

    const analyze = loadScript(t.context);
    const exitCode = await analyze(actions);

    t.true(FakeFormatter.called);
    t.true(exitCode);
});

test('If executeOn returns no errors, it should call to spinner.succeed()', async (t) => {
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

    const engineObj = new t.context.engineContainer.Engine();

    sandbox.stub(engineObj, 'formatters').get(() => {
        return [new FakeFormatter()];
    });
    sandbox.stub(engineObj, 'executeOn').resolves([{ severity: 0 }]);
    sandbox.stub(t.context.engineContainer, 'Engine').returns(engineObj);

    sandbox.stub(t.context.config.Configuration, 'getFilenameForDirectory').returns('/config/path');
    sandbox.stub(t.context.config.Configuration, 'loadConfigFile').returns({});
    sandbox.stub(t.context.config.Configuration, 'fromConfig').returns({});
    sandbox.stub(t.context.config.Configuration, 'validateHintsConfig').returns(validateHintsConfigResult);

    const analyze = loadScript(t.context);

    await analyze(actions);

    t.true(t.context.succeedSpy.calledOnce);
});

test('Event fetch::start should write a message in the spinner', async (t) => {
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

    const engineObj = new t.context.engineContainer.Engine();

    sandbox.stub(engineObj, 'formatters').get(() => {
        return [new FakeFormatter()];
    });
    sandbox.stub(engineObj, 'executeOn').callsFake(async () => {
        await engineObj.emitAsync('fetch::start', { resource: 'http://localhost/' });
    });
    sandbox.stub(t.context.engineContainer, 'Engine').returns(engineObj);
    sandbox.stub(t.context.config.Configuration, 'getFilenameForDirectory').returns('/config/path');
    sandbox.stub(t.context.config.Configuration, 'loadConfigFile').returns({});
    sandbox.stub(t.context.config.Configuration, 'fromConfig').returns({});
    sandbox.stub(t.context.config.Configuration, 'validateHintsConfig').returns(validateHintsConfigResult);

    const analyze = loadScript(t.context);

    await analyze(actions);

    t.is(t.context.spinner.text, 'Downloading http://localhost/');
});

test('Event fetch::end should write a message in the spinner', async (t) => {
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

    const engineObj = new t.context.engineContainer.Engine();

    sandbox.stub(engineObj, 'formatters').get(() => {
        return [new FakeFormatter()];
    });
    sandbox.stub(engineObj, 'executeOn').callsFake(async () => {
        await engineObj.emitAsync('fetch::end::html', {
            element: null,
            request: {} as any,
            resource: 'http://localhost/',
            response: {} as any
        });
    });
    sandbox.stub(t.context.engineContainer, 'Engine').returns(engineObj);
    sandbox.stub(t.context.config.Configuration, 'getFilenameForDirectory').returns('/config/path');
    sandbox.stub(t.context.config.Configuration, 'loadConfigFile').returns({});
    sandbox.stub(t.context.config.Configuration, 'fromConfig').returns({});
    sandbox.stub(t.context.config.Configuration, 'validateHintsConfig').returns(validateHintsConfigResult);

    const analyze = loadScript(t.context);

    await analyze(actions);

    t.is(t.context.spinner.text, 'http://localhost/ downloaded');
});

test('Event fetch::end::html should write a message in the spinner', async (t) => {
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

    const engineObj = new t.context.engineContainer.Engine();

    sandbox.stub(engineObj, 'formatters').get(() => {
        return [new FakeFormatter()];
    });
    sandbox.stub(engineObj, 'executeOn').callsFake(async () => {
        await engineObj.emitAsync('fetch::end::html', {
            element: null,
            request: {} as any,
            resource: 'http://localhost/',
            response: {} as any
        });
    });
    sandbox.stub(t.context.engineContainer, 'Engine').returns(engineObj);
    sandbox.stub(t.context.config.Configuration, 'getFilenameForDirectory').returns('/config/path');
    sandbox.stub(t.context.config.Configuration, 'loadConfigFile').returns({});
    sandbox.stub(t.context.config.Configuration, 'fromConfig').returns({});
    sandbox.stub(t.context.config.Configuration, 'validateHintsConfig').returns(validateHintsConfigResult);

    const analyze = loadScript(t.context);

    await analyze(actions);

    t.is(t.context.spinner.text, 'http://localhost/ downloaded');
});

test('Event traverse::up should write a message in the spinner', async (t) => {
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

    const engineObj = new t.context.engineContainer.Engine();

    sandbox.stub(engineObj, 'formatters').get(() => {
        return [new FakeFormatter()];
    });
    sandbox.stub(engineObj, 'executeOn').callsFake(async () => {
        await engineObj.emitAsync('traverse::up', {
            element: {} as any,
            resource: 'http://localhost/'
        });
    });
    sandbox.stub(t.context.engineContainer, 'Engine').returns(engineObj);
    sandbox.stub(t.context.config.Configuration, 'getFilenameForDirectory').returns('/config/path');
    sandbox.stub(t.context.config.Configuration, 'loadConfigFile').returns({});
    sandbox.stub(t.context.config.Configuration, 'fromConfig').returns({});
    sandbox.stub(t.context.config.Configuration, 'validateHintsConfig').returns(validateHintsConfigResult);

    const analyze = loadScript(t.context);

    await analyze(actions);

    t.is(t.context.spinner.text, 'Traversing the DOM');
});

test('Event traverse::end should write a message in the spinner', async (t) => {
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

    const engineObj = new t.context.engineContainer.Engine();

    sandbox.stub(engineObj, 'formatters').get(() => {
        return [new FakeFormatter()];
    });
    sandbox.stub(engineObj, 'executeOn').callsFake(async () => {
        await engineObj.emitAsync('traverse::end', { resource: 'http://localhost/' });
    });
    sandbox.stub(t.context.engineContainer, 'Engine').returns(engineObj);
    sandbox.stub(t.context.config.Configuration, 'getFilenameForDirectory').returns('/config/path');
    sandbox.stub(t.context.config.Configuration, 'loadConfigFile').returns({});
    sandbox.stub(t.context.config.Configuration, 'fromConfig').returns({});
    sandbox.stub(t.context.config.Configuration, 'validateHintsConfig').returns(validateHintsConfigResult);

    const analyze = loadScript(t.context);

    await analyze(actions);

    t.is(t.context.spinner.text, 'Traversing finished');
});

test('Event scan::end should write a message in the spinner', async (t) => {
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

    const engineObj = new t.context.engineContainer.Engine();

    sandbox.stub(engineObj, 'formatters').get(() => {
        return [new FakeFormatter()];
    });
    sandbox.stub(engineObj, 'executeOn').callsFake(async () => {
        await engineObj.emitAsync('scan::end', { resource: 'http://localhost/' });
    });
    sandbox.stub(t.context.engineContainer, 'Engine').returns(engineObj);
    sandbox.stub(t.context.config.Configuration, 'getFilenameForDirectory').returns('/config/path');
    sandbox.stub(t.context.config.Configuration, 'loadConfigFile').returns({});
    sandbox.stub(t.context.config.Configuration, 'fromConfig').returns({});
    sandbox.stub(t.context.config.Configuration, 'validateHintsConfig').returns(validateHintsConfigResult);

    const analyze = loadScript(t.context);

    await analyze(actions);

    t.is(t.context.spinner.text, 'Finishing...');
});

test('If no sites are defined, it should return false', async (t) => {
    const analyze = loadScript(t.context);
    const result = await analyze({ _: [] } as any);

    t.false(result);
});
