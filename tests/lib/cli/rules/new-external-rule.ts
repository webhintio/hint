import * as path from 'path';
import * as proxyquire from 'proxyquire';
import * as sinon from 'sinon';
import test from 'ava';

import { CLIOptions } from '../../../../src/lib/types';
import * as rulesCommon from '../../../../src/lib/cli/rules/common';

const actions = ({ newRule: true } as CLIOptions);

const inquirer = { prompt() { } };
const fsExtra = {
    copy() { },
    move() { },
    remove() { }
};
const utils = {
    readFileAsync() { },
    writeFileAsync() { }
};

const globby = sinon.stub();

const readmeMD = `# rule-name
rule-description`;

const newReadmeMD = `# awesome-rule
An aweseme new rule`;

proxyquire('../../../../src/lib/cli/rules/new-external-rule', {
    '../../utils/misc': utils,
    './common': rulesCommon,
    'fs-extra': fsExtra,
    globby,
    inquirer
});

import * as rule from '../../../../src/lib/cli/rules/new-external-rule';

test.beforeEach((t) => {
    sinon.stub(fsExtra, 'copy').resolves();
    sinon.stub(fsExtra, 'move').resolves();
    sinon.stub(fsExtra, 'remove').resolves();
    sinon.stub(utils, 'readFileAsync').resolves();
    sinon.stub(utils, 'writeFileAsync').resolves();

    t.context.fs = fsExtra;
    t.context.utils = utils;
    t.context.globby = globby;
});

test.afterEach.always((t) => {
    t.context.fs.copy.restore();
    t.context.fs.move.restore();
    t.context.fs.remove.restore();

    t.context.utils.readFileAsync.restore();
    t.context.utils.writeFileAsync.restore();
});


test.serial('If newExternalRule is not an option, it should return false', async (t) => {
    const result = await rule.newExternalRule({} as CLIOptions);

    t.false(result);
});

test.serial('If newExternalRule is executed inside the main sonarwhal project, it should return false', async (t) => {
    const result = await rule.newExternalRule(actions);

    t.false(result);
});

test.serial('It creates the right content', async (t) => {
    const files = ['readme.md', 'rule-template/rule.ts'];
    const results = {
        'rule-description': 'An aweseme new rule',
        'rule-name': 'awesome rule'
    };
    const root = '/tests/';
    const sandbox = sinon.sandbox.create();
    const contextUtils = t.context.utils;
    const contextFs = t.context.fs;

    sandbox.stub(rulesCommon, 'processDir').get(() => {
        return root;
    });
    sandbox.stub(inquirer, 'prompt').resolves(results);
    (contextUtils.readFileAsync as sinon.SinonStub).onFirstCall().resolves(readmeMD);
    (contextUtils.readFileAsync as sinon.SinonStub).onSecondCall().resolves('');

    globby.onFirstCall().resolves(files);
    globby.onSecondCall().resolves(['rule-template']);

    const result = await rule.newExternalRule(actions);

    t.is((contextFs.copy as sinon.SinonStub).args[0][1], path.join(root, 'sonarwhal-awesome-rule'), 'Copy path is not the expected one');
    t.is((contextUtils.writeFileAsync as sinon.SinonStub).args[0][1], newReadmeMD);
    t.is((contextFs.move as sinon.SinonStub).args[0][1], path.join('awesome-rule', 'rule.ts'), 'Move path is not the expected one');
    t.is((contextFs.remove as sinon.SinonStub).args[0][0], 'rule-template', 'Remove path is not the expected one');
    t.true(result);

    sandbox.restore();
});
