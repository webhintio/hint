import { URL } from 'url';

import anyTest, { TestInterface } from 'ava';
import * as proxyquire from 'proxyquire';
import * as sinon from 'sinon';

import {
    AnalyzerError,
    ConnectorConfig,
    HintResources,
    IFetchOptions,
    IFormatter,
    UserConfig
} from '../../src/lib/types';
import { AnalyzerErrorStatus } from '../../src/lib/enums/error-status';
import { Problem } from '@hint/utils/dist/src/types/problems';

type Logger = {
    warn: () => void;
};

type Configuration = {
    connector: ConnectorConfig;
    fromConfig: () => Configuration;
    getFilenameForDirectory: (directory: string) => string;
    loadConfigFile: (filePath: string) => UserConfig;
    validateConnectorConfig: () => boolean;
    validateHintsConfig: () => { invalid: string[]; valid: string[] };
};

type ResourceLoader = {
    loadResources: () => HintResources;
};

type FS = {
    cwd: () => string;
    isFile: () => boolean;
};

type AnalyzerContext = {
    configuration: { Configuration: Configuration };
    fs: FS;
    logger: Logger;
    resourceLoader: ResourceLoader;
    sandbox: sinon.SinonSandbox;
};

const test = anyTest as TestInterface<AnalyzerContext>;

const loadScript = (context: AnalyzerContext) => {
    const engine = {
        close() { },
        executeOn(url: URL, options?: IFetchOptions): Promise<Problem[]> {
            return Promise.resolve([]);
        },
        on(eventName: string, listener: () => {}) { },
        prependAny() { }
    };

    const engineWrapper = {
        Engine: function Engine() {
            return engine;
        }
    };

    const script = proxyquire('../../src/lib/analyzer', {
        './config': context.configuration,
        './engine': engineWrapper,
        './utils/resource-loader': context.resourceLoader,
        '@hint/utils': {
            fs: context.fs,
            logger: context.logger
        }
    });

    return { Analyzer: script.Analyzer, engine };
};

test.beforeEach((t) => {
    t.context.configuration = {
        Configuration: {
            connector: { name: 'chrome' },
            fromConfig() {
                return {} as any;
            },
            getFilenameForDirectory(directory: string): string {
                return '';
            },
            loadConfigFile(filePath: string): UserConfig {
                return {};
            },
            validateConnectorConfig(): boolean {
                return true;
            },
            validateHintsConfig() {
                return {} as any;
            }
        }
    };

    t.context.logger = { warn() { } };

    t.context.resourceLoader = {
        loadResources: () => {
            return {} as any;
        }
    };

    t.context.fs = {
        cwd() {
            return '';
        },
        isFile() {
            return false;
        }
    };

    t.context.sandbox = sinon.createSandbox();
});

test(`If userConfig not defined, it should return an error with the status 'ConfigurationError'`, (t) => {
    const { Analyzer } = loadScript(t.context);

    const error = t.throws<AnalyzerError>(() => {
        Analyzer.create();
    });

    t.is(error.status, AnalyzerErrorStatus.ConfigurationError);
});

test(`If there is an error loading the configuration, it should return an error with the status 'ConfigurationError'`, (t) => {
    const { Analyzer } = loadScript(t.context);
    const sandbox = t.context.sandbox;

    const fromConfigStub = sandbox.stub(t.context.configuration.Configuration, 'fromConfig').throws(new Error());

    const error = t.throws<AnalyzerError>(() => {
        Analyzer.create({});
    });

    t.true(fromConfigStub.calledOnce);
    t.is(error.status, AnalyzerErrorStatus.ConfigurationError);
});

test(`If there is any missing or incompatible resource, it should return an error with the status 'ResourceError'`, (t) => {
    const { Analyzer } = loadScript(t.context);
    const sandbox = t.context.sandbox;

    const fromConfigStub = sandbox.stub(t.context.configuration.Configuration, 'fromConfig').returns(t.context.configuration.Configuration);
    const resourceLoaderStub = sandbox.stub(t.context.resourceLoader, 'loadResources').returns({
        connector: null,
        formatters: [],
        hints: [],
        incompatible: ['hint1'],
        missing: ['hint2'],
        parsers: []
    });

    const error = t.throws<AnalyzerError>(() => {
        Analyzer.create({});
    });

    t.true(resourceLoaderStub.calledOnce);
    t.true(fromConfigStub.calledOnce);
    t.is(error.status, AnalyzerErrorStatus.ResourceError);
});

