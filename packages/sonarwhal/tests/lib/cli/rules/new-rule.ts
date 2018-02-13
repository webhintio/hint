import * as path from 'path';
import * as proxyquire from 'proxyquire';
import * as sinon from 'sinon';
import test from 'ava';

import { CLIOptions } from '../../../../src/lib/types';
import * as rulesCommon from '../../../../src/lib/cli/rules/common';
import * as handlebarsUtils from '../../../../src/lib/utils/handlebars';

const actions = ({ newRule: true } as CLIOptions);

const inquirer = { prompt() { } };
const misc = { writeFileAsync() { } };
const fsExtra = { copy() { } };
const mkdirp = (dir, callback) => {
    callback();
};

proxyquire('../../../../src/lib/cli/rules/new-rule', {
    '../../utils/handlebars': handlebarsUtils,
    '../../utils/misc': misc,
    './common': rulesCommon,
    'fs-extra': fsExtra,
    inquirer,
    mkdirp
});

import * as rule from '../../../../src/lib/cli/rules/new-rule';

test.beforeEach((t) => {
    sinon.stub(fsExtra, 'copy').resolves();
    sinon.stub(misc, 'writeFileAsync').resolves();
    sinon.stub(handlebarsUtils, 'compileTemplate').returns('');

    t.context.fs = fsExtra;
    t.context.misc = misc;
    t.context.handlebars = handlebarsUtils;
});

test.afterEach.always((t) => {
    t.context.fs.copy.restore();
    t.context.misc.writeFileAsync.restore();
    t.context.handlebars.compileTemplate.restore();
});


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

    sandbox.stub(rulesCommon, 'processDir').get(() => {
        return root;
    });
    sandbox.stub(inquirer, 'prompt').resolves(results);

    const result = await rule.newRule(actions);

    t.true(t.context.fs.copy.args[0][0].endsWith('files'), 'Unexpected path for external files');
    t.is(t.context.fs.copy.args[0][1], path.join(root, 'rule-awesome-rule'), 'Copy path is not the expected one');

    // changelog, index.ts, license.txt, package.json, readme.md, tsconfig.json, .sonarwhalrc, rule.ts, tests/rule.ts
    t.is(t.context.handlebars.compileTemplate.callCount, 9, `Handlebars doesn't complile the right number of files`);
    t.is(t.context.misc.writeFileAsync.callCount, 9, 'Invalid number of files created');

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

    sandbox.stub(rulesCommon, 'processDir').get(() => {
        return root;
    });
    sandbox.stub(inquirer, 'prompt')
        .onFirstCall()
        .resolves(packageResults)
        .onSecondCall()
        .resolves(rule1Results)
        .onThirdCall()
        .resolves(rule2Results);

    const result = await rule.newRule(actions);

    t.true(t.context.fs.copy.args[0][0].endsWith('files'), 'Unexpected path for common files');
    t.is(t.context.fs.copy.args[0][1], path.join(root, 'rule-awesome-package'), 'Copy path is not the expected one');

    // changelog, index.ts, license.txt, package.json, readme.md, tsconfig.json, .sonarwhalrc, rule.ts * 2, tests/rule.ts * 2
    t.is(t.context.handlebars.compileTemplate.callCount, 11, `Handlebars doesn't complile the right number of files`);
    t.is(t.context.misc.writeFileAsync.callCount, 11, 'Invalid number of files created');

    t.true(result);

    sandbox.restore();
});
