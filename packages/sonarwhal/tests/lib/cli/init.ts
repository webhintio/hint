import * as _ from 'lodash';
import * as proxyquire from 'proxyquire';
import * as sinon from 'sinon';
import test from 'ava';

import { CLIOptions } from '../../../src/lib/types';

const actions = ({ init: true } as CLIOptions);
const inquirer = { prompt() { } };
const stubBrowserslistObject = { generateBrowserslistConfig() { } };
const resourceLoader = {
    getCoreConnectors() { },
    getCoreFormatters() { },
    getCoreRulesFromNpm() { },
    getInstalledConnectors() { }
};
const fs = {
    existsSync() { },
    writeFile() { }
};
const logger = {
    error() { },
    log() { }
};

const promisifyObject = { promisify() { } };

const stubUtilObject = {
    promisify() {
        return promisifyObject.promisify;
    }
};

const npm = { installCoreRules() { } };

proxyquire('../../../src/lib/cli/init', {
    '../utils/logging': logger,
    '../utils/npm': npm,
    '../utils/resource-loader': resourceLoader,
    './browserslist': stubBrowserslistObject,
    fs,
    inquirer,
    util: stubUtilObject
});

import { initSonarwhalrc } from '../../../src/lib/cli/init';

test.beforeEach((t) => {
    sinon.stub(promisifyObject, 'promisify').resolves();
    sinon.stub(stubBrowserslistObject, 'generateBrowserslistConfig').resolves([]);
    sinon.spy(stubUtilObject, 'promisify');
    sinon.stub(npm, 'installCoreRules').resolves();

    t.context.util = stubUtilObject.promisify;
    t.context.promisify = promisifyObject.promisify;
    t.context.browserslistGenerator = stubBrowserslistObject.generateBrowserslistConfig;
    t.context.npm = npm;
});

test.afterEach.always((t) => {
    t.context.util.restore();
    t.context.promisify.restore();
    t.context.browserslistGenerator.restore();
    t.context.npm.installCoreRules.restore();
});

const connectors = [
    'connector1',
    'connector2'];

const installedConnectors = [
    'installedConnector1',
    'installedConnector2'
];

const rules = [
    {
        description: 'rule 1 description',
        keywords: ['key1', 'key2', 'sonarwhal-recommended'],
        name: '@sonarwhal/rule-rule1'
    },
    {
        description: 'rule 2 description',
        keywords: ['key3', 'key4'],
        name: '@sonarwhal/rule-rule2'
    }
];

const formatters = [
    'formatter1',
    'formatter2'];

test.serial(`Generate should call to "inquirer.prompt" with the right data`, async (t) => {
    const sandbox = sinon.sandbox.create();

    sandbox.stub(resourceLoader, 'getCoreConnectors').returns(connectors);
    sandbox.stub(resourceLoader, 'getCoreFormatters').returns(formatters);
    sandbox.stub(resourceLoader, 'getInstalledConnectors').returns(installedConnectors);
    sandbox.stub(resourceLoader, 'getCoreRulesFromNpm').resolves(rules);
    sandbox.stub(fs, 'existsSync').returns(true);
    sandbox.stub(inquirer, 'prompt').resolves({
        connector: '',
        default: '',
        formatter: '',
        rules: []
    });

    await initSonarwhalrc(actions);

    const questions = (inquirer.prompt as sinon.SinonStub).args[0][0];

    t.is(questions[0].choices.length, connectors.length + installedConnectors.length);
    t.is(questions[1].choices.length, formatters.length);
    t.is(questions[3].choices.length, rules.length);
    const rule0Name = rules[0].name.replace('@sonarwhal/rule-', '');
    const rule1Name = rules[1].name.replace('@sonarwhal/rule-', '');

    t.is(questions[3].choices[0].value, rule0Name);
    t.is(questions[3].choices[0].name, `${rule0Name} - ${rules[0].description}`);
    t.is(questions[3].choices[1].value, rule1Name);
    t.is(questions[3].choices[1].name, `${rule1Name} - ${rules[1].description}`);

    sandbox.restore();
});

