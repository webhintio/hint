import { isEqual } from 'lodash';
import * as proxyquire from 'proxyquire';
import * as sinon from 'sinon';
import anyTest, { TestInterface, ExecutionContext } from 'ava';

import { NpmPackage } from 'hint/dist/src/lib/types';

type Inquirer = {
    prompt: () => void;
};

type Logger = {
    log: () => void;
    error: () => void;
};

type StubBrowserslistObject = {
    generateBrowserslistConfig: () => void;
};

type ResourceLoader = {
    getCoreResources: () => [] | null;
    getInstalledResources: () => string[] | null;
};

type Child = {
    spawnSync: () => void;
};

type Fs = {
    existsSync: () => void;
    writeFile: () => void;
};

type Npm = {
    getOfficialPackages: () => NpmPackage[] | null;
    installPackages: () => boolean;
};

type PromisifyObject = {
    promisify: () => void;
};

type StubUtilObject = {
    promisify: () => void;
};

type CreateHintRCContext = {
    inquirer: Inquirer;
    promisifyObjectPromisifyStub: sinon.SinonStub;
    resourceLoader: ResourceLoader;
    sandbox: sinon.SinonSandbox;
    stubBrowserslistObject: StubBrowserslistObject;
    child: Child;
    fs: Fs;
    logger: Logger;
    npm: Npm;
    stubUtilObject: StubUtilObject;
    promisifyObject: PromisifyObject;
};

const test = anyTest as TestInterface<CreateHintRCContext>;

const formatters = [
    'formatter1',
    'formatter2'
];

const installedHints = [
    'hint1',
    'hint2'
];

const installedConnectors = [
    'installedConnector1',
    'installedConnector2'
];

const installedParsers: string[] = [];

const loadScript = (context: CreateHintRCContext): () => Promise<boolean> => {
    const initHintrc = proxyquire('../src/create-hintrc', {
        './browserslist': context.stubBrowserslistObject,
        child_process: context.child, // eslint-disable-line camelcase
        fs: context.fs,
        'hint/dist/src/lib/utils/logging': context.logger,
        'hint/dist/src/lib/utils/npm': context.npm,
        'hint/dist/src/lib/utils/resource-loader': context.resourceLoader,
        inquirer: context.inquirer,
        util: context.stubUtilObject
    }).default;

    return initHintrc;
};

const initContext = (t: ExecutionContext<CreateHintRCContext>) => {
    t.context.inquirer = { prompt() { } };
    t.context.stubBrowserslistObject = { generateBrowserslistConfig() { } };
    t.context.resourceLoader = {
        getCoreResources(): [] | null {
            return null;
        },
        getInstalledResources(): string[] | null {
            return null;
        }
    };
    t.context.child = { spawnSync() { } };
    t.context.fs = {
        existsSync() { },
        writeFile() { }
    };
    t.context.logger = {
        error() { },
        log() { }
    };
    t.context.npm = {
        getOfficialPackages(): NpmPackage[] | null {
            return null;
        },
        installPackages(): boolean {
            return false;
        }
    };
    t.context.promisifyObject = { promisify() { } };
    t.context.stubUtilObject = {
        promisify() {
            return t.context.promisifyObject.promisify;
        }
    };

    const sandbox = sinon.createSandbox();

    t.context.sandbox = sandbox;

    sandbox.stub(t.context.stubBrowserslistObject, 'generateBrowserslistConfig').resolves([]);
    sandbox.spy(t.context.stubUtilObject, 'promisify');

    t.context.promisifyObjectPromisifyStub = sandbox.stub(t.context.promisifyObject, 'promisify').resolves();
};

test.beforeEach(initContext);

test.afterEach.always((t) => {
    t.context.sandbox.restore();
});

test(`initHintrc should install the configuration package if user chooses a recommended configuration and the configuration doesn't exists`, async (t) => {
    const sandbox = t.context.sandbox;
    const initAnswers = { configType: 'predefined' };
    const configAnswer = { configuration: '@hint/configuration-recommended' };

    sandbox.stub(t.context.npm, 'getOfficialPackages').resolves([{
        date: new Date(),
        description: '',
        keywords: [],
        maintainers: [],
        name: '@hint/configuration-recommended',
        version: '1.0.0'
    }] as NpmPackage[]);

    const stub = sandbox.stub(t.context.npm, 'installPackages').returns(true);

    sandbox.stub(t.context.resourceLoader, 'getInstalledResources').returns([]);

    sandbox.stub(t.context.inquirer, 'prompt')
        .onFirstCall()
        .resolves(initAnswers)
        .onSecondCall()
        .resolves(configAnswer);

    const initHintrc = loadScript(t.context);

    await initHintrc();

    const fileData = JSON.parse(t.context.promisifyObjectPromisifyStub.args[0][1]);

    t.true(stub.called, `npm hasn't tried to install any package`);
    t.true(isEqual(fileData, { extends: ['recommended'] }));
});

