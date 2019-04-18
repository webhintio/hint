import test from 'ava';

import { capitalizeHeaderName } from '../../src/network/capitalize-header-name';

test('capitalizeHeaderName should capitalize a header with a simple word', (t) => {
    t.is(capitalizeHeaderName('vary'), 'Vary');
});

test('capitalizeHeaderName should capitalize a header with a compose word', (t) => {
    t.is(capitalizeHeaderName('content-type'), 'Content-Type');
});
