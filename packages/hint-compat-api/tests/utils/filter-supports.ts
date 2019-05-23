import test from 'ava';

import { filterSupports } from '../../src/utils/filter-supports';

test('basic params work', (t) => {
    const passed = filterSupports('(display: grid)', ['chrome 74', 'edge 16', 'firefox 65']);

    t.deepEqual(passed, ['chrome 74', 'edge 16', 'firefox 65']);
});

test('browsers without @supports are excluded', (t) => {
    const passed = filterSupports('(display: grid)', ['chrome 74', 'ie 11']);

    t.deepEqual(passed, ['chrome 74']);
});

test('browsers without property support are excluded', (t) => {
    const passed = filterSupports('(grid: none)', ['chrome 74', 'edge 15']);

    t.deepEqual(passed, ['chrome 74']);
});

test('browsers without value support are excluded', (t) => {
    const passed = filterSupports('(display: grid)', ['chrome 74', 'edge 15']);

    t.deepEqual(passed, ['chrome 74']);
});

test('no list is returned when no support exists', (t) => {
    const passed = filterSupports('(display: grid)', ['edge 15']);

    t.is(passed, null);
});

test('not queries invert results', (t) => {
    const passed = filterSupports('not (display: grid)', ['chrome 74', 'edge 15']);

    t.deepEqual(passed, ['edge 15']);
});

test('browsers not in intersection of support are excluded', (t) => {
    const passed = filterSupports('(display: flex) and (display: grid)', ['chrome 74', 'edge 15']);

    t.deepEqual(passed, ['chrome 74']);
});

test('browsers in union of support are included', (t) => {
    const passed = filterSupports('(display: flex) or (display: grid)', ['chrome 74', 'edge 15']);

    t.deepEqual(passed, ['chrome 74', 'edge 15']);
});
