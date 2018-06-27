import test from 'ava';

import isRegularProtocol from '../../../../src/lib/utils/network/is-regular-protocol';


test('isRegularProtocol detects if a URI uses HTTP(S) or not', (t) => {
    const httpUri = 'http://myresource.com/';
    const httpsUri = 'https://somethinghere';
    const ftpUri = 'ftp://somethinghere';
    const noProtocol = 'something';

    t.true(isRegularProtocol(httpUri), `isRegularProtocol doesn't detect correctly ${httpUri} is a HTTP URI`);
    t.true(isRegularProtocol(httpsUri), `isRegularProtocol doesn't detect correctly ${httpsUri} is a HTTPS URI`);
    t.false(isRegularProtocol(ftpUri), `isRegularProtocol doesn't detect correctly ${ftpUri} is a FTP URI`);
    t.true(isRegularProtocol(noProtocol), `isRegularProtocol doesn't detect correctly ${noProtocol} doesn't have a protocol`);
});
