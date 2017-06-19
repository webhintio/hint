import * as path from 'path';
import * as proxyquire from 'proxyquire';
import * as sinon from 'sinon';
import test from 'ava';

import { readFileAsync } from '../../../src/lib/utils/misc';

const ruleScriptDir = 'src/lib/rules';
const ruleDocDir = 'docs/user-guide/rules';
const ruleTestDir = 'tests/lib/rules';
const ruleDistScriptDir = `dist/${ruleScriptDir}`;

const expectedScriptDir = 'tests/lib/cli/fixtures/new.txt';
const scriptTemplateDir = 'src/lib/cli/templates/rule-script-ts.hbs';
const existingRuleName = 'Content Type';
const normalizedExistingRuleName = 'content-type';
const newRuleName = 'new';

const inquirer = { prompt() { } };
const fs = {
    mkdir() { },
    readFile() { },
    writeFile() { }
};
const rimrafObject = { rimraf() { } };
const stubPromisifiedMethodObject = {
    mkdirAsync() { },
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

proxyquire('../../../src/lib/cli/rule-generator', {
    fs,
    inquirer,
    resourceLoader,
    rimraf: rimrafObject.rimraf,
    util: stubUtilObject
});

import * as rule from '../../../src/lib/cli/rule-generator';

test.beforeEach((t) => {
    sinon.stub(stubPromisifiedMethodObject, 'mkdirAsync').resolves();
    sinon.stub(stubPromisifiedMethodObject, 'rimrafAsync').resolves();
    sinon.stub(stubPromisifiedMethodObject, 'writeFileAsync').resolves();
    sinon.stub(resourceLoader, 'getCoreRules').resolves(rules);
    sinon.spy(stubUtilObject, 'promisify');

    t.context.promisify = stubUtilObject.promisify;
    t.context.mkdirAsync = stubPromisifiedMethodObject.mkdirAsync;
    t.context.rimrafAsync = stubPromisifiedMethodObject.rimrafAsync;
    t.context.writeFileAsync = stubPromisifiedMethodObject.writeFileAsync;
    t.context.loadRules = resourceLoader.getCoreRules;
});

test.afterEach.always((t) => {
    t.context.promisify.restore();
    t.context.mkdirAsync.restore();
    t.context.rimrafAsync.restore();
    t.context.writeFileAsync.restore();
    t.context.loadRules.restore();
});

test.serial(`if core, 'generate' should call to write script, documentation, test file and update the index page`, async (t) => {
    const sandbox = sinon.sandbox.create();
    const results = {
        category: 'PWAs',
        description: 'An important new rule',
        elementType: '',
        extension: '',
        isCore: true,
        name: newRuleName,
        useCase: 'request'
    };

    sandbox.stub(stubPromisifiedMethodObject, 'readFileAsync').resolves('');
    sandbox.stub(inquirer, 'prompt').resolves(results);

    await rule.newRule();

    const mkdirAsyncFn = t.context.mkdirAsync;
    const writeFileAsyncFn = t.context.writeFileAsync;

    // mkdirAsync
    t.is(mkdirAsyncFn.callCount, 2);
    t.true(mkdirAsyncFn.args[0][0].includes(path.join(ruleScriptDir, results.name)));
    t.true(mkdirAsyncFn.args[1][0].includes(path.join(ruleTestDir, results.name)));

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

// test.serial(`if not core, 'generate' should only call to write script`, async (t) => {
//     const sandbox = sinon.sandbox;
//     const results = {
//         category: 'PWAs',
//         description: 'An important new rule',
//         elementType: '',
//         extension: 'ts',
//         isCore: false,
//         name: newRuleName,
//         useCase: 'request'
//     };

//     sandbox.stub(stubPromisifiedMethodObject, 'readFileAsync').resolves('');
//     sandbox.stub(inquirer, 'prompt').resolves(results);

//     t.context.sandbox = sandbox;
//     t.context.readFileAsync = stubPromisifiedMethodObject.readFileAsync;
//     await rule.generate();

//     const mkdirAsyncFn = t.context.mkdirAsync;
//     const writeFileAsyncFn = t.context.writeFileAsync;

//     // mkdirAsync
//     t.is(mkdirAsyncFn.callCount, 1);
//     t.true(mkdirAsyncFn.args[0][0].includes(path.join(ruleScriptDir, results.name)));

//     // writeFileAsync
//     t.is(writeFileAsyncFn.callCount, 1);
//     t.true(writeFileAsyncFn.args[0][0].includes(path.join(ruleScriptDir, results.name, `${results.name}.${results.extension}`)));

//     t.context.sandbox.restore();
// });

test.serial(`The right script template should be used in 'generate'`, async (t) => {
    const sandbox = sinon.sandbox.create();
    const results = {
        category: 'PWAs',
        description: 'An important new rule',
        elementType: '',
        extension: 'ts',
        isCore: true,
        name: newRuleName,
        useCase: 'request'
    };

    // load template
    const scriptTemplate = await readFileAsync(scriptTemplateDir);

    sandbox.stub(inquirer, 'prompt').resolves(results);
    sandbox.stub(stubPromisifiedMethodObject, 'readFileAsync').resolves(scriptTemplate);

    await rule.newRule();

    const expectedContent = await readFileAsync(expectedScriptDir);
    const actualContent = t.context.writeFileAsync.args[0][1];

    t.is(actualContent, expectedContent);

    sandbox.restore();
});

// test.serial(`Throw an error if it's a core rule but 'js' is used as an extension when calling 'generate'`, async (t) => {
//     const sandbox = sinon.sandbox;
//     const results = {
//         category: 'PWAs',
//         description: 'An important new rule',
//         elementType: '',
//         extension: 'js',
//         isCore: true,
//         name: newRuleName,
//         useCase: 'request'
//     };

//     sandbox.stub(stubPromisifiedMethodObject, 'readFileAsync').resolves('');
//     sandbox.stub(inquirer, 'prompt').resolves(results);

//     t.context.sandbox = sandbox;
//     t.context.readFileAsync = stubPromisifiedMethodObject.readFileAsync;

//     const error = await t.throws(rule.generate());

//     t.is(error.message, `The core rule can't be a 'js' file.`);

//     t.context.sandbox.restore();
// });

test.serial(`Throw an error if a new rule already exists when calling 'generate'`, async (t) => {
    const sandbox = sinon.sandbox.create();
    const results = {
        category: 'PWAs',
        description: 'An important new rule',
        elementType: '',
        extension: 'js',
        isCore: true,
        name: existingRuleName,
        useCase: 'request'
    };

    sandbox.stub(stubPromisifiedMethodObject, 'readFileAsync').resolves('');
    sandbox.stub(inquirer, 'prompt').resolves(results);

    const error = await t.throws(rule.newRule());

    t.is(error.message, `This rule already exists!`);

    sandbox.restore();
});

test.serial(`'remove' should call to remove the correct rule`, async (t) => {
    const sandbox = sinon.sandbox.create();
    const results = { name: existingRuleName };

    sandbox.stub(stubPromisifiedMethodObject, 'readFileAsync').resolves('');
    sandbox.stub(inquirer, 'prompt').resolves(results);

    await rule.removeRule();

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
    // UPdate index page
    t.true(writeFileAsyncFn.args[0][0].includes(path.join(ruleDocDir, 'index.md')));

    sandbox.restore();
});

test.serial(`Throw an error if a rule doesn't exist when calling 'remove'`, async (t) => {
    const sandbox = sinon.sandbox.create();
    const results = { name: newRuleName };

    sandbox.stub(stubPromisifiedMethodObject, 'readFileAsync').resolves('');
    sandbox.stub(inquirer, 'prompt').resolves(results);

    const error = await t.throws(rule.removeRule());

    t.is(error.message, `This rule doesn't exist!`);

    sandbox.restore();
});