test(`If the connector is not configured correctly, it should return an error with the status 'ConnectorError'`, (t) => {
    const { Analyzer } = loadScript(t.context);
    const sandbox = t.context.sandbox;

    const fromConfigStub = sandbox.stub(t.context.configuration.Configuration, 'fromConfig').returns(t.context.configuration.Configuration);
    const resourceLoaderStub = sandbox.stub(t.context.resourceLoader, 'loadResources').returns({
        connector: null,
        formatters: [],
        hints: [],
        incompatible: [],
        missing: [],
        parsers: []
    });
    const validateConnectorConfigStub = sandbox.stub(t.context.configuration.Configuration, 'validateConnectorConfig').returns(false);

    const error = t.throws<AnalyzerError>(() => {
        Analyzer.create({});
    });

    t.true(validateConnectorConfigStub.calledOnce);
    t.true(resourceLoaderStub.calledOnce);
    t.true(fromConfigStub.calledOnce);
    t.is(error.status, AnalyzerErrorStatus.ConnectorError);
});

test(`If there is any invalid hint, it should return an error with the status 'HintError'`, (t) => {
    const { Analyzer } = loadScript(t.context);
    const sandbox = t.context.sandbox;

    const fromConfigStub = sandbox.stub(t.context.configuration.Configuration, 'fromConfig').returns(t.context.configuration.Configuration);
    const resourceLoaderStub = sandbox.stub(t.context.resourceLoader, 'loadResources').returns({
        connector: null,
        formatters: [],
        hints: [],
        incompatible: [],
        missing: [],
        parsers: []
    });
    const validateHintsConfigStub = sandbox.stub(t.context.configuration.Configuration, 'validateHintsConfig').returns({
        invalid: ['hint1', 'hint2'],
        valid: []
    });

    const error = t.throws<AnalyzerError>(() => {
        Analyzer.create({});
    });

    t.true(validateHintsConfigStub.calledOnce);
    t.true(resourceLoaderStub.calledOnce);
    t.true(fromConfigStub.calledOnce);
    t.is(error.status, AnalyzerErrorStatus.HintError);
});

test('If everything is valid, it will create an instance of the class Analyzer', (t) => {
    const { Analyzer } = loadScript(t.context);
    const sandbox = t.context.sandbox;

    const fromConfigStub = sandbox.stub(t.context.configuration.Configuration, 'fromConfig').returns(t.context.configuration.Configuration);
    const resourceLoaderStub = sandbox.stub(t.context.resourceLoader, 'loadResources').returns({
        connector: null,
        formatters: [],
        hints: [],
        incompatible: [],
        missing: [],
        parsers: []
    });
    const validateHintsConfigStub = sandbox.stub(t.context.configuration.Configuration, 'validateHintsConfig').returns({
        invalid: [],
        valid: []
    });

    Analyzer.create({});

    t.true(validateHintsConfigStub.calledOnce);
    t.true(resourceLoaderStub.calledOnce);
    t.true(fromConfigStub.calledOnce);
});

test('If the target is an string, it will analyze the url', async (t) => {
    const sandbox = t.context.sandbox;

    const { Analyzer, engine } = loadScript(t.context);

    const engineExecuteOnStub = sandbox.stub(engine, 'executeOn').resolves([]);
    const engineCloseStub = sandbox.stub(engine, 'close').resolves();
    /*
     * Analyzer constructor is private, but for testing it
     * is easy if we call the constructor direcly.
     */
    const webhint = new Analyzer({}, {}, []);

    await webhint.analyze('https://example.com/');

    t.true(engineExecuteOnStub.calledOnce);
    t.true(engineCloseStub.calledOnce);
    t.is(engineExecuteOnStub.args[0][0].href, 'https://example.com/');
});

test('If the target is an URL, it will analyze it', async (t) => {
    const sandbox = t.context.sandbox;

    const { Analyzer, engine } = loadScript(t.context);

    const engineExecuteOnStub = sandbox.stub(engine, 'executeOn').resolves([]);
    const engineCloseStub = sandbox.stub(engine, 'close').resolves();
    const webhint = new Analyzer({}, {}, []);

    await webhint.analyze(new URL('https://example.com/'));

    t.true(engineExecuteOnStub.calledOnce);
    t.true(engineCloseStub.calledOnce);
    t.is(engineExecuteOnStub.args[0][0].href, 'https://example.com/');
});

