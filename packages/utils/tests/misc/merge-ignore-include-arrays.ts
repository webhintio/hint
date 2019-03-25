import test from 'ava';

import { mergeIgnoreIncludeArrays } from '../../src/misc';

const headers = {
    'header-1': 'value-1',
    'header-2': 'value-2',
    'header-3': 'value-3',
    'header-4': 'value-4'
};
const headersArray = Object.keys(headers);

test('mergeIgnoreIncludeArrays - new headers are included', (t) => {
    const included = ['header-4', 'header-5'];
    const includedHeaders = mergeIgnoreIncludeArrays(headersArray, undefined, included);

    t.deepEqual(includedHeaders, ['header-1', 'header-2', 'header-3', 'header-4', 'header-5']);
});

test('mergeIgnoreIncludeArrays - headers are excluded', (t) => {
    const excluded = ['header-1', 'header-2'];
    const includedHeaders = mergeIgnoreIncludeArrays(headersArray, excluded);

    t.deepEqual(includedHeaders, ['header-3', 'header-4']);
});

test('mergeIgnoreIncludeArrays - some included, some excluded', (t) => {
    const included = ['header-5', 'header-6'];
    const excluded = ['header-1', 'header-2'];
    const includedHeaders = mergeIgnoreIncludeArrays(headersArray, excluded, included);

    t.deepEqual(includedHeaders, ['header-3', 'header-4', 'header-5', 'header-6']);
});
