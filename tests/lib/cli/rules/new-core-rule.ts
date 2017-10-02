import * as path from 'path';
import * as proxyquire from 'proxyquire';
import * as sinon from 'sinon';
import test from 'ava';

import { Category } from '../../../../src/lib/enums/category';
import { CLIOptions } from '../../../../src/lib/types';
import { readFileAsync } from '../../../../src/lib/utils/misc';
import * as rulesCommon from '../../../../src/lib/cli/rules/common';

const actions = ({ newRule: true } as CLIOptions);
const ruleScriptDir = 'src/lib/rules';
const ruleDocDir = 'docs/user-guide/rules';
const ruleTestDir = 'tests/lib/rules';

const expectedScriptDir = `${__dirname}/fixtures/new.txt`;
const expectedScriptHasQuotesDir = `${__dirname}/fixtures/new-quotes.txt`;
const scriptTemplateDir = `src/lib/cli/rules/templates/core-rule/rule-script.hbs`;
const existingRuleName = 'Content Type';
const newRuleName = 'new';

const inquirer = { prompt() { } };
const fs = {
    mkdir() { },
    readFile() { },
    writeFile() { }
};
const rimrafObject = { rimraf() { } };
const stubPromisifiedMethodObject = {
    mkdirPAsync() { },
    readFileAsync() { },
    rimrafAsync() { },
    writeFileAsync() { }
};
const stubUtilObject = {
    promisify(method) {
        return stubPromisifiedMethodObject[`${method.name}Async`];
    }
};

const resourceLoader = { getCoreRules() { } };
const rules = ['axe', 'content-type'];

proxyquire('../../../../src/lib/cli/rules/new-core-rule', {
    './common': rulesCommon,
    fs,
    inquirer,
    resourceLoader,
    rimraf: rimrafObject.rimraf,
    util: stubUtilObject
});

import * as rule from '../../../../src/lib/cli/rules/new-core-rule';

test.beforeEach((t) => {
    sinon.stub(stubPromisifiedMethodObject, 'mkdirPAsync').resolves();
    sinon.stub(stubPromisifiedMethodObject, 'rimrafAsync').resolves();
    sinon.stub(stubPromisifiedMethodObject, 'writeFileAsync').resolves();
    sinon.stub(resourceLoader, 'getCoreRules').resolves(rules);
    sinon.spy(stubUtilObject, 'promisify');

    t.context.promisify = stubUtilObject.promisify;
    t.context.mkdirpAsync = stubPromisifiedMethodObject.mkdirPAsync;
    t.context.rimrafAsync = stubPromisifiedMethodObject.rimrafAsync;
    t.context.writeFileAsync = stubPromisifiedMethodObject.writeFileAsync;
    t.context.loadRules = resourceLoader.getCoreRules;
});

test.afterEach.always((t) => {
    t.context.promisify.restore();
    t.context.mkdirpAsync.restore();
    t.context.rimrafAsync.restore();
    t.context.writeFileAsync.restore();
    t.context.loadRules.restore();
});

test.serial(`if core, 'generate' should call to write script, documentation, test file and update the index page`, async (t) => {
    const sandbox = sinon.sandbox.create();
    const results = {
        category: Category.pwa,
        description: 'An important new rule',
        elementType: '',
        extension: '',
        name: newRuleName,
        recommended: true,
        useCase: 'request'
    };

    sandbox.stub(stubPromisifiedMethodObject, 'readFileAsync').resolves('');
    sandbox.stub(inquirer, 'prompt').resolves(results);

    await rule.newRule(actions);

    const mkdirpAsyncFn = t.context.mkdirpAsync;
    const writeFileAsyncFn = t.context.writeFileAsync;

    // mkdirAsync
    t.is(mkdirpAsyncFn.callCount, 3);
    t.true(mkdirpAsyncFn.args[0][0].includes(path.join(ruleScriptDir, results.name)));
    t.true(mkdirpAsyncFn.args[1][0].includes(path.join(ruleDocDir, ''))); // so it uses the right separator
    t.true(mkdirpAsyncFn.args[2][0].includes(path.join(ruleTestDir, results.name)));

    // writeFileAsync
    t.is(writeFileAsyncFn.callCount, 4);
    // Write Script
    t.true(writeFileAsyncFn.args[0][0].includes(path.join(ruleScriptDir, results.name, `${results.name}.${results.extension}`)));
    // Write Documentation
    t.true(writeFileAsyncFn.args[1][0].includes(path.join(ruleDocDir, `${results.name}.md`)));
    // Write Test
    t.true(writeFileAsyncFn.args[2][0].includes(path.join(ruleTestDir, results.name, `tests.ts`)));
    // Add to index page
    t.true(writeFileAsyncFn.args[3][0].includes(path.join(ruleDocDir, 'index.md')));

    sandbox.restore();
});

test.serial(`The right script template should be used in 'generate'`, async (t) => {
    const sandbox = sinon.sandbox.create();
    const results = {
        category: Category.pwa,
        description: 'An important new rule',
        elementType: '',
        extension: 'ts',
        name: newRuleName,
        recommended: true,
        useCase: 'request'
    };

    // load template
    const scriptTemplate = await readFileAsync(scriptTemplateDir);

    sandbox.stub(inquirer, 'prompt').resolves(results);
    sandbox.stub(stubPromisifiedMethodObject, 'readFileAsync').resolves(scriptTemplate);

    await rule.newRule(actions);

    const expectedContent = await readFileAsync(expectedScriptDir);
    const actualContent = t.context.writeFileAsync.args[0][1];

    t.is(actualContent, expectedContent);

    sandbox.restore();
});

test.serial(`Description contains quotes`, async (t) => {
    const sandbox = sinon.sandbox.create();
    const results = {
        category: Category.pwa,
        description: `This is a \`description\` that contains 'single quote' and "double qutoes"`,
        elementType: '',
        extension: 'ts',
        name: newRuleName,
        recommended: true,
        useCase: 'request'
    };

    // load template
    const scriptTemplate = await readFileAsync(scriptTemplateDir);

    sandbox.stub(inquirer, 'prompt').resolves(results);
    sandbox.stub(stubPromisifiedMethodObject, 'readFileAsync').resolves(scriptTemplate);

    await rule.newRule(actions);

    const expectedContent = await readFileAsync(expectedScriptHasQuotesDir);
    const actualContent = t.context.writeFileAsync.args[0][1];

    t.is(actualContent, expectedContent);

    sandbox.restore();
});

test.serial(`Throw an error if a new rule already exists when calling 'generate'`, async (t) => {
    const sandbox = sinon.sandbox.create();
    const results = {
        category: Category.pwa,
        description: 'An important new rule',
        elementType: '',
        extension: 'js',
        name: existingRuleName,
        recommended: true,
        useCase: 'request'
    };

    sandbox.stub(stubPromisifiedMethodObject, 'readFileAsync').resolves('');
    sandbox.stub(inquirer, 'prompt').resolves(results);

    const error = await t.throws(rule.newRule(actions));

    t.is(error.message, `This rule already exists!`);

    sandbox.restore();
});

test.serial('if newRule is not an option, it should return false', async (t) => {
    const result = await rule.newRule({} as CLIOptions);

    t.false(result);
});

test.serial('if newRule is not executed in the right path, it should return false', async (t) => {
    const processDir = sinon.stub(rulesCommon, 'processDir').get(() => {
        return 'another directory';
    });

    const result = await rule.newRule(actions);

    processDir.restore();

    t.false(result);
});