test('.close() will close the engine', async (t) => {
    const sandbox = t.context.sandbox;

    const { Analyzer, engine } = loadScript(t.context);

    const engineExecuteOnStub = sandbox.stub(engine, 'executeOn').resolves([]);
    const engineCloseStub = sandbox.stub(engine, 'close').resolves();
    const webhint = new Analyzer({}, {}, []);

    await webhint.analyze(new URL('https://example.com/'));

    await webhint.close();

    t.true(engineExecuteOnStub.calledOnce);
    /*
     * Engine close will be called twice, one when the analysis finish
     * and one more time when we call close.
     * `close` is meant to be called when there is an unhandled exception
     * otherwise `analyze` is going to capture the exception and call
     * to `engince.close()`.
     */
    t.true(engineCloseStub.calledTwice);
    t.is(engineExecuteOnStub.args[0][0].href, 'https://example.com/');
});

test('If the target is a Target with a string url, it will analyze it', async (t) => {
    const sandbox = t.context.sandbox;

    const { Analyzer, engine } = loadScript(t.context);

    const engineExecuteOnStub = sandbox.stub(engine, 'executeOn').resolves([]);
    const engineCloseStub = sandbox.stub(engine, 'close').resolves();
    const webhint = new Analyzer({}, {}, []);

    await webhint.analyze({ url: 'https://example.com/' });

    t.true(engineExecuteOnStub.calledOnce);
    t.true(engineCloseStub.calledOnce);
    t.is(engineExecuteOnStub.args[0][0].href, 'https://example.com/');
});

test('If the target is a Target with a URL, it will analyze it', async (t) => {
    const sandbox = t.context.sandbox;

    const { Analyzer, engine } = loadScript(t.context);

    const engineExecuteOnStub = sandbox.stub(engine, 'executeOn').resolves([]);
    const engineCloseStub = sandbox.stub(engine, 'close').resolves();
    const webhint = new Analyzer({}, {}, []);

    await webhint.analyze({ url: new URL('https://example.com/') });

    t.true(engineExecuteOnStub.calledOnce);
    t.true(engineCloseStub.calledOnce);
    t.is(engineExecuteOnStub.args[0][0].href, 'https://example.com/');
});

test('If the target is an Array of strings, it will analyze all of them', async (t) => {
    const sandbox = t.context.sandbox;

    const { Analyzer, engine } = loadScript(t.context);

    const engineExecuteOnStub = sandbox.stub(engine, 'executeOn').resolves([]);
    const engineCloseStub = sandbox.stub(engine, 'close').resolves();
    const webhint = new Analyzer({}, {}, []);

    await webhint.analyze(['https://example.com/', 'https://example2.com/', 'https://example3.com/']);

    t.true(engineExecuteOnStub.calledThrice);
    t.true(engineCloseStub.calledThrice);
    t.is(engineExecuteOnStub.args[0][0].href, 'https://example.com/');
    t.is(engineExecuteOnStub.args[1][0].href, 'https://example2.com/');
    t.is(engineExecuteOnStub.args[2][0].href, 'https://example3.com/');
});

test('If the target is an Array of URLs, it will analyze all of them', async (t) => {
    const sandbox = t.context.sandbox;

    const { Analyzer, engine } = loadScript(t.context);

    const engineExecuteOnStub = sandbox.stub(engine, 'executeOn').resolves([]);
    const engineCloseStub = sandbox.stub(engine, 'close').resolves();
    const webhint = new Analyzer({}, {}, []);

    await webhint.analyze([new URL('https://example.com/'), new URL('https://example2.com/'), new URL('https://example3.com/')]);

    t.true(engineExecuteOnStub.calledThrice);
    t.true(engineCloseStub.calledThrice);
    t.is(engineExecuteOnStub.args[0][0].href, 'https://example.com/');
    t.is(engineExecuteOnStub.args[1][0].href, 'https://example2.com/');
    t.is(engineExecuteOnStub.args[2][0].href, 'https://example3.com/');
});

test('If the target is an Array of Targets, it will analyze all of them', async (t) => {
    const sandbox = t.context.sandbox;

    const { Analyzer, engine } = loadScript(t.context);

    const engineExecuteOnStub = sandbox.stub(engine, 'executeOn').resolves([]);
    const engineCloseStub = sandbox.stub(engine, 'close').resolves();
    const webhint = new Analyzer({}, {}, []);

    await webhint.analyze([{ url: new URL('https://example.com/') }, { url: 'https://example2.com/' }, { url: new URL('https://example3.com/') }]);

    t.true(engineExecuteOnStub.calledThrice);
    t.true(engineCloseStub.calledThrice);
    t.is(engineExecuteOnStub.args[0][0].href, 'https://example.com/');
    t.is(engineExecuteOnStub.args[1][0].href, 'https://example2.com/');
    t.is(engineExecuteOnStub.args[2][0].href, 'https://example3.com/');
});

