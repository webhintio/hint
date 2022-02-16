import test from 'ava';

import { rxLocalFile } from '../src';

test('isLocalFile detects local file URLs', (t) => {
    t.true(rxLocalFile.test('file://C:/users/foo/bar'));
});

test('isLocalFile detects local file URLs in UNIX style', (t) => {
    t.true(rxLocalFile.test('file:///Users/foo/bar'));
});

test('isLocalFile ignores public URLs', (t) => {
    t.false(rxLocalFile.test('http://bing.com/foo/bar'));
});
