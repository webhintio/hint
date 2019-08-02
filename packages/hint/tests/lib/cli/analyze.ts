import * as proxyquire from 'proxyquire';
import * as sinon from 'sinon';
import anyTest, { TestInterface, ExecutionContext } from 'ava';

import * as utils from '@hint/utils';
import { Problem, Severity } from '@hint/utils/dist/src/types/problems';

import {
    AnalyzeOptions,
    AnalyzerError,
    AnalyzerResult,
    CLIOptions,
    CreateAnalyzerOptions,
    Endpoint,
    UserConfig
} from '../../../src/lib/types';
import { AnalyzerErrorStatus } from '../../../src/lib/enums/error-status';

const actions = { _: ['http://localhost/'], language: 'en-US' } as CLIOptions;

class FakeAnalyzer {
    public constructor() {
    }

    public analyze(endpoints: Endpoint | Endpoint[], options: AnalyzeOptions = {}): Promise<AnalyzerResult[]> {
        return Promise.resolve([]);
    }

    public async format() {
    }

    public resources() {
    }

    public static create() {
    }
}

type AskQuestion = () => any;

type Logger = {
    error: (text: string) => any;
    log: (text: string) => any;
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

type Analyzer = {
    Analyzer: () => void;
}

type AppInsight = {
    disable: () => void;
    enable: () => void;
    isConfigured: () => boolean;
    isEnabled: () => boolean;
    trackEvent: (event: string, data: any) => void;
};

type ConfigStore = {
    get: (key: string) => any;
    set: (key: string, value: any) => void;
};

type AnalyzeContext = {
    analyzer: Analyzer;
    appInsight: AppInsight;
    askQuestion: AskQuestion;
    configStore: ConfigStore;
    errorSpy: sinon.SinonSpy<[string]>;
    failSpy: sinon.SinonSpy<[]>;
    loadConfiguration: (configuration: string, parentConfigs: string[]) => any;
    logger: Logger;
    logSpy: sinon.SinonSpy<[string]>;
    ora: Ora;
    sandbox: sinon.SinonSandbox;
    spinner: Spinner;
    startSpy: sinon.SinonSpy<[]>;
    succeedSpy: sinon.SinonSpy<[]>;
};

const test = anyTest.serial as TestInterface<AnalyzeContext>;

const initContext = (t: ExecutionContext<AnalyzeContext>) => {
    const sandbox = sinon.createSandbox();
    const spinner = {
        fail() { },
        start() { },
        succeed() { },
        text: ''
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
    t.context.askQuestion = () => { };
    t.context.sandbox = sandbox;

    const analyzer: Analyzer = { Analyzer: function Analyzer() { } };

    analyzer.Analyzer.prototype.create = (userConfiguration: UserConfig, options: CreateAnalyzerOptions) => { };
    analyzer.Analyzer.prototype.getUserConfig = (filePath?: string): UserConfig | null => {
        return null;
    };

    t.context.analyzer = analyzer;
    (t.context.analyzer.Analyzer as any).create = (userConfiguration: UserConfig, options: CreateAnalyzerOptions): Analyzer => {
        return {} as Analyzer;
    };
    (t.context.analyzer.Analyzer as any).getUserConfig = (filePath?: string): UserConfig | null => {
        return null;
    };
    t.context.appInsight = {
        disable() { },
        enable() { },
        isConfigured() {
            return false;
        },
        isEnabled() {
            return false;
        },
        trackEvent(event: string, data: any) { }
    };
    t.context.configStore = {
        get(key: string) {
            return false;
        },
        set(key: string, value: any) { }
    };
    t.context.loadConfiguration = (configuration: string, parentConfigs: string[]) => {
        return {};
    };
};

const loadScript = (context: AnalyzeContext, isCi: boolean = false) => {
    const script = proxyquire('../../../src/lib/cli/analyze', {
        '../': {
            createAnalyzer: (context.analyzer.Analyzer as any).create,
            getUserConfig: (context.analyzer.Analyzer as any).getUserConfig
        },
        '../utils': { loadConfiguration: context.loadConfiguration },
        '@hint/utils': {
            appInsights: context.appInsight,
            configStore: utils.configStore,
            debug: utils.debug,
            logger: context.logger,
            misc: {
                askQuestion: context.askQuestion,
                cutString: utils.misc.cutString,
                mergeEnvWithOptions: (options: any) => {
                    return options;
                }
            },
            network: utils.network,
            npm: utils.npm,
            packages: utils.packages
        },
        'is-ci': isCi,
        ora: context.ora
    });

    return script.default;
};

test.beforeEach(initContext);

test.afterEach.always((t) => {
    t.context.sandbox.restore();
});

test('If there is no valid user config, it should use `web-recommended` as default configuration', async (t) => {
    const sandbox = t.context.sandbox;

    const createAnalyzerStub = sandbox.stub(t.context.analyzer.Analyzer as any, 'create').returns(new FakeAnalyzer());

    sandbox.stub(t.context.analyzer.Analyzer as any, 'getUserConfig').returns(null as any);
    sandbox.stub(t.context, 'askQuestion').resolves(false);

    const analyze = loadScript(t.context);

    await analyze(actions);

    t.true(createAnalyzerStub.calledOnce);
    t.deepEqual(createAnalyzerStub.args[0][0], { extends: ['web-recommended'], language: 'en-US' });
});

test('If there is no valid user config and user refuses to use the default or to create a configuration file, it should exit with code 1', async (t) => {
    const sandbox = t.context.sandbox;

    sandbox.stub(t.context.analyzer.Analyzer as any, 'getUserConfig').returns(null as any);
    const createAnalyzerStub = sandbox.stub(t.context.analyzer.Analyzer as any, 'create')
        .onFirstCall()
        .throws(new AnalyzerError('Missed configuration', AnalyzerErrorStatus.ConfigurationError));
    const askQuestionDefaultStub = sandbox.stub(t.context, 'askQuestion').resolves(false);

    const analyze = loadScript(t.context);

    const result = await analyze(actions);

    t.true(askQuestionDefaultStub.calledOnce);
    t.false(result);
    t.true(createAnalyzerStub.calledOnce);
});

test('If configuration file exists, it should use it', async (t) => {
    const sandbox = t.context.sandbox;

    const createAnalyzerSpy = sandbox.stub(t.context.analyzer.Analyzer as any, 'create');

    sandbox.stub(t.context.analyzer.Analyzer as any, 'getUserConfig').returns({});

    const customConfigOptions = ({ _: ['http://localhost'], config: 'configfile.cfg' } as CLIOptions);

    const analyze = loadScript(t.context);

    await analyze(customConfigOptions);

    t.true(createAnalyzerSpy.called);
});

test('If the scan returns an error, it should exit with code 1 and call to analyzer.format', async (t) => {
    const sandbox = t.context.sandbox;
    const fakeAnalyzer = new FakeAnalyzer();

    sandbox.stub(t.context.analyzer.Analyzer as any, 'create').returns(fakeAnalyzer);
    sandbox.stub(fakeAnalyzer, 'analyze').callsFake(async (targets: Endpoint | Endpoint[], options?: AnalyzeOptions) => {
        await options!.targetEndCallback!({
            problems: [{ severity: Severity.error } as Problem],
            url: 'https://example.com'
        });

        return [];
    });
    const analyzerFormatSpy = sandbox.spy(fakeAnalyzer, 'format');

    sandbox.stub(t.context, 'askQuestion').resolves(false);
    sandbox.stub(t.context.analyzer.Analyzer as any, 'getUserConfig').returns({});

    const analyze = loadScript(t.context);
    const exitCode = await analyze(actions);

    t.false(exitCode);
    t.true(analyzerFormatSpy.calledOnce);
});

test('If the scan returns an error, it should call to spinner.fail()', async (t) => {
    const sandbox = t.context.sandbox;

    const fakeAnalyzer = new FakeAnalyzer();

    sandbox.stub(t.context.analyzer.Analyzer as any, 'create').returns(fakeAnalyzer);
    sandbox.stub(fakeAnalyzer, 'analyze').callsFake(async (targets: Endpoint | Endpoint[], options?: AnalyzeOptions) => {
        await options!.targetEndCallback!({
            problems: [{ severity: Severity.error } as Problem],
            url: 'https://example.com'
        });

        return [];
    });

    sandbox.stub(t.context.analyzer.Analyzer as any, 'getUserConfig').returns({});

    const analyze = loadScript(t.context);

    await analyze(actions);

    t.true(t.context.failSpy.calledOnce);
});

test('If the scan throws an exception, it should exit with code 1', async (t) => {
    const sandbox = t.context.sandbox;
    const fakeAnalyzer = new FakeAnalyzer();

    sandbox.stub(t.context.analyzer.Analyzer as any, 'create').returns(fakeAnalyzer);
    sandbox.stub(fakeAnalyzer, 'analyze').rejects(new Error());
    sandbox.stub(t.context.analyzer.Analyzer as any, 'getUserConfig').returns({});
    const analyze = loadScript(t.context);
    const result = await analyze(actions);

    t.false(result);
});

test('If the scan throws an exception, it should call to spinner.fail()', async (t) => {
    const sandbox = t.context.sandbox;
    const fakeAnalyzer = new FakeAnalyzer();

    sandbox.stub(t.context.analyzer.Analyzer as any, 'create').returns(fakeAnalyzer);
    sandbox.stub(fakeAnalyzer, 'analyze').rejects(new Error());
    sandbox.stub(t.context.analyzer.Analyzer as any, 'getUserConfig').returns({});

    const analyze = loadScript(t.context);

    await analyze(actions);

    t.true(t.context.failSpy.calledOnce);
});

test('If the scan returns no errors, it should exit with code 0 and call analyzer.format', async (t) => {
    const sandbox = t.context.sandbox;
    const fakeAnalyzer = new FakeAnalyzer();

    sandbox.stub(t.context.analyzer.Analyzer as any, 'create').returns(fakeAnalyzer);
    sandbox.stub(fakeAnalyzer, 'analyze').callsFake(async (targets: Endpoint | Endpoint[], options?: AnalyzeOptions) => {
        await options!.targetEndCallback!({
            problems: [{ severity: 0 } as Problem],
            url: 'https://example.com'
        });

        return [];
    });
    const analyzerFormatSpy = sandbox.spy(fakeAnalyzer, 'format');

    sandbox.stub(t.context.analyzer.Analyzer as any, 'getUserConfig').returns({});

    const analyze = loadScript(t.context);
    const exitCode = await analyze(actions);

    t.true(exitCode);
    t.true(analyzerFormatSpy.calledOnce);
});

test('If there is no errors analyzing the url, it should call to spinner.succeed()', async (t) => {
    const sandbox = t.context.sandbox;
    const fakeAnalyzer = new FakeAnalyzer();

    sandbox.stub(t.context.analyzer.Analyzer as any, 'create').returns(fakeAnalyzer);
    sandbox.stub(fakeAnalyzer, 'analyze').callsFake(async (targets: Endpoint | Endpoint[], options?: AnalyzeOptions) => {
        await options!.targetEndCallback!({
            problems: [{ severity: 0 } as Problem],
            url: 'https://example.com'
        });

        return [];
    });

    sandbox.stub(t.context.analyzer.Analyzer as any, 'getUserConfig').returns({});

    const analyze = loadScript(t.context);

    await analyze(actions);

    t.true(t.context.succeedSpy.calledOnce);
});

test('updateCallback should write a message in the spinner', async (t) => {
    const sandbox = t.context.sandbox;
    const fakeAnalyzer = new FakeAnalyzer();

    sandbox.stub(t.context.analyzer.Analyzer as any, 'create').returns(fakeAnalyzer);
    sandbox.stub(fakeAnalyzer, 'analyze').callsFake(async (targets: Endpoint | Endpoint[], options?: AnalyzeOptions) => {
        await options!.updateCallback!({
            message: 'Downloading http://localhost/',
            url: 'http://example.com'
        });

        return [];
    });

    sandbox.stub(t.context.analyzer.Analyzer as any, 'getUserConfig').returns({});

    const analyze = loadScript(t.context);

    await analyze(actions);

    t.is(t.context.spinner.text, 'Downloading http://localhost/');
});

test('If there is missing or incompatible packages, they should be tracked', async (t) => {
    const sandbox = t.context.sandbox;
    const fakeAnalyzer = new FakeAnalyzer();

    sandbox.stub(t.context.analyzer.Analyzer as any, 'create').throws(new AnalyzerError('error', AnalyzerErrorStatus.ResourceError, { connector: null, formatters: [], hints: [], incompatible: ['hint2'], missing: ['hint1'], parsers: [] }));
    sandbox.stub(fakeAnalyzer, 'analyze').callsFake(async (targets: Endpoint | Endpoint[], options?: AnalyzeOptions) => {
        await options!.updateCallback!({
            message: 'Downloading http://localhost/',
            url: 'http://example.com'
        });

        return [];
    });
    sandbox.stub(t.context, 'askQuestion').resolves(false);

    const appInsightTrackEventSpy = sandbox.spy(t.context.appInsight, 'trackEvent');

    sandbox.stub(t.context.analyzer.Analyzer as any, 'getUserConfig').returns({});

    const analyze = loadScript(t.context);

    try {
        await analyze(actions);
    } catch {
        // empty
    }

    t.true(appInsightTrackEventSpy.calledTwice);
    t.is(appInsightTrackEventSpy.args[0][0], 'missing');
    t.deepEqual(appInsightTrackEventSpy.args[0][1], ['hint1']);
    t.is(appInsightTrackEventSpy.args[1][0], 'incompatible');
    t.deepEqual(appInsightTrackEventSpy.args[1][1], ['hint2']);
});

test('If no sites are defined, it should return false', async (t) => {
    const analyze = loadScript(t.context);
    const result = await analyze({ _: [] } as any);

    t.false(result);
});

test('If there is no errors analyzing the url, and it is the second time running a scan, and the user confirm telemetry, telemetry should be enabled', async (t) => {
    const sandbox = t.context.sandbox;
    const fakeAnalyzer = new FakeAnalyzer();

    sandbox.stub(t.context.analyzer.Analyzer as any, 'create').returns(fakeAnalyzer);
    sandbox.stub(fakeAnalyzer, 'analyze').resolves();

    sandbox.stub(t.context.analyzer.Analyzer as any, 'getUserConfig').returns({ connector: { name: 'puppeteer' } });
    sandbox.stub(t.context.appInsight, 'isConfigured').returns(false);
    sandbox.stub(t.context.configStore, 'get').returns(true);
    sandbox.stub(t.context, 'askQuestion').resolves(true);

    const appInsightEnableSpy = sandbox.spy(t.context.appInsight, 'enable');
    const appInsightTrackEventSpy = sandbox.spy(t.context.appInsight, 'trackEvent');

    const analyze = loadScript(t.context);

    await analyze(actions);

    const args = appInsightTrackEventSpy.args;

    t.true(appInsightEnableSpy.calledOnce);
    t.true(appInsightTrackEventSpy.calledThrice);
    t.is(args[1][0], 'SecondRun');
    t.is(args[2][0], 'analyze');
});

test('Telemetry should trim options from a connector', async (t) => {
    const sandbox = t.context.sandbox;
    const fakeAnalyzer = new FakeAnalyzer();

    sandbox.stub(t.context.analyzer.Analyzer as any, 'create').returns(fakeAnalyzer);
    sandbox.stub(fakeAnalyzer, 'analyze').resolves();

    sandbox.stub(t.context.analyzer.Analyzer as any, 'getUserConfig').returns({
        connector: {
            name: 'puppeteer',
            options: {
                auth: {
                    password: 'passwordInput',
                    submit: 'submitButton',
                    user: 'userInput'
                }
            }
        }
    });

    const appInsightTrackEventSpy = sandbox.spy(t.context.appInsight, 'trackEvent');

    const analyze = loadScript(t.context);

    await analyze(actions);

    t.falsy(appInsightTrackEventSpy.args[0][1].connector.options);
});

test('Telemetry should remove properties from rules', async (t) => {
    const sandbox = t.context.sandbox;
    const fakeAnalyzer = new FakeAnalyzer();

    sandbox.stub(t.context.analyzer.Analyzer as any, 'create').returns(fakeAnalyzer);
    sandbox.stub(fakeAnalyzer, 'analyze').resolves();

    sandbox.stub(t.context.analyzer.Analyzer as any, 'getUserConfig').returns({
        connector: { name: 'puppeteer' },
        hints: {
            hint1: ['error', {
                options1: 'value1',
                options2: 'value2'
            }],
            hint2: ['warning', { option: false }]
        }
    });
    sandbox.stub(t.context.appInsight, 'isConfigured').returns(false);
    sandbox.stub(t.context.configStore, 'get').returns(true);
    sandbox.stub(t.context, 'askQuestion').resolves(true);

    const appInsightTrackEventSpy = sandbox.spy(t.context.appInsight, 'trackEvent');

    const analyze = loadScript(t.context);

    await analyze(actions);

    const hints = appInsightTrackEventSpy.args[0][1].hints;

    t.is(hints.hint1, 'error');
    t.is(hints.hint2, 'warning');
});

test('Telemetry should normalize rules', async (t) => {
    const sandbox = t.context.sandbox;
    const fakeAnalyzer = new FakeAnalyzer();

    sandbox.stub(t.context.analyzer.Analyzer as any, 'create').returns(fakeAnalyzer);
    sandbox.stub(fakeAnalyzer, 'analyze').resolves();

    sandbox.stub(t.context.analyzer.Analyzer as any, 'getUserConfig').returns({
        connector: { name: 'puppeteer' },
        hints: ['hint1:warning', 'hint2', 'hint3:error']
    });
    sandbox.stub(t.context.appInsight, 'isConfigured').returns(false);
    sandbox.stub(t.context.configStore, 'get').returns(true);
    sandbox.stub(t.context, 'askQuestion').resolves(true);

    const appInsightTrackEventSpy = sandbox.spy(t.context.appInsight, 'trackEvent');

    const analyze = loadScript(t.context);

    await analyze(actions);

    const hints = appInsightTrackEventSpy.args[0][1].hints;

    t.is(hints.hint1, 'warning');
    t.is(hints.hint2, 'error');
    t.is(hints.hint3, 'error');
});

test('Telemetry should expand configurations', async (t) => {
    const sandbox = t.context.sandbox;
    const fakeAnalyzer = new FakeAnalyzer();

    sandbox.stub(t.context.analyzer.Analyzer as any, 'create').returns(fakeAnalyzer);
    sandbox.stub(fakeAnalyzer, 'analyze').resolves();

    const loadConfigurationStub = sandbox.stub(t.context, 'loadConfiguration')
        .onFirstCall()
        .returns({
            hints: {
                hint1: 'error',
                hint4: ['warning', { option: false }]
            }
        })
        .onSecondCall()
        .returns({
            hints: {
                hint3: 'off',
                hint5: ['error', { option: false }]
            }
        });

    sandbox.stub(t.context.analyzer.Analyzer as any, 'getUserConfig').returns({
        connector: { name: 'puppeteer' },
        extends: ['extend1', 'extend2'],
        hints: ['hint1:warning', 'hint2', 'hint3:error']
    });

    const appInsightTrackEventSpy = sandbox.spy(t.context.appInsight, 'trackEvent');

    const analyze = loadScript(t.context);

    await analyze(actions);

    const hints = appInsightTrackEventSpy.args[0][1].hints;

    t.is(hints.hint1, 'warning');
    t.is(hints.hint2, 'error');
    t.is(hints.hint3, 'error');
    t.is(hints.hint4, 'warning');
    t.true(loadConfigurationStub.calledTwice);
    t.is(loadConfigurationStub.args[0][0], 'extend1');
    t.is(loadConfigurationStub.args[1][0], 'extend2');
});
