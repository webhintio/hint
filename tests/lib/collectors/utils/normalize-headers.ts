import test from 'ava';

import { normalizeHeaders } from '../../../../src/lib/collectors/utils/normalize-headers';

test(`'normalizeHeaders' returns 'null' for 'null'`, (t) => {
    t.is(normalizeHeaders(null), null);
});

test(`'normalizeHeaders' returns 'null' for 'undefined'`, (t) => {
    t.is(normalizeHeaders(undefined), null); // eslint-disable-line no-undefined
});

test(`'normalizeHeaders' returns '{}' for '{}'`, (t) => {
    t.deepEqual(normalizeHeaders({}), {});
});

test(`'normalizeHeaders' returns object with lowercase headers field names`, (t) => {
    const headers = {
        'Content-Type': 'text/html; charset=utf-8',
        Vary: 'Accept-Encoding',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block'
    };

    const expectedHeaders = {
        'content-type': 'text/html; charset=utf-8',
        vary: 'Accept-Encoding',
        'x-content-type-options': 'nosniff',
        'x-frame-options': 'DENY',
        'x-xss-protection': '1; mode=block'
    };

    t.deepEqual(normalizeHeaders(headers), expectedHeaders);
});
