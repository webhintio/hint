import test from 'ava';

import { toPascalCase } from '../../src/misc';

test(`toPascalCase returns a string in Pascal Case`, (t) => {
    const expected = 'ThisIsAString';
    const pascalCased = toPascalCase('this-is-a-string');

    t.is(pascalCased, expected);
});

test(`toPascalCase returns a string in Pascal Case even if the input doesn't have delimiter`, (t) => {
    const expected = 'Test';
    const pascalCased = toPascalCase('test');

    t.is(pascalCased, expected);
});

test(`toPascalCase returns an empty sting if passed`, (t) => {
    const expected = '';
    const pascalCased = toPascalCase('');

    t.is(pascalCased, expected);
});
