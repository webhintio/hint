import test from 'ava';

import { cwd } from '../../src/fs';

test('cwd has to return the same as process.cwd', (t) => {
    const expected = process.cwd();

    t.is(cwd(), expected);
});
