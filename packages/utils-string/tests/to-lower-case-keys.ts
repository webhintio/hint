import test from 'ava';

import { toLowerCaseKeys } from '../src/to-lowercase-keys';

test('toLowerCaseKeys lowercases the properties of an object', (t) => {
    const obj = {
        SometHing: true,
        ANOTHER: false // eslint-disable-line sort-keys
    };

    const expected: [string, boolean][] = [['something', true], ['another', false]];
    const actual: [string, boolean][] = Object.entries(toLowerCaseKeys(obj));

    t.deepEqual(actual, expected, `Entries are not the same.`);
});
