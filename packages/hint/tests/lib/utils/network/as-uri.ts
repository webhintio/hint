import test from 'ava';

import { getAsUri, getAsUris } from '../../../../src/lib/utils/network/as-uri';

test('getAsUri returns a URI for `http` protocol', (t) => {
    const uri = getAsUri('http://www.bing.com/');

    t.is(uri && uri.protocol, 'http:', `getAsUri didn't return a URI with the HTTP protocol`);
});

test('getAsUri returns a URI for `https` protocol', (t) => {
    const uri = getAsUri('https://www.bing.com/');

    t.is(uri && uri.protocol, 'https:', `getAsUri didn't return a URI with the HTTPS protocol`);
});

test('getAsUri returns a URI for `file` protocol', (t) => {
    const uri = getAsUri('file://../fixtures/empty.txt');

    t.is(uri && uri.protocol, 'file:', `getAsUri didn't return a URI with the file protocol`);
});

test('getAsUri returns a URI for a local file without a protocol', (t) => {
    const uri = getAsUri(`${__dirname}/../fixtures/empty.txt`);

    t.is(uri && uri.protocol, 'file:', `getAsUri didn't return a URI for a local file`);
});

test('getAsUri returns a URI for localhost', (t) => {
    const uri = getAsUri('localhost/test.html');

    t.is(uri && uri.protocol, 'http:', `getAsUri didn't return a URI for localhost`);
});

test('getAsUri returns `null` for invalid sources', (t) => {
    const uri = getAsUri('invalid');

    t.is(uri, null, `getAsUri returned a URI for an invalid source`);
});

test('getAsUris drops invalid URLs', (t) => {
    const uris = getAsUris(['localhost', 'invalid']);

    t.is(uris.length, 1, `getAsUris didn't return the expected number of URIs`);
});
