import test from 'ava';
import normalizeRules from '../../../src/lib/utils/normalize-rules';

test(`should normalize basic rules`, (t) => {
    const rules = [
        'rule1',
        'rule2:error',
        'rule3:warning',
        'rule4:off'
    ];

    const expected = {
        rule1: 'error',
        rule2: 'error',
        rule3: 'warning',
        rule4: 'off'
    };

    t.deepEqual(normalizeRules(rules), expected);
});

test(`should normalize rules including array`, (t) => {
    const rules = [
        'rule1',
        ['rule2', { customization1: 'value1'}]
    ];

    const expected = {
        rule1: 'error',
        rule2: ['error', { customization1: 'value1' }]
    };

    t.deepEqual(normalizeRules(rules), expected);
});

test(`should normalize rules with shorthand prefixes`, (t) => {
    const rules = [
        '?rule1',
        '-rule2',
        ['?rule3', { customization1: 'value1' }]
    ];

    const expected = {
        rule1: 'warning',
        rule2: 'off',
        rule3: ['warning', { customization1: 'value1' }]
    };

    t.deepEqual(normalizeRules(rules), expected);
});

test(`should throw invalid rule specified error when providing invalid rule`, (t) => {
    const rules = [1];

    t.throws(() => {
        normalizeRules(rules);
    }, 'Invalid rule type specified: "1". Arrays and objects are supported.');
});

test(`should maintain backwards compatibility by returning objects`, (t) => {
    const rules = { rule1: 'error' };

    t.deepEqual(normalizeRules(rules), rules);
});
