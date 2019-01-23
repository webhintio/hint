import { isEqual } from 'lodash';
import * as proxyquire from 'proxyquire';
import * as sinon from 'sinon';
import anyTest, { TestInterface } from 'ava';

import { NpmPackage } from 'hint/dist/src/lib/types';

type CreateHintRCContext = {
    promisifyObjectPromisifyStub: sinon.SinonStub;
    sandbox: sinon.SinonSandbox;
};

const test = anyTest as TestInterface<CreateHintRCContext>;

const inquirer = { prompt() { } };
const stubBrowserslistObject = { generateBrowserslistConfig() { } };
const resourceLoader = {
    getCoreResources(): [] | null {
        return null;
    },
    getInstalledResources(): string[] | null {
        return null;
    }
};
const child = { spawnSync() { } };
const fs = {
    existsSync() { },
    writeFile() { }
};
const logger = {
    error() { },
    log() { }
};

const npm = {
    getOfficialPackages(): NpmPackage[] | null {
        return null;
    },
    installPackages(): boolean {
        return false;
    }
};

const promisifyObject = { promisify() { } };

const stubUtilObject = {
    promisify() {
        return promisifyObject.promisify;
    }
};

proxyquire('../src/create-hintrc', {
    './browserslist': stubBrowserslistObject,
    child_process: child, // eslint-disable-line camelcase
    fs,
    'hint/dist/src/lib/utils/logging': logger,
    'hint/dist/src/lib/utils/npm': npm,
    'hint/dist/src/lib/utils/resource-loader': resourceLoader,
    inquirer,
    util: stubUtilObject
});

import initHintrc from '../src/create-hintrc';

test.beforeEach((t) => {
    const sandbox = sinon.createSandbox();

    sandbox.stub(stubBrowserslistObject, 'generateBrowserslistConfig').resolves([]);
    sandbox.spy(stubUtilObject, 'promisify');

    t.context.promisifyObjectPromisifyStub = sandbox.stub(promisifyObject, 'promisify').resolves();
    t.context.sandbox = sandbox;
});

test.afterEach.always((t) => {
    t.context.sandbox.restore();
});

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

test.serial(`initHintrc should install the configuration package if user chooses a recommended configuration and the configuration doesn't exists`, async (t) => {
    const sandbox = t.context.sandbox;
    const initAnswers = { configType: 'predefined' };
    const configAnswer = { configuration: '@hint/configuration-recommended' };

    sandbox.stub(npm, 'getOfficialPackages').resolves([{
        date: new Date(),
        description: '',
        keywords: [],
        maintainers: [],
        name: '@hint/configuration-recommended',
        version: '1.0.0'
    }] as NpmPackage[]);

    const stub = sandbox.stub(npm, 'installPackages').returns(true);

    sandbox.stub(resourceLoader, 'getInstalledResources').returns([]);

    sandbox.stub(inquirer, 'prompt')
        .onFirstCall()
        .resolves(initAnswers)
        .onSecondCall()
        .resolves(configAnswer);

    await initHintrc();

    const fileData = JSON.parse(t.context.promisifyObjectPromisifyStub.args[0][1]);

    t.true(stub.called, `npm hasn't tried to install any package`);
    t.true(isEqual(fileData, { extends: ['recommended'] }));
});

test.serial(`initHintrc shouldn't install the configuration package if user chooses a recommended configuration and the configuration already exists`, async (t) => {
    const sandbox = t.context.sandbox;
    const initAnswers = { configType: 'predefined' };
    const configAnswer = { configuration: '@hint/configuration-recommended' };

    sandbox.stub(npm, 'getOfficialPackages').resolves([{
        date: new Date(),
        description: '',
        keywords: [],
        maintainers: [],
        name: '@hint/configuration-recommended',
        version: '1.0.0'
    }] as NpmPackage[]);

    const stub = sandbox.stub(npm, 'installPackages').returns(true);

    sandbox.stub(resourceLoader, 'getInstalledResources').returns(['recommended']);

    sandbox.stub(inquirer, 'prompt')
        .onFirstCall()
        .resolves(initAnswers)
        .onSecondCall()
        .resolves(configAnswer);

    await initHintrc();

    const fileData = JSON.parse(t.context.promisifyObjectPromisifyStub.args[0][1]);

    t.false(stub.called, `npm has tried to install any package`);
    t.true(isEqual(fileData, { extends: ['recommended'] }));
});

test.serial(`"inquirer.prompt" should use the installed resources if the user doesn't want a predefined configuration`, async (t) => {
    const sandbox = t.context.sandbox;
    const answers = {
        connector: 'jsdom',
        default: '',
        formatters: ['json'],
        hints: ['hint1', 'hint2']
    };

    sandbox.stub(resourceLoader, 'getInstalledResources')
        .onFirstCall()
        .returns(installedConnectors)
        .onSecondCall()
        .returns(formatters)
        .onThirdCall()
        .returns(installedParsers)
        .onCall(3)
        .returns(installedHints);

    sandbox.stub(resourceLoader, 'getCoreResources').returns([]);

    const initAnswers = { configType: 'custom' };

    sandbox.stub(inquirer, 'prompt')
        .onFirstCall()
        .resolves(initAnswers)
        .onSecondCall()
        .resolves(answers)
        .onThirdCall()
        .resolves([]);

    await initHintrc();

    const questions = (inquirer.prompt as sinon.SinonStub).args[1][0];

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

test.serial(`if instalation of a config package fails, "initHintrc" returns true`, async (t) => {
    const sandbox = t.context.sandbox;
    const initAnswers = { configType: 'predefined' };
    const configAnswer = { configuration: '@hint/configuration-recommended' };

    sandbox.stub(npm, 'getOfficialPackages').resolves([{
        date: new Date(),
        description: '',
        keywords: [],
        maintainers: [],
        name: '@hint/configuration-recommended',
        version: '1.0.0'
    }] as NpmPackage[]);

    sandbox.stub(npm, 'installPackages').returns(false);
    sandbox.stub(resourceLoader, 'getInstalledResources').returns([]);

    sandbox.stub(inquirer, 'prompt')
        .onFirstCall()
        .resolves(initAnswers)
        .onSecondCall()
        .resolves(configAnswer);

    const result = await initHintrc();

    t.true(result, `initHintrc doesn't return true if installation of resources fails`);
});