test(`initHintrc shouldn't install the configuration package if user chooses a recommended configuration and the configuration already exists`, async (t) => {
    const sandbox = t.context.sandbox;
    const initAnswers = { configType: 'predefined' };
    const configAnswer = { configuration: '@hint/configuration-recommended' };

    sandbox.stub(t.context.npm, 'getOfficialPackages').resolves([{
        date: new Date(),
        description: '',
        keywords: [],
        maintainers: [],
        name: '@hint/configuration-recommended',
        version: '1.0.0'
    }] as NpmPackage[]);

    const stub = sandbox.stub(t.context.npm, 'installPackages').returns(true);

    sandbox.stub(t.context.resourceLoader, 'getInstalledResources').returns(['recommended']);

    sandbox.stub(t.context.inquirer, 'prompt')
        .onFirstCall()
        .resolves(initAnswers)
        .onSecondCall()
        .resolves(configAnswer);

    const initHintrc = loadScript(t.context);

    await initHintrc();

    const fileData = JSON.parse(t.context.promisifyObjectPromisifyStub.args[0][1]);

    t.false(stub.called, `npm has tried to install any package`);
    t.true(isEqual(fileData, { extends: ['recommended'] }));
});

test(`"inquirer.prompt" should use the installed resources if the user doesn't want a predefined configuration`, async (t) => {
    const sandbox = t.context.sandbox;
    const answers = {
        connector: 'jsdom',
        default: '',
        formatters: ['json'],
        hints: ['hint1', 'hint2']
    };

    sandbox.stub(t.context.resourceLoader, 'getInstalledResources')
        .onFirstCall()
        .returns(installedConnectors)
        .onSecondCall()
        .returns(formatters)
        .onThirdCall()
        .returns(installedParsers)
        .onCall(3)
        .returns(installedHints);

    sandbox.stub(t.context.resourceLoader, 'getCoreResources').returns([]);

    const initAnswers = { configType: 'custom' };

    sandbox.stub(t.context.inquirer, 'prompt')
        .onFirstCall()
        .resolves(initAnswers)
        .onSecondCall()
        .resolves(answers)
        .onThirdCall()
        .resolves([]);

    const initHintrc = loadScript(t.context);

    await initHintrc();

    const questions = (t.context.inquirer.prompt as sinon.SinonStub).args[1][0];

    t.is(questions[0].choices.length, installedConnectors.length);
    t.is(questions[1].choices.length, formatters.length);
    t.is(questions[2].choices.length, installedHints.length);

    const fileData = JSON.parse(t.context.promisifyObjectPromisifyStub.args[0][1]);

    t.is(fileData.connector.name, answers.connector);
    t.deepEqual(fileData.hints, {
        hint1: 'error',
        hint2: 'error'
    });
    t.deepEqual(fileData.formatters, answers.formatters);
});

test(`if instalation of a config package fails, "initHintrc" returns true`, async (t) => {
    const sandbox = t.context.sandbox;
    const initAnswers = { configType: 'predefined' };
    const configAnswer = { configuration: '@hint/configuration-recommended' };

    sandbox.stub(t.context.npm, 'getOfficialPackages').resolves([{
        date: new Date(),
        description: '',
        keywords: [],
        maintainers: [],
        name: '@hint/configuration-recommended',
        version: '1.0.0'
    }] as NpmPackage[]);

    sandbox.stub(t.context.npm, 'installPackages').returns(false);
    sandbox.stub(t.context.resourceLoader, 'getInstalledResources').returns([]);

    sandbox.stub(t.context.inquirer, 'prompt')
        .onFirstCall()
        .resolves(initAnswers)
        .onSecondCall()
        .resolves(configAnswer);

    const initHintrc = loadScript(t.context);

    const result = await initHintrc();

    t.true(result, `initHintrc doesn't return true if installation of resources fails`);
});
