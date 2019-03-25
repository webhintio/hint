import test from 'ava';

import { normalizeHeaderValue } from '../../src/network';

test('getHeaderValueNormalized returns the normalized value of a given header', (t) => {
    const headers = {
        'my-header': '  Something  ',
        'my-other-header': ' Another'
    };
    const myHeader = normalizeHeaderValue(headers, 'My-Header');

    t.is(myHeader, 'something', `getHeaderValueNormalized doesn't trim and lowerCase the value`);
});
test('getHeaderValueNormalized returns the default value if no header found', (t) => {
    const headers = {
        'my-header': '  Something  ',
        'my-other-header': ' Another'
    };
    const myHeader = normalizeHeaderValue(headers, 'my-header2', 'missing');

    t.is(myHeader, 'missing', `getHeaderValueNormalized doesn't trim and lowerCase the value`);
});
