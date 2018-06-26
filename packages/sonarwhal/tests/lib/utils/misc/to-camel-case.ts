import test from 'ava';

import toCamelCase from '../../../../src/lib/utils/misc/to-camel-case';

test('toCamelCase transforms a - separated string to camelCase', (t) => {
    const source = 'this-is-a-string';
    const expected = 'thisIsAString';
    const transformed = toCamelCase(source);

    t.is(transformed, expected, `${transformed} !== ${expected}`);
});
