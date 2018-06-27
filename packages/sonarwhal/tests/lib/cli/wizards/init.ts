import * as _ from 'lodash';
import * as proxyquire from 'proxyquire';
import * as sinon from 'sinon';
import test from 'ava';

import { NpmPackage } from '../../../../src/lib/types';

const inquirer = { prompt() { } };
const stubBrowserslistObject = { generateBrowserslistConfig() { } };
const resourceLoader = {
    getCoreResources() { },
    getInstalledResources() { }
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
    getOfficialPackages() { },
    installPackages() { }
};

const promisifyObject = { promisify() { } };

const stubUtilObject = {
    promisify() {
        return promisifyObject.promisify;
    }
};

proxyquire('../../../../src/lib/cli/wizards/init', {
    '../../utils/logging': logger,
    '../../utils/npm': npm,
    '../../utils/resource-loader': resourceLoader,
    '../browserslist': stubBrowserslistObject,
    child_process: child, // eslint-disable-line camelcase
    fs,
    inquirer,
    util: stubUtilObject
});

import initHintrc from '../../../../src/lib/cli/wizards/init';

test.beforeEach((t) => {
    sinon.stub(promisifyObject, 'promisify').resolves();
    sinon.stub(stubBrowserslistObject, 'generateBrowserslistConfig').resolves([]);
    sinon.spy(stubUtilObject, 'promisify');

    t.context.util = stubUtilObject.promisify;
    t.context.promisify = promisifyObject.promisify;
    t.context.browserslistGenerator = stubBrowserslistObject.generateBrowserslistConfig;
});

test.afterEach.always((t) => {
    t.context.util.restore();
    t.context.promisify.restore();
    t.context.browserslistGenerator.restore();
});

const formatters = [
    'formatter1',
    'formatter2'
];

const installedRules = [
    '@hint/rule-rule1',
    '@hint/rule-rule2'
];

const installedConnectors = [
    'installedConnector1',
    'installedConnector2'
];

const installedParsers = [];

test.serial(`initHintrc should install the configuration package if user chooses a recommended configuration and the configuration doesn't exists`, async (t) => {
    const sandbox = sinon.createSandbox();
    const initAnswers = { configType: 'predefined' };
    const configAnswer = { configuration: '@hint/configuration-recommended' };

    sandbox.stub(npm, 'getOfficialPackages').resolves([{
        date: null,
        description: '',
        keywords: [],
        maintainers: [],
        name: '@hint/configuration-recommended',
        version: '1.0.0'
    }] as Array<NpmPackage>);

    const stub = sandbox.stub(npm, 'installPackages').returns(true);

    sandbox.stub(resourceLoader, 'getInstalledResources').returns([]);

    sandbox.stub(inquirer, 'prompt')
        .onFirstCall()
        .resolves(initAnswers)
        .onSecondCall()
        .resolves(configAnswer);

    await initHintrc();

    const fileData = JSON.parse(t.context.promisify.args[0][1]);

    t.true(stub.called, `npm hasn't tried to install any package`);
    t.true(_.isEqual(fileData, { extends: ['recommended'] }));

    sandbox.restore();
});

test.serial(`initHintrc shouldn't install the configuration package if user chooses a recommended configuration and the configuration already exists`, async (t) => {
    const sandbox = sinon.createSandbox();
    const initAnswers = { configType: 'predefined' };
    const configAnswer = { configuration: '@hint/configuration-recommended' };

    sandbox.stub(npm, 'getOfficialPackages').resolves([{
        date: null,
        description: '',
        keywords: [],
        maintainers: [],
        name: '@hint/configuration-recommended',
        version: '1.0.0'
    }] as Array<NpmPackage>);

    const stub = sandbox.stub(npm, 'installPackages').returns(true);

    sandbox.stub(resourceLoader, 'getInstalledResources').returns(['recommended']);

    sandbox.stub(inquirer, 'prompt')
        .onFirstCall()
        .resolves(initAnswers)
        .onSecondCall()
        .resolves(configAnswer);

    await initHintrc();

    const fileData = JSON.parse(t.context.promisify.args[0][1]);

    t.false(stub.called, `npm has tried to install any package`);
    t.true(_.isEqual(fileData, { extends: ['recommended'] }));

    sandbox.restore();
});

test.serial(`"inquirer.prompt" should use the installed resources if the user doesn't want a predefined configuration`, async (t) => {
    const sandbox = sinon.createSandbox();
    const answers = {
        connector: 'jsdom',
        default: '',
        formatters: ['json'],
        rules: ['rule1', 'rule2']
    };

    sandbox.stub(resourceLoader, 'getInstalledResources')
        .onFirstCall()
        .returns(installedConnectors)
        .onSecondCall()
        .returns(formatters)
        .onThirdCall()
        .returns(installedParsers)
        .onCall(3)
        .returns(installedRules);

    sandbox.stub(resourceLoader, 'getCoreResources').returns([]);

    const initAnswers = { configType: 'custom' };

    sandbox.stub(inquirer, 'prompt')
        .onFirstCall()
        .resolves(initAnswers)
        .onSecondCall()
        .resolves(answers);

    await initHintrc();

    const questions = (inquirer.prompt as sinon.SinonStub).args[1][0];

    t.is(questions[0].choices.length, installedConnectors.length);
    t.is(questions[1].choices.length, formatters.length);
    t.is(questions[2].choices.length, installedRules.length);

    const fileData = JSON.parse(t.context.promisify.args[0][1]);

    t.is(fileData.connector.name, answers.connector);
    t.deepEqual(fileData.rules, {
        rule1: 'error',
        rule2: 'error'
    });
    t.deepEqual(fileData.formatters, answers.formatters);

    sandbox.restore();
});

test.serial(`if instalation of a config package fails, "initHintrc" returns true`, async (t) => {
    const sandbox = sinon.createSandbox();
    const initAnswers = { configType: 'predefined' };
    const configAnswer = { configuration: '@hint/configuration-recommended' };

    sandbox.stub(npm, 'getOfficialPackages').resolves([{
        date: null,
        description: '',
        keywords: [],
        maintainers: [],
        name: '@hint/configuration-recommended',
        version: '1.0.0'
    }] as Array<NpmPackage>);

    sandbox.stub(npm, 'installPackages').returns(false);
    sandbox.stub(resourceLoader, 'getInstalledResources').returns([]);

    sandbox.stub(inquirer, 'prompt')
        .onFirstCall()
        .resolves(initAnswers)
        .onSecondCall()
        .resolves(configAnswer);

    const result = await initHintrc();

    t.true(result, `initHintrc doesn't return true if installation of resources fails`);

    sandbox.restore();
});
