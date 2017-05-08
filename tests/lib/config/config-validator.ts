import * as _ from 'lodash';
import test from 'ava';

import * as configValidator from '../../../src/lib/config/config-validator';

const validConfig = {
    collector: {
        name: 'cdp',
        options: { waitFor: 100 }
    },
    formatter: 'json',
    rules: {
        'disallowed-headers': ['warning', {}],
        'manifest-exists': 'warning',
        'manifest-file-extension': 'warning',
        'manifest-is-valid': 'warning',
        'no-friendly-error-pages': 'warning',
        'no-html-only-headers': 'warning',
        'no-protocol-relative-urls': 'warning',
        'x-content-type-options': 'warning'
    }
};
const invalidConfig = { formatter: 'json' };

test('if config has an invalid schema, it should return false', (t) => {
    const valid = configValidator.validateConfig(invalidConfig);

    t.false(valid);
});

test(`if there is a rule in the config that doesn't exist, it should return false`, (t) => {
    const config = _.cloneDeep(validConfig);

    config.rules['no-rule'] = 'warning';

    const valid = configValidator.validateConfig(config);

    t.false(valid);
});

test(`if rule severity isn't valid, it should return false`, (t) => {
    const config = _.cloneDeep(validConfig);

    config.rules['disallowed-headers'] = ['no-valid-severity', {}];

    const valid = configValidator.validateConfig(config);

    t.false(valid);
});

test(`if rule schema isn't valid, it should return false`, (t) => {
    const config = _.cloneDeep(validConfig);

    config.rules['disallowed-headers'] = ['warning', { ignore: 'Server' }];

    const valid = configValidator.validateConfig(config);

    t.false(valid);
});

test('if config is valid, it should return true', (t) => {
    const valid = configValidator.validateConfig(validConfig);

    t.true(valid);
});
