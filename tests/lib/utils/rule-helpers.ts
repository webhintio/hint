import test from 'ava';

import * as ruleHelpers from '../../../src/lib/utils/rule-helpers';

// ------------------------------------------------------------------------------
// getIncludedHeaders tests
// ------------------------------------------------------------------------------

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

// ------------------------------------------------------------------------------
// mergeIgnoreIncludeArrays tests
// ------------------------------------------------------------------------------

test('mergeIgnoreIncludeArrays - new headers are included', (t) => {
    const included = ['header-4', 'header-5'];
    const includedHeaders = ruleHelpers.mergeIgnoreIncludeArrays(headersArray, undefined, included); //eslint-disable-line no-undefined

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

// ------------------------------------------------------------------------------
// getRuleName tests
// ------------------------------------------------------------------------------

test('getRuleName - returns basename of path not ending with /', (t) => {
    const path = '/rules/rule-id';
    const ruleName = ruleHelpers.getRuleName(path);

    t.deepEqual(ruleName, 'rule-id');
});

test('getRuleName - returns basename of path ending with /', (t) => {
    const path = '/rules/rule-id/';
    const ruleName = ruleHelpers.getRuleName(path);

    t.deepEqual(ruleName, 'rule-id');
});
