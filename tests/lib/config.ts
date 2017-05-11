import * as path from 'path';

import * as proxyquire from 'proxyquire';
import * as sinon from 'sinon';
import test from 'ava';

const inquirer = { prompt() { } };
const resourceLoader = {
    getCollectors() { },
    getFormatters() { },
    getRules() { }
};

const stubPifyMethodObject = { pifyMethod() { } };

const stubPifyObject = {
    pify() {
        return stubPifyMethodObject.pifyMethod;
    }
};

proxyquire('../../src/lib/config', {
    './utils/resource-loader': resourceLoader,
    inquirer,
    pify: stubPifyObject.pify
});

import * as config from '../../src/lib/config';

test.beforeEach((t) => {
    sinon.stub(stubPifyMethodObject, 'pifyMethod').resolves();
    sinon.spy(stubPifyObject, 'pify');

    t.context.pify = stubPifyObject.pify;
    t.context.pifyMethod = stubPifyMethodObject.pifyMethod;
});

test.afterEach((t) => {
    t.context.pify.restore();
    t.context.pifyMethod.restore();
});

test('if there is no configuration file, it should return null', (t) => {
    const result = config.getFilenameForDirectory('./fixtures/getFileNameForDirectoryEmpty');

    t.is(result, null);
});


test('if there is configuration file, it should return the path to the file', (t) => {
    const result = config.getFilenameForDirectory(path.join(__dirname, './fixtures/getFilenameForDirectory'));

    t.true(result.includes('.sonarrc'));
});

test('if load is called with a non valid file extension, it should return an exception', (t) => {
    const error = t.throws(() => {
        config.load(path.join(__dirname, './fixtures/notvalid/notvalid.css'));
    });

    t.is(error.message, `Couldn't find any valid configuration`);
});

test(`if package.json doesn't have a sonar configuration, it should return an exception`, (t) => {
    const error = t.throws(() => {
        config.load(path.join(__dirname, './fixtures/notvalid/package.json'));
    });

    t.is(error.message, `Couldn't find any valid configuration`);
});

test(`if package.json is an invalid JSON, it should return an exception`, (t) => {
    const error = t.throws(() => {
        config.load(path.join(__dirname, './fixtures/exception/package.json'));
    });

    t.true(error.message.startsWith('Cannot read config file: '));
});

test(`if the config file doesn't have an extension, it should be parse as JSON file`, (t) => {
    const configuration = config.load(path.join(__dirname, './fixtures/sonarrc'));

    t.is(configuration.collector.name, 'cdp');
    t.is(configuration.rules['disallowed-headers'], 'warning');
});

test(`if the config file is JavaScript, it should return the configuration part`, (t) => {
    const configuration = config.load(path.join(__dirname, './fixtures/sonarrc.js'));

    t.is(configuration.collector.name, 'cdp');
    t.is(configuration.rules['disallowed-headers'], 'warning');
});

test(`if package.json contains a valid sonar coniguration, it should return it`, (t) => {
    const configuration = config.load(path.join(__dirname, './fixtures/package.json'));

    t.is(configuration.collector.name, 'cdp');
    t.is(configuration.rules['disallowed-headers'], 'warning');
});

const collectors = new Map([
    ['collector1', {}],
    ['collector2', {}]
]);

const rules = new Map([
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

const formatters = new Map([
    ['formatter1', {}],
    ['formatter2', {}]
]);

test.serial(`generate should call to "inquirer.prompt" with the right data`, async (t) => {
    const sandbox = sinon.sandbox;

    sandbox.stub(resourceLoader, 'getCollectors').returns(collectors);
    sandbox.stub(resourceLoader, 'getFormatters').returns(formatters);
    sandbox.stub(resourceLoader, 'getRules').returns(rules);
    sandbox.stub(inquirer, 'prompt').resolves({
        collector: '',
        default: '',
        formatter: '',
        rules: []
    });

    t.context.inquirer = inquirer;

    t.context.sandbox = sandbox;

    await config.generate();

    const questions = t.context.inquirer.prompt.args[0][0];
    const rulesKeys = [...rules.keys()];

    t.is(questions[0].choices.length, [...collectors.keys()].length);
    t.is(questions[1].choices.length, [...formatters.keys()].length);
    t.is(questions[2].choices.length, 2);
    t.is(questions[3].choices.length, rulesKeys.length);
    t.is(questions[3].choices[0].value, rulesKeys[0]);
    t.is(questions[3].choices[0].name, `${rulesKeys[0]} - ${rules.get(rulesKeys[0]).meta.docs.description}`);
    t.is(questions[3].choices[1].value, rulesKeys[1]);
    t.is(questions[3].choices[1].name, `${rulesKeys[1]} - ${rules.get(rulesKeys[1]).meta.docs.description}`);

    t.context.sandbox.restore();
});

test.serial(`generate should call to "fs.writeFile" with the right data`, async (t) => {
    const sandbox = sinon.sandbox;
    const questionsResults = {
        collector: 'cdp',
        default: false,
        formatter: 'json',
        rules: ['rule1']
    };

    sandbox.stub(resourceLoader, 'getCollectors').returns(collectors);
    sandbox.stub(resourceLoader, 'getFormatters').returns(formatters);
    sandbox.stub(resourceLoader, 'getRules').returns(rules);
    sandbox.stub(inquirer, 'prompt').resolves(questionsResults);

    t.context.sandbox = sandbox;
    await config.generate();

    const fileData = JSON.parse(t.context.pifyMethod.args[0][1]);

    t.is(fileData.collector.name, questionsResults.collector);
    t.is(fileData.formatter, questionsResults.formatter);
    t.is(fileData.rules.rule1, 'error');
    t.is(fileData.rules.rule2, 'off');

    t.context.sandbox.restore();
});

test.serial(`if the user choose to use the default rules configuration, all recommended rules should be set to "error" in the configuration file`, async (t) => {
    const sandbox = sinon.sandbox;
    const questionsResults = {
        collector: 'cdp',
        default: true,
        formatter: 'json',
        rules: []
    };

    sandbox.stub(resourceLoader, 'getCollectors').returns(collectors);
    sandbox.stub(resourceLoader, 'getFormatters').returns(formatters);
    sandbox.stub(resourceLoader, 'getRules').returns(rules);
    sandbox.stub(inquirer, 'prompt').resolves(questionsResults);

    t.context.sandbox = sandbox;

    await config.generate();

    const fileData = JSON.parse(t.context.pifyMethod.args[0][1]);

    t.is(fileData.collector.name, questionsResults.collector);
    t.is(fileData.formatter, questionsResults.formatter);
    t.is(fileData.rules.rule2, 'error');
    t.is(fileData.rules.rule1, 'off');

    t.context.sandbox.restore();
});
