import { URL } from 'url';
import { platform } from 'os';

import test from 'ava';

import asPathString from '../../../../src/lib/utils/network/as-path-string';

test('asPathString returns the path name of an "http://" URL', (t) => {
    const url = new URL('https://myresource.com/my/path');
    const expected = '/my/path';
    const actual = asPathString(url);

    t.is(actual, expected, `asPathString doesn't return the path name of an http:// URL`);
});

test('asPathString returns the path name of of a file:// URL', (t) => {
    const expected = platform() === 'win32' ?
        'c:/my/path' :
        '/my/path';
    const url = platform() === 'win32' ?
        new URL(`file:///c:/my/path`) :
        new URL(`file:///my/path`);

    const actual = asPathString(url);

    t.is(actual, expected, `asPathString doesn't return the path name of a file:// URL`);
});
