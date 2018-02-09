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
const child = { spawnSync() { } };
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

proxyquire('../../../src/lib/cli/init', {
    '../utils/logging': logger,
    '../utils/resource-loader': resourceLoader,
    './browserslist': stubBrowserslistObject,
    child_process: child, // eslint-disable-line camelcase
    fs,
    inquirer,
    util: stubUtilObject
});

import { initSonarwhalrc } from '../../../src/lib/cli/init';

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
        name: '@sonarwhal/rule-rule1'
    },
    {
        description: 'rule 2 description',
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
    sandbox.stub(child, 'spawnSync').returns({ status: 0 });
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
    sandbox.stub(child, 'spawnSync').returns({ status: 0 });
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
    sandbox.stub(child, 'spawnSync').returns({ status: 0 });
    sandbox.stub(fs, 'existsSync').returns(true);

    await initSonarwhalrc(actions);

    const fileData = JSON.parse(t.context.promisify.args[0][1]);

    t.is(fileData.connector.name, questionsResults.connector);
    t.true(_.isEqual(fileData.formatters, [questionsResults.formatter]));
    t.is(fileData.rules.rule2, 'error');
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
    sandbox.stub(child, 'spawnSync').returns({ status: 0 });
    sandbox.stub(fs, 'existsSync').returns(true);
    t.context.child = child;

    await initSonarwhalrc(actions);

    t.true(t.context.child.spawnSync.args[0][0].includes('@sonarwhal/rule-rule1')); // eslint-disable-line no-sync
    t.true(t.context.child.spawnSync.args[0][0].includes('@sonarwhal/rule-rule2')); // eslint-disable-line no-sync

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
    sandbox.stub(child, 'spawnSync').returns({ status: 0 });
    sandbox.stub(fs, 'existsSync').returns(true);
    t.context.child = child;

    await initSonarwhalrc(actions);

    t.true(t.context.child.spawnSync.args[0][0].includes('@sonarwhal/rule-rule2')); // eslint-disable-line no-sync

    sandbox.restore();
});

test.serial(`If 'package.json' doesn't exist, we should install the packages globally`, async (t) => {
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
    sandbox.stub(child, 'spawnSync').returns({ status: 0 });
    sandbox.stub(fs, 'existsSync').returns(false);
    t.context.child = child;

    await initSonarwhalrc(actions);

    t.true(t.context.child.spawnSync.args[0][0].includes('-g')); // eslint-disable-line no-sync

    sandbox.restore();
});

test.serial(`if instalation fails, the user should show a message about how to install the dependencies manually`, async (t) => {
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
    sandbox.stub(logger, 'log').resolves();
    sandbox.stub(logger, 'error').resolves();
    sandbox.stub(child, 'spawnSync').returns({
        output: [null, null, Buffer.from('Error installing packages')],
        status: 1
    });
    sandbox.stub(fs, 'existsSync').returns(true);
    t.context.logger = logger;

    await initSonarwhalrc(actions);

    const errorMessage = t.context.logger.error.args[0][0];
    const installMessage = t.context.logger.log.args[t.context.logger.log.args.length -1][0];

    t.true(t.context.logger.error.calledOnce);
    t.is(errorMessage.message, 'Error installing packages');
    t.true(installMessage.includes('npm install @sonarwhal/rule-rule1 @sonarwhal/rule-rule2'));

    sandbox.restore();
});

test.serial(`if instalation fails and packages.json doesn't exist, the user should show a message about how to install the dependencies manually`, async (t) => {
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
    sandbox.stub(logger, 'log').resolves();
    sandbox.stub(logger, 'error').resolves();
    sandbox.stub(child, 'spawnSync').returns({
        output: [null, null, Buffer.from('Error installing packages')],
        status: 1
    });
    sandbox.stub(fs, 'existsSync').returns(false);
    t.context.logger = logger;

    await initSonarwhalrc(actions);

    const errorMessage = t.context.logger.error.args[0][0];
    const installMessage = t.context.logger.log.args[t.context.logger.log.args.length -1][0];

    t.true(t.context.logger.error.calledOnce);
    t.is(errorMessage.message, 'Error installing packages');
    t.true(installMessage.includes('npm install @sonarwhal/rule-rule1 @sonarwhal/rule-rule2 -g'));

    sandbox.restore();
});

test.serial('If init is not an option, it should return false', async (t) => {
    const result = await initSonarwhalrc(({}) as CLIOptions);

    t.false(result);
});
