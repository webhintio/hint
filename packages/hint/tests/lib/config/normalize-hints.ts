import test from 'ava';
import normalizeHints from '../../../src/lib/config/normalize-hints';
import { HintsConfigObject } from '../../../src/lib/types';

test(`should normalize basic hints`, (t) => {
    const hints = [
        'hint1',
        'hint2:error',
        'hint3:warning',
        'hint4:off'
    ];

    const expected: HintsConfigObject = {
        hint1: 'error',
        hint2: 'error',
        hint3: 'warning',
        hint4: 'off'
    };

    t.deepEqual(normalizeHints(hints), expected);
});

test(`should normalize hints including array`, (t) => {
    const hints = [
        'hint1',
        ['hint2', { customization1: 'value1' }]
    ];

    const expected: HintsConfigObject = {
        hint1: 'error',
        hint2: ['error', { customization1: 'value1' }]
    };

    t.deepEqual(normalizeHints(hints), expected);
});

test(`should normalize hints with shorthand prefixes`, (t) => {
    const hints = [
        '?hint1',
        '-hint2',
        ['?hint3', { customization1: 'value1' } as any]
    ];

    const expected: HintsConfigObject = {
        hint1: 'warning',
        hint2: 'off',
        hint3: ['warning', { customization1: 'value1' }]
    };

    t.deepEqual(normalizeHints(hints), expected);
});

test(`should throw invalid hint specified error when providing invalid hint`, (t) => {
    const hints = [1] as any;

    t.throws(() => {
        normalizeHints(hints);
    }, 'Invalid hint type specified: "1". Arrays and objects are supported.');
});

test(`should maintain backwards compatibility by returning objects`, (t) => {
    const hints: HintsConfigObject = { hint1: 'error' };

    t.deepEqual(normalizeHints(hints), hints);
});
