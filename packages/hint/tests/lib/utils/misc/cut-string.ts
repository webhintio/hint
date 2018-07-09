import test from 'ava';

import cutString from '../../../../src/lib/utils/misc/cut-string';

test(`cutString returns a string if it's smaller than the threshold`, (t) => {
    const source = 'this-is-a-string';
    const transformed = cutString(source);

    t.is(transformed, source, `${transformed} !== ${source}`);
});

test(`cutString cuts the string and adds "…" if it is bigger than the threshold`, (t) => {
    const source = 'this-is-a-string';
    const expected = 'thi … ring';
    const transformed = cutString(source, 10);

    t.is(transformed, expected, `${transformed} !== ${expected}`);
});
