import * as proxyquire from 'proxyquire';
import * as sinon from 'sinon';
import test from 'ava';

const inquirer = { prompt() { } };
const stubBrowserslistObject = { generateBrowserslistConfig() { } };
const resourceLoader = {
    getCoreConnectors() { },
    getCoreFormatters() { },
    getCoreRules() { },
    loadRules() { }
};

const promisifyObject = { promisify() { } };

const stubUtilObject = {
    promisify() {
        return promisifyObject.promisify;
    }
};

proxyquire('../../../src/lib/cli/sonarrc-generator', {
    '../utils/resource-loader': resourceLoader,
    './browserslist-generator': stubBrowserslistObject,
    inquirer,
    util: stubUtilObject
});

import { initSonarrc } from '../../../src/lib/cli/sonarrc-generator';

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

const rules = ['rule1', 'rule2'];

const rulesData = new Map([
    ['rule1', {
        meta: {
            docs: { description: 'description rule 1' },
            recommended: false
        }
    }],
    ['rule2', {
        meta: {
            docs: { description: 'description rule 2' },
            recommended: true
        }
    }]
]);

const formatters = [
    'formatter1',
    'formatter2'];

test.serial(`generate should call to "inquirer.prompt" with the right data`, async (t) => {
    const sandbox = sinon.sandbox.create();

    sandbox.stub(resourceLoader, 'getCoreConnectors').returns(connectors);
    sandbox.stub(resourceLoader, 'getCoreFormatters').returns(formatters);
    sandbox.stub(resourceLoader, 'getCoreRules').returns(rules);
    sandbox.stub(resourceLoader, 'loadRules').returns(rulesData);
    sandbox.stub(inquirer, 'prompt').resolves({
        connector: '',
        default: '',
        formatter: '',
        rules: []
    });

    await initSonarrc();

    const questions = (inquirer.prompt as sinon.SinonStub).args[0][0];
    const rulesKeys = rules;

    t.is(questions[0].choices.length, connectors.length);
    t.is(questions[1].choices.length, formatters.length);
    t.is(questions[3].choices.length, rulesKeys.length);
    t.is(questions[3].choices[0].value, rulesKeys[0]);
    t.is(questions[3].choices[0].name, `${rulesKeys[0]} - ${rulesData.get(rulesKeys[0]).meta.docs.description}`);
    t.is(questions[3].choices[1].value, rulesKeys[1]);
    t.is(questions[3].choices[1].name, `${rulesKeys[1]} - ${rulesData.get(rulesKeys[1]).meta.docs.description}`);

    sandbox.restore();
});

test.serial(`generate should call to "fs.writeFile" with the right data`, async (t) => {
    const sandbox = sinon.sandbox.create();
    const questionsResults = {
        connector: 'chrome',
        default: false,
        formatter: 'json',
        rules: ['rule1']
    };

    sandbox.stub(resourceLoader, 'getCoreConnectors').returns(connectors);
    sandbox.stub(resourceLoader, 'getCoreFormatters').returns(formatters);
    sandbox.stub(resourceLoader, 'getCoreRules').returns(rules);
    sandbox.stub(resourceLoader, 'loadRules').returns(rulesData);
    sandbox.stub(inquirer, 'prompt').resolves(questionsResults);

    await initSonarrc();

    const fileData = JSON.parse(t.context.promisify.args[0][1]);

    t.is(fileData.connector.name, questionsResults.connector);
    t.is(fileData.formatter, questionsResults.formatter);
    t.is(fileData.rules.rule1, 'error');
    t.is(fileData.rules.rule2, 'off');

    sandbox.restore();
});

test.serial(`if the user choose to use the default rules configuration, all recommended rules should be set to "error" in the configuration file`, async (t) => {
    const sandbox = sinon.sandbox.create();
    const questionsResults = {
        connector: 'chrome',
        default: true,
        formatter: 'json',
        rules: []
    };

    sandbox.stub(resourceLoader, 'getCoreConnectors').returns(connectors);
    sandbox.stub(resourceLoader, 'getCoreFormatters').returns(formatters);
    sandbox.stub(resourceLoader, 'getCoreRules').returns(rules);
    sandbox.stub(resourceLoader, 'loadRules').returns(rulesData);
    sandbox.stub(inquirer, 'prompt').resolves(questionsResults);

    await initSonarrc();

    const fileData = JSON.parse(t.context.promisify.args[0][1]);

    t.is(fileData.connector.name, questionsResults.connector);
    t.is(fileData.formatter, questionsResults.formatter);
    t.is(fileData.rules.rule2, 'error');
    t.is(fileData.rules.rule1, 'off');

    sandbox.restore();
});
