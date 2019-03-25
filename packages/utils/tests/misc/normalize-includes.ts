import test from 'ava';

import { normalizeIncludes } from '../../src/misc';

test('normalizeIncludes should return the right value', (t) => {
    const mainString = '    ThIs    is a noT nOrmaLIZed sTRing     ';

    t.true(normalizeIncludes(mainString, '             this              '));
    t.false(normalizeIncludes(mainString, 'sttring'));
    t.true(normalizeIncludes(mainString, 'norma'));
    t.true(normalizeIncludes(mainString, 'string'));
});
