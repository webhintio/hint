import test from 'ava';

import * as configRules from '../../../src/lib/config/config-rules';
import { RuleConfig, IRule } from '../../../src/lib/types';
import { RuleScope } from '../../../src/lib/enums/rulescope';
import { RuleContext } from '../../../src/lib/rule-context';

class RuleEmptySchema implements IRule {

    public static readonly meta = { id: '', schema: [], scope: RuleScope.site }

    public constructor(context: RuleContext) {
        context.on('event', () => { });
    }
}

class RuleWithSchema implements IRule {

    public static readonly meta = {
        id: 'rule',
        schema: [{
            additionalProperties: false,
            definitions: {
                'string-array': {
                    items: { type: 'string' },
                    minItems: 1,
                    type: 'array',
                    uniqueItems: true
                }
            },
            properties: {
                ignore: { $ref: '#/definitions/string-array' },
                include: { $ref: '#/definitions/string-array' }
            },
            type: 'object'
        }],
        scope: RuleScope.site
    }

    public constructor(context: RuleContext) {
        context.on('event', () => { });
    }
}

test('getSeverity with an string should return the right value', (t) => {
    const data = new Map([
        ['off', 0],
        ['warning', 1],
        ['error', 2],
        ['invalid', null],
        ['', null]
    ]);

    for (const [key, value] of data) {
        const severity = configRules.getSeverity(key);

        t.is(severity, value);
    }
});

test('getSeverity with a number should return the right value', (t) => {
    const data = new Map([
        [0, 0],
        [1, 1],
        [2, 2],
        [3, null],
        [-1, null]
    ]);

    for (const [key, value] of data) {
        const severity = configRules.getSeverity(key);

        t.is(severity, value);
    }
});

test('getSeverity with an array should return the right value', (t) => {
    const data: Map<RuleConfig | Array<RuleConfig>, number> = new Map([
        [(['off', {}] as RuleConfig), 0],
        [(['warning', {}] as RuleConfig), 1],
        [(['error', {}] as RuleConfig), 2],
        [(['invalid', {}] as RuleConfig), null],
        [([0, {}] as RuleConfig), 0],
        [([1, {}] as RuleConfig), 1],
        [([2, {}] as RuleConfig), 2],
        [([3, {}] as RuleConfig), null],
        [([-1, {}] as RuleConfig), null]
    ]);

    for (const [key, value] of data) {
        const severity = configRules.getSeverity(key);

        t.is(severity, value);
    }
});

test('validate should return false if config is an object', (t) => {
    const valid = configRules.validate(RuleEmptySchema.meta, { warning: true }, '1');

    t.false(valid);
});

test('validate should throw an exception if the severity is not valid', (t) => {
    const data = new Set(['invalid', -1, ['invalid', {}]]);

    for (const value of data) {
        t.throws(() => {
            configRules.validate(RuleEmptySchema.meta, value, '1');
        }, Error);
    }
});

test('validate should return true if config is not an array', (t) => {
    const valid = configRules.validate(RuleEmptySchema.meta, 'off', '1');

    t.true(valid);
});

test('validate should return true if the schema is an empty array', (t) => {
    const valid = configRules.validate(RuleEmptySchema.meta, ['off', {}], '1');

    t.true(valid);
});

test('validate should return true if config is an array with just an element', (t) => {
    const valid = configRules.validate(RuleWithSchema.meta, ['warning'], '1');

    t.true(valid);
});

test(`validate should return true if the configuration of a rule is valid`, (t) => {
    const validConfiguration = ['warning', {
        ignore: ['Server'],
        include: ['Custom-Header']
    }];

    const valid = configRules.validate(RuleWithSchema.meta, validConfiguration, '1');

    t.true(valid);
});

test(`validate should return false if the configuration of a rule is invalid`, (t) => {
    const invvalidConfiguration = ['warning', { ignore: 'Server' }];

    const valid = configRules.validate(RuleWithSchema.meta, invvalidConfiguration, '1');

    t.false(valid);
});
