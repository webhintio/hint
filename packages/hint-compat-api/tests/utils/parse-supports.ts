import test from 'ava';

import { parseSupports } from '../../src/utils/parse-supports';

test('well-formed params work', (t) => {
    t.deepEqual(parseSupports('(display: grid)'), {
        nodes: [
            {
                prop: 'display',
                value: 'grid'
            }
        ],
        type: 'and'
    });
});

test('malformed params fail', (t) => {
    t.is(parseSupports('(display: grid'), null);
    t.is(parseSupports('(display: grid))'), null);
    t.is(parseSupports('display: grid'), null);
});

test('handles parenthesis inside declaration values', (t) => {
    t.deepEqual(parseSupports('(transform: translateZ(10px) rotate(90deg))'), {
        nodes: [
            {
                prop: 'transform',
                value: 'translateZ(10px) rotate(90deg)'
            }
        ],
        type: 'and'
    });
});

test('top-level `not` works', (t) => {
    t.deepEqual(parseSupports('not (display: grid)'), {
        nodes: [
            {
                prop: 'display',
                value: 'grid'
            }
        ],
        type: 'not'
    });
});

test('top-level `and` works', (t) => {
    t.deepEqual(parseSupports('(display: grid) and (display: flex)'), {
        nodes: [
            {
                prop: 'display',
                value: 'grid'
            },
            {
                prop: 'display',
                value: 'flex'
            }
        ],
        type: 'and'
    });
});

test('top-level `or` works', (t) => {
    t.deepEqual(parseSupports('(display: grid) or (display: flex)'), {
        nodes: [
            {
                prop: 'display',
                value: 'grid'
            },
            {
                prop: 'display',
                value: 'flex'
            }
        ],
        type: 'or'
    });
});
