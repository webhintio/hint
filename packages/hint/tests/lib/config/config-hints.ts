import test from 'ava';

import * as configHints from '../../../src/lib/config/config-hints';
import { HintConfig, IHint } from '../../../src/lib/types';
import { HintScope } from '../../../src/lib/enums/hintscope';
import { HintContext } from '../../../src/lib/hint-context';

class HintEmptySchema implements IHint {

    public static readonly meta = { id: '', schema: [], scope: HintScope.site }

    public constructor(context: HintContext) {
        context.on('event', () => { });
    }
}

class HintWithSchema implements IHint {

    public static readonly meta = {
        id: 'hint',
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
        scope: HintScope.site
    }

    public constructor(context: HintContext) {
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
        const severity = configHints.getSeverity(key);

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
        const severity = configHints.getSeverity(key);

        t.is(severity, value);
    }
});

test('getSeverity with an array should return the right value', (t) => {
    const data: Map<HintConfig | Array<HintConfig>, number> = new Map([
        [(['off', {}] as HintConfig), 0],
        [(['warning', {}] as HintConfig), 1],
        [(['error', {}] as HintConfig), 2],
        [(['invalid', {}] as HintConfig), null],
        [([0, {}] as HintConfig), 0],
        [([1, {}] as HintConfig), 1],
        [([2, {}] as HintConfig), 2],
        [([3, {}] as HintConfig), null],
        [([-1, {}] as HintConfig), null]
    ]);

    for (const [key, value] of data) {
        const severity = configHints.getSeverity(key);

        t.is(severity, value);
    }
});

test('validate should return false if config is an object', (t) => {
    const valid = configHints.validate(HintEmptySchema.meta, { warning: true }, '1');

    t.false(valid);
});

test('validate should throw an exception if the severity is not valid', (t) => {
    const data = new Set(['invalid', -1, ['invalid', {}]]);

    for (const value of data) {
        t.throws(() => {
            configHints.validate(HintEmptySchema.meta, value, '1');
        }, Error);
    }
});

test('validate should return true if config is not an array', (t) => {
    const valid = configHints.validate(HintEmptySchema.meta, 'off', '1');

    t.true(valid);
});

test('validate should return true if the schema is an empty array', (t) => {
    const valid = configHints.validate(HintEmptySchema.meta, ['off', {}], '1');

    t.true(valid);
});

test('validate should return true if config is an array with only an element', (t) => {
    const valid = configHints.validate(HintWithSchema.meta, ['warning'], '1');

    t.true(valid);
});

test(`validate should return true if the configuration of a hint is valid`, (t) => {
    const validConfiguration = ['warning', {
        ignore: ['Server'],
        include: ['Custom-Header']
    }];

    const valid = configHints.validate(HintWithSchema.meta, validConfiguration, '1');

    t.true(valid);
});

test(`validate should return false if the configuration of a hint is invalid`, (t) => {
    const invvalidConfiguration = ['warning', { ignore: 'Server' }];

    const valid = configHints.validate(HintWithSchema.meta, invvalidConfiguration, '1');

    t.false(valid);
});
