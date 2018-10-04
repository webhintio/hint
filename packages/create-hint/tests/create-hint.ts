import * as path from 'path';

import * as proxyquire from 'proxyquire';
import * as sinon from 'sinon';
import test from 'ava';

import * as handlebarsUtils from '../src/handlebars-utils';

const inquirer = { prompt() { } };
const writeFileAsyncModule = { default() { } };
const isOfficialModule = { default() { } };

const fsExtra = { copy() { } };
const mkdirp = (dir: string, callback: Function) => {
    callback();
};

const dependencies = {
    '../src/handlebars-utils': handlebarsUtils,
    'fs-extra': fsExtra,
    'hint/dist/src/lib/utils/fs/write-file-async': writeFileAsyncModule,
    'hint/dist/src/lib/utils/packages/is-official': isOfficialModule,
    inquirer,
    mkdirp
};

proxyquire('../src/create-hint', dependencies);

import newHint from '../src/create-hint';

test.serial('It creates a hint if the option multiple hints is false', async (t) => {
    const results = {
        category: 'pwa',
        description: 'An awesome new hint',
        multi: false,
        name: 'awesome hint',
        useCase: 'request'
    };
    const root = '/tests/';
    const sandbox = sinon.createSandbox();

    const fsExtraCopyStub = sandbox.stub(fsExtra, 'copy').resolves();
    const miscWriteFileAsyncStub = sandbox.stub(writeFileAsyncModule, 'default').resolves();
    const handlebarsCompileTemplateStub = sandbox.stub(handlebarsUtils, 'compileTemplate').returns('');

    sandbox.stub(isOfficialModule, 'default').resolves(true);
    sandbox.stub(process, 'cwd').returns(root);
    sandbox.stub(inquirer, 'prompt').resolves(results);

    const result = await newHint();

    t.true(fsExtraCopyStub.args[0][0].endsWith('files'), 'Unexpected path for official files');
    t.is(fsExtraCopyStub.args[0][1], path.join(root, 'hint-awesome-hint'), 'Copy path is not the expected one');

    // index.ts, package.json, readme.md, tsconfig.json, hint.ts, tests/hint.ts
    t.is(handlebarsCompileTemplateStub.callCount, 6, `Handlebars doesn't complile the right number of files`);
    t.is(miscWriteFileAsyncStub.callCount, 6, 'Invalid number of files created');

    t.true(result);

    sandbox.restore();
});

test.serial('It creates a package with multiple hints', async (t) => {
    const packageResults = {
        description: 'An awesome new package',
        multi: true,
        name: 'awesome package'
    };
    const hint1Results = {
        again: true,
        category: 'pwa',
        description: 'An awesome hint 1',
        name: 'hint',
        useCase: 'request'
    };
    const hint2Results = {
        again: false,
        category: 'pwa',
        description: 'An awesome hint 2',
        name: 'awesome hint 2',
        useCase: 'request'
    };
    const root = '/tests/';
    const sandbox = sinon.createSandbox();

    const fsExtraCopyStub = sandbox.stub(fsExtra, 'copy').resolves();
    const miscWriteFileAsyncStub = sandbox.stub(writeFileAsyncModule, 'default').resolves();
    const handlebarsCompileTemplateStub = sandbox.stub(handlebarsUtils, 'compileTemplate').returns('');

    sandbox.stub(isOfficialModule, 'default').resolves(false);
    sandbox.stub(process, 'cwd').returns(root);
    sandbox.stub(inquirer, 'prompt')
        .onFirstCall()
        .resolves(packageResults)
        .onSecondCall()
        .resolves(hint1Results)
        .onThirdCall()
        .resolves(hint2Results);

    const result = await newHint();

    t.true(fsExtraCopyStub.args[0][0].endsWith('no-official-files'), 'Unexpected path for non official files');
    t.true(fsExtraCopyStub.args[1][0].endsWith('files'), 'Unexpected path for official files');
    t.is(fsExtraCopyStub.args[0][1], path.join(root, 'hint-awesome-package'), 'Copy path is not the expected one');
    t.is(fsExtraCopyStub.args[1][1], path.join(root, 'hint-awesome-package'), 'Copy path is not the expected one');

    // index.ts, package.json, readme.md, tsconfig.json, .hintrc, hint.ts * 2, tests/hint.ts * 2, docs/hint.md * 2
    t.is(handlebarsCompileTemplateStub.callCount, 11, `Handlebars doesn't complile the right number of files`);
    t.is(miscWriteFileAsyncStub.callCount, 11, 'Invalid number of files created');

    t.true(result);

    sandbox.restore();
});
