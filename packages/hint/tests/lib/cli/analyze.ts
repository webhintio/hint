import * as proxyquire from 'proxyquire';
import * as sinon from 'sinon';
import anyTest, { TestFn, ExecutionContext } from 'ava';

import * as utils from '@hint/utils';
import { HintsConfigObject, UserConfig } from '@hint/utils';
import { Problem, Severity } from '@hint/utils-types';
import * as network from '@hint/utils-network';

import {
    AnalyzeOptions,
    AnalyzerError,
    AnalyzerResult,
    CLIOptions,
    CreateAnalyzerOptions,
    Endpoint
} from '../../../src/lib/types';
import { AnalyzerErrorStatus } from '../../../src/lib/enums/error-status';

const actions = { _: ['http://localhost/'], language: 'en-US' } as CLIOptions;
const actionsFS = { _: ['./'], language: 'en-US' } as CLIOptions;

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

type Ora = () => Spinner;

type Analyzer = {
    Analyzer: () => void;
}

type ConfigStore = {
    get: (key: string) => any;
    set: (key: string, value: any) => void;
};

type AnalyzeContext = {
    analyzer: Analyzer;
    askQuestion: AskQuestion;
    configStore: ConfigStore;
    errorSpy: sinon.SinonSpy<[string]>;
    failSpy: sinon.SinonSpy<[]>;
    getHintsFromConfiguration: (userConfig: UserConfig) => HintsConfigObject;
    logger: Logger;
    logSpy: sinon.SinonSpy<[string]>;
    ora: Ora;
    sandbox: sinon.SinonSandbox;
    spinner: Spinner;
    startSpy: sinon.SinonSpy<[]>;
    succeedSpy: sinon.SinonSpy<[]>;
};

const test = anyTest.serial as TestFn<AnalyzeContext>;

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
    t.context.ora = () => {
        return spinner;
    };
    t.context.startSpy = sandbox.spy(spinner, 'start');
    t.context.failSpy = sandbox.spy(spinner, 'fail');
    t.context.succeedSpy = sandbox.spy(spinner, 'succeed');
    t.context.askQuestion = () => { };
    t.context.sandbox = sandbox;
    t.context.getHintsFromConfiguration = (userConfig: UserConfig) => {
        return {};
    };

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
    t.context.configStore = {
        get(key: string) {
            return false;
        },
        set(key: string, value: any) { }
    };
};

const loadScript = (context: AnalyzeContext, isCi: boolean = false) => {
    const script = proxyquire('../../../src/lib/cli/analyze', {
        '../': {
            createAnalyzer: (context.analyzer.Analyzer as any).create,
            getUserConfig: (context.analyzer.Analyzer as any).getUserConfig
        },
        '@hint/utils': {
            askQuestion: context.askQuestion,
            configStore: utils.configStore,
            getHintsFromConfiguration: context.getHintsFromConfiguration,
            installPackages: utils.installPackages,
            logger: context.logger,
            mergeEnvWithOptions: (options: any) => {
                return options;
            }
        },
        '@hint/utils-network': network,
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

test('If there is no valid user config, it should use `web-recommended` as default configuration and use formatters `stylish` and `html` if it is running in CI', async (t) => {
    const sandbox = t.context.sandbox;

    const createAnalyzerStub = sandbox.stub(t.context.analyzer.Analyzer as any, 'create').returns(new FakeAnalyzer());

    sandbox.stub(t.context.analyzer.Analyzer as any, 'getUserConfig').returns(null as any);
    sandbox.stub(t.context, 'askQuestion').resolves(false);

    const analyze = loadScript(t.context, true);

    await analyze(actions);

    t.true(createAnalyzerStub.calledOnce);
    t.deepEqual(createAnalyzerStub.args[0][0], { extends: ['web-recommended'], formatters: ['html', 'stylish'], language: 'en-US' });
});

test('If there is no valid user config and the target is an existing filesystem path, it should use `development` as default configuration', async (t) => {
    const sandbox = t.context.sandbox;

    const createAnalyzerStub = sandbox.stub(t.context.analyzer.Analyzer as any, 'create').returns(new FakeAnalyzer());

    sandbox.stub(t.context.analyzer.Analyzer as any, 'getUserConfig').returns(null as any);
    sandbox.stub(t.context, 'askQuestion').resolves(false);

    const analyze = loadScript(t.context);

    await analyze(actionsFS);

    t.true(createAnalyzerStub.calledOnce);
    t.deepEqual(createAnalyzerStub.args[0][0], { extends: ['development'], language: 'en-US' });
});

test('If there is no valid user config and the target is an existing filesystem path, it should use `development` as default configuration and use formatters `stylish` and `html` if it is running in CI', async (t) => {
    const sandbox = t.context.sandbox;

    const createAnalyzerStub = sandbox.stub(t.context.analyzer.Analyzer as any, 'create').returns(new FakeAnalyzer());

    sandbox.stub(t.context.analyzer.Analyzer as any, 'getUserConfig').returns(null as any);
    sandbox.stub(t.context, 'askQuestion').resolves(false);

    const analyze = loadScript(t.context, true);

    await analyze(actionsFS);

    t.true(createAnalyzerStub.calledOnce);
    t.deepEqual(createAnalyzerStub.args[0][0], { extends: ['development'], formatters: ['html', 'stylish'], language: 'en-US' });
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

test('If no sites are defined, it should return false', async (t) => {
    const analyze = loadScript(t.context);
    const result = await analyze({ _: [] } as any);

    t.false(result);
});
