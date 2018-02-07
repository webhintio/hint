import * as path from 'path';
import * as proxyquire from 'proxyquire';
import * as sinon from 'sinon';
import test from 'ava';

import { CLIOptions } from '../../../../src/lib/types';

const actions = ({ removeRule: true } as CLIOptions);
const ruleScriptDir = 'src/lib/rules';
const ruleDocDir = 'docs/user-guide/rules';
const ruleDistScriptDir = `dist/${ruleScriptDir}`;
const ruleTestDir = 'tests/lib/rules';

const existingRuleName = 'Content Type';
const normalizedExistingRuleName = 'content-type';
const newRuleName = 'new';

const inquirer = { prompt() { } };
const fs = {
    readFile() { },
    writeFile() { }
};
const rimrafObject = { rimraf() { } };
const stubPromisifiedMethodObject = {
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

proxyquire('../../../../src/lib/cli/rules/delete-core-rule', {
    fs,
    inquirer,
    resourceLoader,
    rimraf: rimrafObject.rimraf,
    util: stubUtilObject
});

import * as rule from '../../../../src/lib/cli/rules/delete-core-rule';

test.beforeEach((t) => {
    sinon.stub(stubPromisifiedMethodObject, 'rimrafAsync').resolves();
    sinon.stub(stubPromisifiedMethodObject, 'writeFileAsync').resolves();
    sinon.stub(resourceLoader, 'getCoreRules').resolves(rules);
    sinon.spy(stubUtilObject, 'promisify');

    t.context.promisify = stubUtilObject.promisify;
    t.context.rimrafAsync = stubPromisifiedMethodObject.rimrafAsync;
    t.context.writeFileAsync = stubPromisifiedMethodObject.writeFileAsync;
    t.context.loadRules = resourceLoader.getCoreRules;
});

test.afterEach.always((t) => {
    t.context.promisify.restore();
    t.context.rimrafAsync.restore();
    t.context.writeFileAsync.restore();
    t.context.loadRules.restore();
});

test.serial(`'remove' should call to remove the correct rule`, async (t) => {
    const sandbox = sinon.sandbox.create();
    const results = { name: existingRuleName };

    sandbox.stub(stubPromisifiedMethodObject, 'readFileAsync').resolves('');
    sandbox.stub(inquirer, 'prompt').resolves(results);

    await rule.deleteRule(actions);

    const rimrafAsyncFn = t.context.rimrafAsync;
    const writeFileAsyncFn = t.context.writeFileAsync;

    // rimrafAsync
    t.is(rimrafAsyncFn.callCount, 4);
    // Delete script
    t.true(rimrafAsyncFn.args[0][0].includes(path.join(ruleScriptDir, normalizedExistingRuleName)));
    // Delete documentation
    t.true(rimrafAsyncFn.args[1][0].includes(path.join(ruleDocDir, `${normalizedExistingRuleName}.md`)));
    // Delete test
    t.true(rimrafAsyncFn.args[2][0].includes(path.join(ruleTestDir, normalizedExistingRuleName)));
    // Delete dist script
    t.true(rimrafAsyncFn.args[3][0].includes(path.join(ruleDistScriptDir, normalizedExistingRuleName)));

    // writeFileAsync
    t.is(writeFileAsyncFn.callCount, 1);
    // Update index page
    t.true(writeFileAsyncFn.args[0][0].includes(path.join(ruleDocDir, 'index.md')));

    sandbox.restore();
});

test.serial(`Throw an error if a rule doesn't exist when calling 'remove'`, async (t) => {
    const sandbox = sinon.sandbox.create();
    const results = { name: newRuleName };

    sandbox.stub(stubPromisifiedMethodObject, 'readFileAsync').resolves('');
    sandbox.stub(inquirer, 'prompt').resolves(results);

    const error = await t.throws(rule.deleteRule(actions));

    t.is(error.message, `This rule doesn't exist!`);

    sandbox.restore();
});
