import test from 'ava';

import isHTTPS from '../../../../src/lib/utils/network/is-https';

test('isHTTPS detects if the URL is HTTP or not', (t) => {
    const noHttpsUri = 'http://myresource.com/';
    const httpsUri = 'https://somethinghere';

    t.false(isHTTPS(noHttpsUri), `isHTTPS doesn't detect correctly ${noHttpsUri} is not a HTTPS URI`);
    t.true(isHTTPS(httpsUri), `isHTTPS doesn't detect correctly ${httpsUri} is a HTTPS URI`);
});
