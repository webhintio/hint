import test from 'ava';

import { isLocalhost } from '../src';

test('isLocalhost detects localhost URLs', (t) => {
    t.true(isLocalhost('http://localhost/foo/bar'));
});

test('isLocalhost ignores public URLs', (t) => {
    t.false(isLocalhost('http://bing.com/foo/bar'));
});

test('isLocalhost ignores localhost sub-domains', (t) => {
    t.false(isLocalhost('http://localhost.foo.com/foo/bar'));
});

test('isLocalhost detects loopback URLs', (t) => {
    t.true(isLocalhost('http://127.0.0.1/foo/bar'));
});

test('isLocalhost ignores other IP-based URLs', (t) => {
    t.false(isLocalhost('http://198.0.0.1/foo/bar'));
});

test('isLocalhost detects HTTPS localhost URLs', (t) => {
    t.true(isLocalhost('https://localhost/foo/bar'));
});

test('isLocalhost detects localhost URLs with port', (t) => {
    t.true(isLocalhost('http://localhost:8080/foo/bar'));
});
