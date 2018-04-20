import * as path from 'path';
import * as proxyquire from 'proxyquire';
import * as sinon from 'sinon';
import test from 'ava';

import { CLIOptions } from '../../../../src/lib/types';
import * as handlebarsUtils from '../../../../src/lib/utils/handlebars';

const actions = ({ newRule: true } as CLIOptions);

const inquirer = { prompt() { } };
const misc = {
    isOfficial() { },
    writeFileAsync() { }
};
const fsExtra = { copy() { } };
const mkdirp = (dir, callback) => {
    callback();
};

proxyquire('../../../../src/lib/cli/wizards/new-rule', {
    '../../utils/handlebars': handlebarsUtils,
    '../../utils/misc': misc,
    'fs-extra': fsExtra,
    inquirer,
    mkdirp
});

import * as rule from '../../../../src/lib/cli/wizards/new-rule';

test.serial('If newRule is not an option, it should return false', async (t) => {
    const result = await rule.newRule({} as CLIOptions);

    t.false(result);
});

test.serial('It creates a rule if the option multiple rules is false', async (t) => {
    const results = {
        category: 'pwa',
        description: 'An awesome new rule',
        multi: false,
        name: 'awesome rule',
        useCase: 'request'
    };
    const root = '/tests/';
    const sandbox = sinon.sandbox.create();

    const fsExtraCopyStub = sandbox.stub(fsExtra, 'copy').resolves();
    const miscWriteFileAsyncStub = sandbox.stub(misc, 'writeFileAsync').resolves();
    const handlebarsCompileTemplateStub = sandbox.stub(handlebarsUtils, 'compileTemplate').returns('');

    sandbox.stub(misc, 'isOfficial').resolves(true);
    sandbox.stub(process, 'cwd').returns(root);
    sandbox.stub(inquirer, 'prompt').resolves(results);

    const result = await rule.newRule(actions);

    t.true(fsExtraCopyStub.args[0][0].endsWith('files'), 'Unexpected path for official files');
    t.is(fsExtraCopyStub.args[0][1], path.join(root, 'rule-awesome-rule'), 'Copy path is not the expected one');

    // index.ts, package.json, readme.md, tsconfig.json, rule.ts, tests/rule.ts
    t.is(handlebarsCompileTemplateStub.callCount, 6, `Handlebars doesn't complile the right number of files`);
    t.is(miscWriteFileAsyncStub.callCount, 6, 'Invalid number of files created');

    t.true(result);

    sandbox.restore();
});

test.serial('It creates a package with multiple rules', async (t) => {
    const packageResults = {
        description: 'An awesome new package',
        multi: true,
        name: 'awesome package'
    };
    const rule1Results = {
        again: true,
        category: 'pwa',
        description: 'An awesome rule 1',
        name: 'awesome rule 1',
        useCase: 'request'
    };
    const rule2Results = {
        again: false,
        category: 'pwa',
        description: 'An awesome rule 2',
        name: 'awesome rule 2',
        useCase: 'request'
    };
    const root = '/tests/';
    const sandbox = sinon.sandbox.create();

    const fsExtraCopyStub = sandbox.stub(fsExtra, 'copy').resolves();
    const miscWriteFileAsyncStub = sandbox.stub(misc, 'writeFileAsync').resolves();
    const handlebarsCompileTemplateStub = sandbox.stub(handlebarsUtils, 'compileTemplate').returns('');

    sandbox.stub(misc, 'isOfficial').resolves(false);
    sandbox.stub(process, 'cwd').returns(root);
    sandbox.stub(inquirer, 'prompt')
        .onFirstCall()
        .resolves(packageResults)
        .onSecondCall()
        .resolves(rule1Results)
        .onThirdCall()
        .resolves(rule2Results);

    const result = await rule.newRule(actions);

    t.true(fsExtraCopyStub.args[0][0].endsWith('no-official-files'), 'Unexpected path for non official files');
    t.true(fsExtraCopyStub.args[1][0].endsWith('files'), 'Unexpected path for official files');
    t.is(fsExtraCopyStub.args[0][1], path.join(root, 'rule-awesome-package'), 'Copy path is not the expected one');
    t.is(fsExtraCopyStub.args[1][1], path.join(root, 'rule-awesome-package'), 'Copy path is not the expected one');

    // index.ts, package.json, readme.md, tsconfig.json, .sonarwhalrc, rule.ts * 2, tests/rule.ts * 2, docs/rule.md * 2
    t.is(handlebarsCompileTemplateStub.callCount, 11, `Handlebars doesn't complile the right number of files`);
    t.is(miscWriteFileAsyncStub.callCount, 11, 'Invalid number of files created');

    t.true(result);

    sandbox.restore();
});
