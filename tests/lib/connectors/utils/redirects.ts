import test from 'ava';

import { RedirectManager } from '../../../../src/lib/connectors/utils/redirects';

test.beforeEach((t) => {
    t.context.redirects = new RedirectManager();
});

test(`redirectManager returns 0 hops if none added`, (t) => {
    const redirects = t.context.redirects;
    const hops = redirects.calculate('http://example.com');

    t.is(hops.length, 0);
});

test(`redirectManager returns 0 hops if url doesn't have one`, (t) => {
    const redirects = t.context.redirects;

    redirects.add('http://example.com', 'http://redirect.com');

    const hops = redirects.calculate('http://mysite.com');

    t.is(hops.length, 0);
});

test(`redirectManager returns the expected number of hops for a single redirect`, (t) => {
    const redirects = t.context.redirects;

    redirects.add('http://example.com', 'http://redirect.com');

    const hops = redirects.calculate('http://example.com');

    t.deepEqual(hops, ['http://redirect.com']);
});

test(`redirectManager returns the expected number of hops for a single redirect`, (t) => {
    const redirects = t.context.redirects;

    redirects.add('http://hop2.com', 'http://hop1.com');
    redirects.add('http://hop3.com', 'http://hop2.com');
    redirects.add('http://hop4.com', 'http://hop3.com');

    const hops = redirects.calculate('http://hop4.com');

    t.deepEqual(hops, [
        'http://hop1.com',
        'http://hop2.com',
        'http://hop3.com'
    ]);
});

// TODO: test(`redirectManager supports multiple redirects for the same target`, (t)=>{});
