import test from 'ava';

import { resolveUrl } from '../src/resolver';

test(`resolveUrl(favicon.ico, https://www.example.com) --> https://www.example.com/favicon.ico`, (t) => {
    const path = 'favicon.ico';
    const domain = 'https://www.example.com';
    const result = resolveUrl(path, domain);

    t.is(result, `${domain}/${path}`);
});

test(`resolveUrl(/favicon.ico, https://www.example.com) --> https://www.example.com/favicon.ico`, (t) => {
    const path = '/favicon.ico';
    const domain = 'https://www.example.com';
    const result = resolveUrl(path, domain);

    t.is(result, `${domain}${path}`);
});

test(`resolveUrl(/favicon.ico, https://www.example.com/something) --> https://www.example.com/favicon.ico`, (t) => {
    const path = '/favicon.ico';
    const domain = 'https://www.example.com/something';
    const result = resolveUrl(path, domain);

    t.is(result, `https://www.example.com/favicon.ico`);
});

test(`resolveUrl(favicon.ico, https://www.example.com/something/) --> https://www.example.com/something/favicon.ico`, (t) => {
    const path = 'favicon.ico';
    const domain = 'https://www.example.com/something/';
    const result = resolveUrl(path, domain);

    t.is(result, `https://www.example.com/something/favicon.ico`);
});

test(`resolveUrl(https://my.cdn.com/favicon.ico, https://www.example.com) --> https://my.cdn.com/favicon.ico`, (t) => {
    const path = 'https://my.cdn.com/favicon.ico';
    const domain = 'https://www.example.com';
    const result = resolveUrl(path, domain);

    t.is(result, `https://my.cdn.com/favicon.ico`);
});