test.serial(`Generate should call to "fs.writeFile" with the right data`, async (t) => {
    const sandbox = sinon.sandbox.create();
    const questionsResults = {
        connector: 'chrome',
        default: false,
        formatter: 'json',
        rules: ['rule1']
    };

    sandbox.stub(resourceLoader, 'getCoreConnectors').returns(connectors);
    sandbox.stub(resourceLoader, 'getCoreFormatters').returns(formatters);
    sandbox.stub(resourceLoader, 'getCoreRulesFromNpm').resolves(rules);
    sandbox.stub(inquirer, 'prompt').resolves(questionsResults);
    sandbox.stub(fs, 'existsSync').returns(true);

    await initSonarwhalrc(actions);

    const fileData = JSON.parse(t.context.promisify.args[0][1]);

    t.is(fileData.connector.name, questionsResults.connector);
    t.true(_.isEqual(fileData.formatters, [questionsResults.formatter]));
    t.is(fileData.rules.rule1, 'error');
    t.is(fileData.rules.rule2, 'off');

    sandbox.restore();
});

test.serial(`If the user choose to use the default rules configuration, all recommended rules should be set to "error" in the configuration file`, async (t) => {
    const sandbox = sinon.sandbox.create();
    const questionsResults = {
        connector: 'chrome',
        default: true,
        formatter: 'json',
        rules: []
    };

    sandbox.stub(resourceLoader, 'getCoreConnectors').returns(connectors);
    sandbox.stub(resourceLoader, 'getCoreFormatters').returns(formatters);
    sandbox.stub(resourceLoader, 'getCoreRulesFromNpm').resolves(rules);
    sandbox.stub(inquirer, 'prompt').resolves(questionsResults);
    sandbox.stub(fs, 'existsSync').returns(true);

    await initSonarwhalrc(actions);

    const fileData = JSON.parse(t.context.promisify.args[0][1]);

    t.is(fileData.connector.name, questionsResults.connector);
    t.true(_.isEqual(fileData.formatters, [questionsResults.formatter]));
    t.is(fileData.rules.rule2, void 0);
    t.is(fileData.rules.rule1, 'error');

    sandbox.restore();
});

test.serial('initSonarwhalrc should install all rules if the user choose to install the recommended rules', async (t) => {
    const sandbox = sinon.sandbox.create();
    const questionsResults = {
        connector: 'chrome',
        default: true,
        formatter: 'json',
        rules: []
    };

    sandbox.stub(resourceLoader, 'getCoreConnectors').returns(connectors);
    sandbox.stub(resourceLoader, 'getCoreFormatters').returns(formatters);
    sandbox.stub(resourceLoader, 'getCoreRulesFromNpm').resolves(rules);
    sandbox.stub(inquirer, 'prompt').resolves(questionsResults);
    sandbox.stub(fs, 'existsSync').returns(true);

    await initSonarwhalrc(actions);

    t.true(t.context.npm.installCoreRules.args[0][0].includes('rule1')); // eslint-disable-line no-sync
    t.false(t.context.npm.installCoreRules.args[0][0].includes('rule2')); // eslint-disable-line no-sync

    sandbox.restore();
});

test.serial('initSonarwhalrc should install the rules choosen', async (t) => {
    const sandbox = sinon.sandbox.create();
    const questionsResults = {
        connector: 'chrome',
        default: false,
        formatter: 'json',
        rules: ['rule2']
    };

    sandbox.stub(resourceLoader, 'getCoreConnectors').returns(connectors);
    sandbox.stub(resourceLoader, 'getCoreFormatters').returns(formatters);
    sandbox.stub(resourceLoader, 'getCoreRulesFromNpm').resolves(rules);
    sandbox.stub(inquirer, 'prompt').resolves(questionsResults);
    sandbox.stub(fs, 'existsSync').returns(true);

    await initSonarwhalrc(actions);

    t.true(t.context.npm.installCoreRules.args[0][0].includes('rule2')); // eslint-disable-line no-sync

    sandbox.restore();
});

test.serial('If init is not an option, it should return false', async (t) => {
    const result = await initSonarwhalrc(({}) as CLIOptions);

    t.false(result);
});
