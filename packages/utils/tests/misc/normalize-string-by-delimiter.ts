import test from 'ava';

import { normalizeStringByDelimiter } from '../../src/misc';

test(`normalizeStringByDelimiter returns a string replacing everithing that is not a letter or a number by the provided delimiter`, (t) => {
    t.is(normalizeStringByDelimiter(' test ', '*'), 'test');
    t.is(normalizeStringByDelimiter(' test test', '-'), 'test-test');
    t.is(normalizeStringByDelimiter(' te st ', '~'), 'te~st');
});
