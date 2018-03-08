import test from 'ava';
import * as proxyquire from 'proxyquire';

import * as sinon from 'sinon';

const path = { sep: '\\' };

proxyquire('../../../src/lib/utils/rule-helpers', { path });

import * as ruleHelpers from '../../../src/lib/utils/rule-helpers';

/*
 * ------------------------------------------------------------------------------
 * getIncludedHeaders tests
 * ------------------------------------------------------------------------------
 */

const headers = {
    'header-1': 'value-1',
    'header-2': 'value-2',
    'header-3': 'value-3',
    'header-4': 'value-4'
};

const headersArray = Object.keys(headers);

test('getIncludedHeaders - all headers included', (t) => {
    const included = ['header-1', 'header-2'];
    const includedHeaders = ruleHelpers.getIncludedHeaders(headers, included);

    t.deepEqual(includedHeaders, ['header-1', 'header-2']);
});

test('getIncludedHeaders - some headers included', (t) => {
    const included = ['Header-1', 'header-5'];
    const includedHeaders = ruleHelpers.getIncludedHeaders(headers, included);

    t.deepEqual(includedHeaders, ['header-1']);
});

test('getIncludedHeaders - none included', (t) => {
    const included = ['header-5', 'header-6'];
    const includedHeaders = ruleHelpers.getIncludedHeaders(headers, included);

    t.deepEqual(includedHeaders, []);
});

test('getIncludedHeaders - no included headers', (t) => {
    const includedHeaders = ruleHelpers.getIncludedHeaders(headers);

    t.deepEqual(includedHeaders, []);
});

/*
 * ------------------------------------------------------------------------------
 * mergeIgnoreIncludeArrays tests
 * ------------------------------------------------------------------------------
 */

test('mergeIgnoreIncludeArrays - new headers are included', (t) => {
    const included = ['header-4', 'header-5'];
    const includedHeaders = ruleHelpers.mergeIgnoreIncludeArrays(headersArray, undefined, included); // eslint-disable-line no-undefined

    t.deepEqual(includedHeaders, ['header-1', 'header-2', 'header-3', 'header-4', 'header-5']);
});

test('mergeIgnoreIncludeArrays - headers are excluded', (t) => {
    const excluded = ['header-1', 'header-2'];
    const includedHeaders = ruleHelpers.mergeIgnoreIncludeArrays(headersArray, excluded);

    t.deepEqual(includedHeaders, ['header-3', 'header-4']);
});

test('mergeIgnoreIncludeArrays - some included, some excluded', (t) => {
    const included = ['header-5', 'header-6'];
    const excluded = ['header-1', 'header-2'];
    const includedHeaders = ruleHelpers.mergeIgnoreIncludeArrays(headersArray, excluded, included);

    t.deepEqual(includedHeaders, ['header-3', 'header-4', 'header-5', 'header-6']);
});

/*
 * ------------------------------------------------------------------------------
 * getRuleName tests
 * ------------------------------------------------------------------------------
 */

test.serial('getRuleName - returns the right name of the rule for several combination of linux paths and rule names', (t) => {
    const names = [
        '/rules/something',
        '/rules/something/',
        '/rules/rule-something',
        '/rules/rule-something/',
        '/another/rules/something',
        '/another/rules/rule-something'
    ];

    const sandbox = sinon.createSandbox();

    sandbox.stub(path, 'sep').get(() => {
        return '/';
    });

    names.forEach((name) => {
        const ruleName = ruleHelpers.getRuleName(name);

        t.deepEqual(ruleName, 'something');
    });

    sandbox.restore();
});

test.serial('getRuleName - returns the right name of the rule for several combination of windows paths and rule names', (t) => {
    const names = [
        'c:\\rules\\something',
        'c:\\rules\\something\\',
        'c:\\rules\\rule-something',
        'c:\\rules\\rule-something\\',
        'c:\\another\\rules\\something',
        'c:\\another\\rules\\rule-something'
    ];

    const sandbox = sinon.createSandbox();

    sandbox.stub(path, 'sep').get(() => {
        return '\\';
    });

    names.forEach((name) => {
        const ruleName = ruleHelpers.getRuleName(name);

        t.deepEqual(ruleName, 'something');
    });

    sandbox.restore();
});

test.serial(`getRuleName - returns an empty string if it can't determine the rule name`, (t) => {
    const filePath = '/another/something/';

    const ruleName = ruleHelpers.getRuleName(filePath);

    t.deepEqual(ruleName, '');
});

test.serial(`getRuleName - returns a combined string if a package name is passed`, (t) => {
    const sandbox = sinon.createSandbox();

    sandbox.stub(path, 'sep').get(() => {
        return '/';
    });

    const filePath = '/another/rule-something';
    const ruleName = ruleHelpers.getRuleName(filePath, 'package');

    t.deepEqual(ruleName, 'package/something');
});
