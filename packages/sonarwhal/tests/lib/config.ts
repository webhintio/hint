import * as path from 'path';

import test from 'ava';

import * as config from '../../src/lib/config';
import { ConnectorConfig } from '../../src/lib/types';

test('if there is no configuration file, it should return null', (t) => {
    const result = config.getFilenameForDirectory('./fixtures/getFileNameForDirectoryEmpty');

    t.is(result, null);
});

test('if there is configuration file, it should return the path to the file', (t) => {
    const result = config.getFilenameForDirectory(path.join(__dirname, './fixtures/getFilenameForDirectory'));

    t.true(result.includes('.sonarwhalrc'));
});

test('if load is called with a non valid file extension, it should return an exception', (t) => {
    const error = t.throws(() => {
        config.loadUserConfig(path.join(__dirname, './fixtures/notvalid/notvalid.css'));
    });

    t.is(error.message, `Couldn't find any valid configuration`);
});

test(`if package.json doesn't have a sonarwhal configuration, it should return an exception`, (t) => {
    const error = t.throws(() => {
        config.loadUserConfig(path.join(__dirname, './fixtures/notvalid/package.json'));
    });

    t.is(error.message, `Couldn't find any valid configuration`);
});

test(`if package.json is an invalid JSON, it should return an exception`, (t) => {
    const error = t.throws(() => {
        config.loadUserConfig(path.join(__dirname, './fixtures/exception/package.json'));
    });

    t.true(error.message.startsWith('Cannot read config file: '));
});

test(`if the config file doesn't have an extension, it should be parse as JSON file`, (t) => {
    const configuration = config.loadUserConfig(path.join(__dirname, './fixtures/sonarwhalrc'));

    t.is((configuration.connector as ConnectorConfig).name, 'chrome');
    t.is(configuration.rules['disallowed-headers'], 'warning');
});

test(`if the config file is JavaScript, it should return the configuration part`, (t) => {
    const configuration = config.loadUserConfig(path.join(__dirname, './fixtures/sonarwhalrc.js'));

    t.is((configuration.connector as ConnectorConfig).name, 'chrome');
    t.is(configuration.rules['disallowed-headers'], 'warning');
});

test(`if package.json contains a valid sonarwhal configuration, it should return it`, (t) => {
    const configuration = config.loadUserConfig(path.join(__dirname, './fixtures/package.json'));

    t.is((configuration.connector as ConnectorConfig).name, 'chrome');
    t.is(configuration.rules['disallowed-headers'], 'warning');
});
