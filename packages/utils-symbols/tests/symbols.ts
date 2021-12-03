import test from 'ava';

import { symbols } from '../src';

test(`symbols.error returns the error symbol`, (t) => {
    const expected = '×';
    const errorSymbol = symbols.error;

    t.is(errorSymbol, expected);
});

test(`symbols.success returns the success symbol`, (t) => {
    const expected = '√';
    const successSymbol = symbols.success;

    t.is(successSymbol, expected);
});
