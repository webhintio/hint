import test from 'ava';

import { comparePositions, positionToOffset } from '../src/hint-runner';

/*
 * ------------------------------------------------------------------------------
 * positionToOffset tests
 * ------------------------------------------------------------------------------
 */

test('positionToOffset - properly translates offset of file with LF line endings', (t) => {
    const document = 'one\ntwo\nthree\nfour';

    const actual = positionToOffset({column: 1, endColumn: 3, endLine: 2, line: 2}, document);
    const expected = [9, 11];

    t.deepEqual(actual, expected);
});

test('positionToOffset - properly translates offset of file with CRLF line endings', (t) => {
    const document = 'one\r\ntwo\r\nthree\r\nfour';

    const actual = positionToOffset({column: 1, endColumn: 3, endLine: 2, line: 2}, document);
    const expected = [11, 13];

    t.deepEqual(actual, expected);
});

test('positionToOffset - properly translates offset of file with no line endings', (t) => {
    const document = 'onetwothreefour';

    const actual = positionToOffset({column: 3, endColumn: 5, endLine: 0, line: 0}, document);
    const expected = [3, 5];

    t.deepEqual(actual, expected);
});


/*
 * ------------------------------------------------------------------------------
 * comparePositions tests
 * ------------------------------------------------------------------------------
 */

test('comparePositions - properly compares two positions with line difference', (t) => {
    const position1 = {column: 1, endColumn: 4, endLine: 2, line: 1};
    const position2 = {column: 1, endColumn: 4, endLine: 2, line: 2};

    t.deepEqual(comparePositions(position1, position2), false);
});

test('comparePositions - properly compares two positions with endLine difference', (t) => {
    const position1 = {column: 1, endColumn: 4, endLine: 3, line: 2};
    const position2 = {column: 1, endColumn: 4, endLine: 2, line: 2};

    t.deepEqual(comparePositions(position1, position2), false);
});

test('comparePositions - properly compares two positions with column difference', (t) => {
    const position1 = {column: 2, endColumn: 4, endLine: 2, line: 2};
    const position2 = {column: 1, endColumn: 4, endLine: 2, line: 2};

    t.deepEqual(comparePositions(position1, position2), false);
});

test('comparePositions - properly compares two positions with endColumn difference', (t) => {
    const position1 = {column: 2, endColumn: 4, endLine: 2, line: 2};
    const position2 = {column: 2, endColumn: 5, endLine: 2, line: 2};

    t.deepEqual(comparePositions(position1, position2), false);
});

test('comparePositions - properly compares two identical positions', (t) => {
    const position1 = {column: 1, endColumn: 4, endLine: 2, line: 2};
    const position2 = {column: 1, endColumn: 4, endLine: 2, line: 2};

    t.deepEqual(comparePositions(position1, position2), true);
});
