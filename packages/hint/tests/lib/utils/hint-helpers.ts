import { normalize } from 'path';

import test from 'ava';

import * as hintHelpers from '../../../src/lib/utils/hint-helpers';

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
    const includedHeaders = hintHelpers.getIncludedHeaders(headers, included);

    t.deepEqual(includedHeaders, ['header-1', 'header-2']);
});

test('getIncludedHeaders - some headers included', (t) => {
    const included = ['Header-1', 'header-5'];
    const includedHeaders = hintHelpers.getIncludedHeaders(headers, included);

    t.deepEqual(includedHeaders, ['header-1']);
});

test('getIncludedHeaders - none included', (t) => {
    const included = ['header-5', 'header-6'];
    const includedHeaders = hintHelpers.getIncludedHeaders(headers, included);

    t.deepEqual(includedHeaders, []);
});

test('getIncludedHeaders - no included headers', (t) => {
    const includedHeaders = hintHelpers.getIncludedHeaders(headers);

    t.deepEqual(includedHeaders, []);
});

/*
 * ------------------------------------------------------------------------------
 * mergeIgnoreIncludeArrays tests
 * ------------------------------------------------------------------------------
 */

test('mergeIgnoreIncludeArrays - new headers are included', (t) => {
    const included = ['header-4', 'header-5'];
    const includedHeaders = hintHelpers.mergeIgnoreIncludeArrays(headersArray, undefined, included); // eslint-disable-line no-undefined

    t.deepEqual(includedHeaders, ['header-1', 'header-2', 'header-3', 'header-4', 'header-5']);
});

test('mergeIgnoreIncludeArrays - headers are excluded', (t) => {
    const excluded = ['header-1', 'header-2'];
    const includedHeaders = hintHelpers.mergeIgnoreIncludeArrays(headersArray, excluded);

    t.deepEqual(includedHeaders, ['header-3', 'header-4']);
});

test('mergeIgnoreIncludeArrays - some included, some excluded', (t) => {
    const included = ['header-5', 'header-6'];
    const excluded = ['header-1', 'header-2'];
    const includedHeaders = hintHelpers.mergeIgnoreIncludeArrays(headersArray, excluded, included);

    t.deepEqual(includedHeaders, ['header-3', 'header-4', 'header-5', 'header-6']);
});

/*
 * ------------------------------------------------------------------------------
 * getHintPath tests
 * ------------------------------------------------------------------------------
 */

test('getHintPath - performs a `require.resolve` of the top level of the given path', (t) => {
    // We are looking for the main hint package
    const expected = normalize('dist/src/lib/engine.js');
    const hintPath = hintHelpers.getHintPath(__filename);

    t.true(hintPath.endsWith(expected), `hintPath doesn't end with expected path:
${hintPath}
${expected}`);
});

test.serial('getHintPath - constructs a path using "../src/{$currentFileName}" if the package is supposed to be multihint', (t) => {
    const expected = normalize('dist/tests/lib/src/hint-helpers.js');
    const hintPath = hintHelpers.getHintPath(__filename, true);

    t.true(hintPath.endsWith(expected), `hintPath doesn't end with expected path:
${hintPath}
${expected}`);
});
