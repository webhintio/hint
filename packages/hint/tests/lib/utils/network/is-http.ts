import test from 'ava';

import isHTTP from '../../../../src/lib/utils/network/is-http';

test('isHTTP detects if the URL is HTTP or not', (t) => {
    const noHttpUri = 'https://myresource.com/';
    const httpUri = 'http://somethinghere';

    t.false(isHTTP(noHttpUri), `isHTTP doesn't detect correctly ${noHttpUri} is not a HTTP URI`);
    t.true(isHTTP(httpUri), `isHTTP doesn't detect correctly ${httpUri} is a HTTP URI`);
});