test('If the target is an Array of strings, URLs and Targets, it will analyze all of them', async (t) => {
    const sandbox = t.context.sandbox;

    const { Analyzer, engine } = loadScript(t.context);

    const engineExecuteOnStub = sandbox.stub(engine, 'executeOn').resolves([]);
    const engineCloseStub = sandbox.stub(engine, 'close').resolves();
    const webhint = new Analyzer({}, {}, []);

    await webhint.analyze([{ url: new URL('https://example.com/') }, 'https://example2.com/', new URL('https://example3.com/')]);

    t.true(engineExecuteOnStub.calledThrice);
    t.true(engineCloseStub.calledThrice);
    t.is(engineExecuteOnStub.args[0][0].href, 'https://example.com/');
    t.is(engineExecuteOnStub.args[1][0].href, 'https://example2.com/');
    t.is(engineExecuteOnStub.args[2][0].href, 'https://example3.com/');
});

test('If options includes an updateCallback, it will call to engine.prependAny', async (t) => {
    const sandbox = t.context.sandbox;

    const { Analyzer, engine } = loadScript(t.context);

    sandbox.stub(engine, 'executeOn').resolves([]);
    sandbox.stub(engine, 'close').resolves();
    const enginePrependAnySpy = sandbox.spy(engine, 'prependAny');
    const webhint = new Analyzer({}, {}, []);

    await webhint.analyze('https://example.com/', { updateCallback: () => { } });

    t.true(enginePrependAnySpy.calledOnce);
});

test(`If the option watch was configured in the connector, the analyzer will subscribe to the event 'print' in the engine`, async (t) => {
    const sandbox = t.context.sandbox;

    const { Analyzer, engine } = loadScript(t.context);

    sandbox.stub(engine, 'executeOn').resolves([]);
    sandbox.stub(engine, 'close').resolves();
    const engineOnSpy = sandbox.spy(engine, 'on');
    const webhint = new Analyzer({ connector: { options: { watch: true } } }, {}, []);

    await webhint.analyze('https://example.com/');

    t.true(engineOnSpy.calledOnce);
    t.is(engineOnSpy.args[0][0], 'print');
});

test(`If target.content is defined and the connector is not the local connector, it should return an exception`, async (t) => {
    const sandbox = t.context.sandbox;

    const { Analyzer, engine } = loadScript(t.context);

    const engineExecuteOnSpy = sandbox.spy(engine, 'executeOn');
    const engineCloseSpy = sandbox.spy(engine, 'close');
    const webhint = new Analyzer({ connector: { name: 'notLocal' } }, {}, []);

    const error: AnalyzerError = await t.throwsAsync(async () => {
        await webhint.analyze({ content: '<html></html>', url: 'https://example.com/' });
    });

    t.false(engineCloseSpy.called);
    t.false(engineExecuteOnSpy.called);

    t.is(error.status, AnalyzerErrorStatus.AnalyzeError);
});

test('If options includes a targetStartCallback, it will be call before engine.executeOn', async (t) => {
    const sandbox = t.context.sandbox;

    const { Analyzer, engine } = loadScript(t.context);

    const options = { targetStartCallback() { } };

    sandbox.stub(engine, 'close').resolves();
    const engineExecuteOnStub = sandbox.stub(engine, 'executeOn').resolves([]);
    const targetStartCallbackStub = sandbox.stub(options, 'targetStartCallback').resolves();
    const webhint = new Analyzer({}, {}, []);

    await webhint.analyze('https://example.com/', options);

    t.true(targetStartCallbackStub.calledOnce);
    t.true(targetStartCallbackStub.calledBefore(engineExecuteOnStub));
});

test('If options includes a targetEndCallback, it will be call after engine.executeOn', async (t) => {
    const sandbox = t.context.sandbox;

    const { Analyzer, engine } = loadScript(t.context);

    const options = { targetEndCallback() { } };

    sandbox.stub(engine, 'close').resolves();
    const engineExecuteOnStub = sandbox.stub(engine, 'executeOn').resolves([]);
    const targetEndCallbackStub = sandbox.stub(options, 'targetEndCallback').resolves();
    const webhint = new Analyzer({}, {}, []);

    await webhint.analyze('https://example.com/', options);

    t.true(targetEndCallbackStub.calledOnce);
    t.true(targetEndCallbackStub.calledAfter(engineExecuteOnStub));
});

