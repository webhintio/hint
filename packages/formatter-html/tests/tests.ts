import test from 'ava';
import * as proxyquire from 'proxyquire';
import * as sinon from 'sinon';

const fsExtra = {
    copy() { },
    mkdirp() { },
    outputFile() { },
    remove() { }
};

proxyquire('../src/formatter', { 'fs-extra': fsExtra });

import HTMLFormatter from '../src/formatter';
import Result from '../src/result';
import * as problems from './fixtures/list-of-problems';
import { Category } from 'hint/dist/src/lib/enums/category';

const utils = require('../src/utils');

test.beforeEach((t) => {
    t.context.fsExtra = fsExtra;
});

test(`HTML formatter returns the right object`, async (t) => {
    const formatter = new HTMLFormatter();

    const result: Result = await formatter.format(problems.noproblems, 'http://example.com');

    t.plan((result.categories.length * 3) + 3);

    t.is(result.categories.length, 7);
    t.is(result.errors, 0);
    t.is(result.warnings, 0);

    result.categories.forEach((cat) => {
        t.is(cat.hints.length, 0);
        t.is(cat.errors, 0);
        t.is(cat.warnings, 0);
    });
});

test(`HTML formatter return the right number of erros and warnings`, async (t) => {
    const formatter = new HTMLFormatter();

    const result: Result = await formatter.format(problems.multipleproblems, 'http://example.com');

    t.plan(14);

    t.is(result.categories.length, 7);
    t.is(result.errors, 2);
    t.is(result.warnings, 3);

    const otherCategory = result.getCategoryByName(Category.other);
    const devCategory = result.getCategoryByName(Category.development);

    if (otherCategory) {
        t.is(otherCategory.hints.length, 1);
        t.is(otherCategory.errors, 1);
        t.is(otherCategory.warnings, 3);

        const hint = otherCategory.getHintByName('random-hint');

        if (hint) {
            t.is(hint.problems.length, 4);
            t.is(hint.count, 4);
        }
    }

    if (devCategory) {
        t.is(devCategory.hints.length, 1);
        t.is(devCategory.errors, 1);
        t.is(devCategory.warnings, 0);

        const hint = devCategory.getHintByName('axe');

        if (hint) {
            t.is(hint.problems.length, 1);
            t.is(hint.count, 1);
            t.is(hint.thirdPartyInfo.link, 'https://github.com/dequelabs/axe-core');
        }
    }
});

test.serial(`HTML formatter create copy and generate the right files`, async (t) => {
    const sandbox = sinon.createSandbox();

    sandbox.spy(fsExtra, 'copy');
    sandbox.spy(fsExtra, 'remove');
    sandbox.spy(fsExtra, 'mkdirp');
    sandbox.spy(fsExtra, 'outputFile');

    const formatter = new HTMLFormatter();

    await formatter.format(problems.noproblems, 'http://example.com', { config: {} });

    t.true(t.context.fsExtra.copy.calledOnce);
    t.true(t.context.fsExtra.remove.calledOnce);
    t.true(t.context.fsExtra.mkdirp.calledOnce);
    t.true(t.context.fsExtra.outputFile.calledTwice);

    sandbox.restore();
});

test.serial(`HTML formatter shoudn't copy and generate any file if option noGenerateFiles is passed`, async (t) => {
    const sandbox = sinon.createSandbox();

    sandbox.spy(fsExtra, 'copy');
    sandbox.spy(fsExtra, 'remove');
    sandbox.spy(fsExtra, 'mkdirp');
    sandbox.spy(fsExtra, 'outputFile');

    const formatter = new HTMLFormatter();

    await formatter.format(problems.noproblems, 'http://example.com', { noGenerateFiles: true });

    t.false(t.context.fsExtra.copy.called);
    t.false(t.context.fsExtra.remove.called);
    t.false(t.context.fsExtra.mkdirp.called);
    t.false(t.context.fsExtra.outputFile.called);

    sandbox.restore();
});

test(`cutCodeString should do nothing if there code is short`, (t) => {
    const testString = '<a href="https://webhint.io" target="_blank" rel="noopener noreferrer">This HTML is not long enough</a>';

    const result = utils.cutCodeString(testString);

    t.is(result, testString);
});

test(`cutCodeString should cut the string it it is too long`, (t) => {
    const testString = `<div>
        <img src="https://webhint.io/static/images/sonar-logo-4fa31d71a3.svg" alt="webhint" class="header__logo navbar__navitem" />
        <a href="https://webhint.io/docs/user-guide/rules/rule-no-http-redirects/" target="_blank" rel="noopener noreferrer">
            This is a long HTML and it will be cut a little bit
        </a>
    </div>`;
    const expectedString = `<div>
        <img src="https://webhint.io/static/images/sonar-logo-4fa31d71a3.svg" alt="webhint" class="header__logo navbar … blank" rel="noopener noreferrer">
            This is a long HTML and it will be cut a little bit
        </a>
    </div>`;
    const result = utils.cutCodeString(testString);

    t.is(result, expectedString);
});

test(`cutUrlString should do nothing if there code is short`, (t) => {
    const testString = 'https://webhint.io';

    const result = utils.cutUrlString(testString);

    t.is(result, testString);
});

test(`cutUrlString should cut the string it it is too long`, (t) => {
    const testString = 'https://webhint.io/docs/user-guide/rules/rule-no-http-redirects/';

    const result = utils.cutUrlString(testString);

    t.is(result, 'https://webhint.io/docs … rule-no-http-redirects/');
});

test(`linkify should do nothing if there is no link`, (t) => {
    const testString = 'test string';

    const result = utils.linkify(testString);

    t.is(result, testString);
});

test(`linkify should create a link if there is a link`, (t) => {
    const testString = 'this text contains https://webhint.io a link';

    const result = utils.linkify(testString);

    t.is(result, 'this text contains <a href="https://webhint.io">https://webhint.io</a> a link');
});

test(`normalizePosition should do nothing if there is no position or position is -1`, (t) => {
    const position = '';
    const secondPosition = '-1';

    const result = utils.normalizePosition(position);
    const result2 = utils.normalizePosition(secondPosition);

    t.is(result, '');
    t.is(result2, '');
});

test(`normalizePosition should normalize the position`, (t) => {
    const position = '3';

    const result = utils.normalizePosition(position);

    t.is(result, ':3');
});

test(`noIssues should return true if all the hints have passed`, (t) => {
    const category = { hints: [{ status: 'pass' }, { status: 'pass' }] };

    const result = utils.noIssues(category);

    t.true(result);
});

test(`noIssues should return false if any hint has failed`, (t) => {
    const category = { hints: [{ status: 'pass' }, { status: 'error' }] };

    const result = utils.noIssues(category);

    t.false(result);
});

test(`noPending should return true if all the hints are not pending`, (t) => {
    const category = { hints: [{ status: 'pass' }, { status: 'pass' }] };

    const result = utils.noPending(category);

    t.true(result);
});

test(`noPending should return false if any hint is not pending`, (t) => {
    const category = { hints: [{ status: 'pass' }, { status: 'pending' }] };

    const result = utils.noPending(category);

    t.false(result);
});

test(`filterErrorsAndWarnings should return the hints that have fail`, (t) => {
    const category = { hints: [{ status: 'pass' }, { status: 'error' }] };

    const result = utils.filterErrorsAndWarnings(category);

    t.is(result.length, 1);
});

test(`filterErrorsAndWarnings should return an empty array if category doesn't exists`, (t) => {
    const result = utils.filterErrorsAndWarnings(null);

    t.is(result.length, 0);
});
