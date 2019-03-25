import test from 'ava';

import { prettyPrintArray } from '../../src/misc';

test(`prettyPrintArray returns an empty string if the array is empty`, (t) => {
    const expectedString = '';
    const result = prettyPrintArray([]);

    t.is(result, expectedString);
});

test(`prettyPrintArray returns the expected string`, (t) => {
    t.is(prettyPrintArray(['1']), `'1'`);
    t.is(prettyPrintArray(['1', '2']), `'1' and '2'`);
    t.is(prettyPrintArray(['1', '2', '3']), `'1', '2', and '3'`);
});