test('If engine.executeOn throws an exception, it should close the engine', async (t) => {
    const sandbox = t.context.sandbox;

    const { Analyzer, engine } = loadScript(t.context);

    sandbox.stub(engine, 'executeOn').throws(new Error());

    const engineCloseStub = sandbox.stub(engine, 'close').resolves();
    const webhint = new Analyzer({}, {}, []);

    try {
        await webhint.analyze('https://example.com/');
    } catch {
        // do nothing.
    }

    t.true(engineCloseStub.calledOnce);
});

test('If the option watch was configured in the connector, and the connector is not the local connector, it should print a warning message.', async (t) => {
    const sandbox = t.context.sandbox;

    const { Analyzer, engine } = loadScript(t.context);

    sandbox.stub(engine, 'executeOn').resolves([]);
    sandbox.stub(engine, 'close').resolves();

    const loggerWarn = sandbox.spy(t.context.logger, 'warn');
    const webhint = new Analyzer({ connector: { options: { watch: true } } }, {}, []);

    await webhint.analyze('https://example.com/');

    t.true(loggerWarn.calledOnce);
});

test('format should call to all the formatters', async (t) => {
    const sandbox = t.context.sandbox;

    class FakeFormatter implements IFormatter {
        public constructor() { }

        public format(problems: Problem[]) {
        }
    }

    const formatter = new FakeFormatter();

    const { Analyzer, engine } = loadScript(t.context);

    const formatterFormatStub = sandbox.stub(formatter, 'format').resolves();

    sandbox.stub(engine, 'executeOn').resolves([]);
    sandbox.stub(engine, 'close').resolves();

    const webhint = new Analyzer({}, {}, [formatter]);

    await webhint.format([]);

    t.true(formatterFormatStub.calledOnce);
});

test('resources should returns all the resources', (t) => {
    const sandbox = t.context.sandbox;

    const { Analyzer, engine } = loadScript(t.context);

    sandbox.stub(engine, 'executeOn').resolves([]);
    sandbox.stub(engine, 'close').resolves();

    const resources = {};
    const webhint = new Analyzer({}, resources, []);

    t.is(webhint.resources, resources);
});

test('If config is not defined, it should get the config file from the directory process.cwd()', (t) => {
    const sandbox = t.context.sandbox;
    const cwd = 'currentDirectory';

    sandbox.stub(t.context.fs, 'cwd').returns(cwd);
    sandbox.stub(t.context.fs, 'isFile').returns(false);
    const getFilenameForDirectorySpy = sandbox.spy(t.context.configuration.Configuration, 'getFilenameForDirectory');

    const { Analyzer } = loadScript(t.context);

    Analyzer.getUserConfig();

    t.is(getFilenameForDirectorySpy.args[0][0], cwd);
});

test('If we pass a file, getUserConfig should use it to get the configuration.', (t) => {
    const sandbox = t.context.sandbox;
    const userConfig: UserConfig = {};

    sandbox.stub(t.context.fs, 'isFile').returns(true);
    const getFilenameForDirectorySpy = sandbox.spy(t.context.configuration.Configuration, 'getFilenameForDirectory');
    const loadConfigFileStub = sandbox.stub(t.context.configuration.Configuration, 'loadConfigFile').returns(userConfig);
    const file = 'file/path';

    const { Analyzer } = loadScript(t.context);
    const result = Analyzer.getUserConfig(file);

    t.false(getFilenameForDirectorySpy.called);
    t.true(loadConfigFileStub.calledOnce);
    t.is(result, userConfig);
});

test('If load a config fails, it returns null', (t) => {
    const sandbox = t.context.sandbox;

    sandbox.stub(t.context.fs, 'isFile').returns(false);
    const getFilenameForDirectoryStub = sandbox.stub(t.context.configuration.Configuration, 'getFilenameForDirectory').returns('file/path');
    const loadConfigFileStub = sandbox.stub(t.context.configuration.Configuration, 'loadConfigFile').throws(new Error());

    const { Analyzer } = loadScript(t.context);
    const result = Analyzer.getUserConfig();

    t.true(getFilenameForDirectoryStub.calledOnce);
    t.true(loadConfigFileStub.calledOnce);
    t.is(result, null);
});
