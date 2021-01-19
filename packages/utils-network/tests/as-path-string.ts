import { URL } from 'url';
import { platform } from 'os';

import test from 'ava';

import { asPathString } from '../src';

test('asPathString returns the path name of an "http://" URL', (t) => {
    const url = new URL('https://myresource.com/my/path');
    const expected = '/my/path';
    const actual = asPathString(url);

    t.is(actual, expected, `asPathString doesn't return the path name of an http:// URL`);
});

test('asPathString returns the encoded path name of an "https://" URL', (t) => {
    const url = new URL('https://myresource.com/my/path/%5B-dont-%20-decode-%5D');
    const expected = '/my/path/%5B-dont-%20-decode-%5D';
    const actual = asPathString(url);

    t.is(actual, expected, `asPathString doesn't return the encoded path name of an https:// URL`);
});

test('asPathString returns the decoded path name of an "file:///" URL', (t) => {
    const url = new URL('file:///my/path/%5Bdecode%20me%5D');
    const expected = '/my/path/[decode me]';
    const actual = asPathString(url);

    t.is(actual, expected, `asPathString doesn't return the decoded path name of an file:/// URL`);
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
