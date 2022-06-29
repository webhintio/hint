import test from 'ava';

import { positionToOffset } from '../src/hint-runner';

/*
 * ------------------------------------------------------------------------------
 * positionToOffset tests
 * ------------------------------------------------------------------------------
 */

test('positionToOffset - properly translates offset of file with LF line endings', (t) => {
    const document = 'one\ntwo\nthree\nfour';

    const actual = positionToOffset({column: 1, endColumn: 3, endLine: 2, line: 2}, document);
    const expected = [9, 11];

    t.true(actual[0] === expected[0] && actual[1] === expected[1], `Offset differs from expected.
                Actual: [${actual[0]}, ${actual[1]}], Expected: [${expected[0]}, ${expected[1]}]`);
});

test('positionToOffset - properly translates offset of file with CRLF line endings', (t) => {
    const document = 'one\r\ntwo\r\nthree\r\nfour';

    const actual = positionToOffset({column: 1, endColumn: 3, endLine: 2, line: 2}, document);
    const expected = [11, 13];

    t.true(actual[0] === expected[0] && actual[1] === expected[1], `Offset differs from expected.
                Actual: [${actual[0]}, ${actual[1]}], Expected: [${expected[0]}, ${expected[1]}]`);
});

test('positionToOffset - properly translates offset of file with no line endings', (t) => {
    const document = 'onetwothreefour';

    const actual = positionToOffset({column: 3, endColumn: 5, endLine: 0, line: 0}, document);
    const expected = [3, 5];

    t.true(actual[0] === expected[0] && actual[1] === expected[1], `Offset differs from expected.
                Actual: [${actual[0]}, ${actual[1]}], Expected: [${expected[0]}, ${expected[1]}]`);
});
