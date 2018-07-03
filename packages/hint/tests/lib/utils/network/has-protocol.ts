import test from 'ava';

import hasProtocol from '../../../../src/lib/utils/network/has-protocol';

test('hasProtocol checks if a URL has uses the given protocol', (t) => {
    const url = 'https://myresource.com/';
    const containsProtocol = hasProtocol(url, 'https:');
    const doesnotContainProtocol = hasProtocol(url, 'ftp:');

    t.true(containsProtocol, `hasProtocol doesn't detect correctly the protocol https:`);
    t.false(doesnotContainProtocol, `hasProtocol doesn't detect correctly the protocol ftp:`);
});
