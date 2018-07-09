import { cloneDeep } from 'lodash';
import test from 'ava';

import * as configValidator from '../../../src/lib/config/config-validator';

const validConfig = {
    connector: {
        name: 'chrome',
        options: { waitFor: 1000 }
    },
    formatters: 'json',
    hints: {
        'disallowed-headers': ['warning', {}],
        'manifest-exists': 1,
        'manifest-file-extension': ['warning'],
        'manifest-is-valid': [2],
        'no-friendly-error-pages': [2, {}],
        'no-html-only-headers': 'error',
        'no-protocol-relative-urls': 'off',
        'x-content-type-options': 0
    }
};
const invalidConfig = { formatter: 'json' };
const validHintsConfig = {
    connector: {
        name: 'chrome',
        options: { waitFor: 1000 }
    },
    formatters: 'json',
    hints: [
        'disallowed-headers:warning',
        '?manifest-exists',
        '-manifest-file-extension',
        'manifest-is-valid',
        [
            'no-friendly-error-pages',
            {}
        ],
        'no-html-only-headers:error'
    ]
};
const invalidHintsConfigObjectFormArrayInverted = {
    connector: {
        name: 'chrome',
        options: { waitFor: 1000 }
    },
    formatters: 'json',
    hints: { 'disallowed-headers': [{}, 'warning'] }
};
const invalidHintsConfigArrayFormNumber = {
    connector: {
        name: 'chrome',
        options: { waitFor: 1000 }
    },
    formatters: 'json',
    hints: [3]
};
const invalidHintsConfigArrayFormArrayInverted = {
    connector: {
        name: 'chrome',
        options: { waitFor: 1000 }
    },
    formatters: 'json',
    hints: [[{}, 'no-html-only-headers:error']]
};


test('If config has an invalid schema, it should return false', (t) => {
    const valid = configValidator.validateConfig(invalidConfig as any);

    t.false(valid);
});

test('If hints config with object has array property in a bad order, validation should fail', (t) => {
    const valid = configValidator.validateConfig(invalidHintsConfigObjectFormArrayInverted as any);

    t.false(valid);
});

test('If hints config with array has a number, validation should fail', (t) => {
    const valid = configValidator.validateConfig(invalidHintsConfigArrayFormNumber as any);

    t.false(valid);
});

test('If hints config with array has an array item with the items inverted, validation should fail', (t) => {
    const valid = configValidator.validateConfig(invalidHintsConfigArrayFormArrayInverted as any);

    t.false(valid);
});

test(`If hint severity isn't valid, it should return false`, (t) => {
    const config = cloneDeep(validConfig);

    config.hints['disallowed-headers'] = ['no-valid-severity', {}];

    const valid = configValidator.validateConfig(config as any);

    t.false(valid);
});

test('config with one formatters is valid', (t) => {
    const valid = configValidator.validateConfig(validConfig as any);

    t.true(valid);
});

test('config with 2 formatters is valid', (t) => {
    const validConfigs = Object.assign({ formatters: ['json', 'stylish'] }, validConfig);
    const valid = configValidator.validateConfig(validConfigs as any);

    t.true(valid);
});

test('If the configuration uses shorthands, it should validate', (t) => {
    const valid = configValidator.validateConfig(validHintsConfig as any);

    t.true(valid);
});
