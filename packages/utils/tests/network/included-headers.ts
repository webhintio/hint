import test from 'ava';

import { includedHeaders as getIncludedHeaders } from '../../src/network';

const headers = {
    'header-1': 'value-1',
    'header-2': 'value-2',
    'header-3': 'value-3',
    'header-4': 'value-4'
};

test('includedHeaders - all headers included', (t) => {
    const included = ['header-1', 'header-2'];
    const includedHeaders = getIncludedHeaders(headers, included);

    t.deepEqual(includedHeaders, ['header-1', 'header-2']);
});

test('includedHeaders - some headers included', (t) => {
    const included = ['Header-1', 'header-5'];
    const includedHeaders = getIncludedHeaders(headers, included);

    t.deepEqual(includedHeaders, ['header-1']);
});

test('includedHeaders - none included', (t) => {
    const included = ['header-5', 'header-6'];
    const includedHeaders = getIncludedHeaders(headers, included);

    t.deepEqual(includedHeaders, []);
});

test('includedHeaders - no included headers', (t) => {
    const includedHeaders = getIncludedHeaders(headers);

    t.deepEqual(includedHeaders, []);
});
