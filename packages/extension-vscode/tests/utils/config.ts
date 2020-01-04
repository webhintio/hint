import test from 'ava';

import { getUserConfig } from '../../src/utils/config';

test('It returns a default development configuration if none is found', (t) => {
    const hint = {
        getUserConfig() {
            return null;
        }
    } as any;

    const { extends: ext } = getUserConfig(hint, 'path/to/directory');

    t.deepEqual(ext, ['development']);
});

test('It forces hint-http-compression to "off"', (t) => {
    const hint = {
        getUserConfig() {
            return { hints: { 'http-compression': 'error' } };
        }
    } as any;

    const { hints } = getUserConfig(hint, 'path/to/directory');

    t.deepEqual(hints, { 'http-compression': 'off' });
});

test('It always adds `parser-html`', (t) => {
    const hint = {
        getUserConfig() {
            return { parsers: ['css'] };
        }
    } as any;

    const { parsers } = getUserConfig(hint, 'path/to/directory');

    t.deepEqual(parsers, ['css', 'html']);
});

test('It returns the found configuration', (t) => {
    const hint = {
        getUserConfig() {
            return { extends: ['web-recommended'] };
        }
    } as any;

    const { extends: ext } = getUserConfig(hint, 'path/to/directory');

    t.deepEqual(ext, ['web-recommended']);
});

test('It forces the connector to local regardless of user config', (t) => {
    const hint = {
        getUserConfig() {
            return { connector: 'jsdom', extends: ['development'] };
        }
    } as any;

    const { connector } = getUserConfig(hint, 'path/to/directory');

    t.deepEqual(connector, { name: 'local' });
});

test('It removes all formatters from the user config', (t) => {
    const hint = {
        getUserConfig() {
            return { extends: ['development'], formatters: ['html', 'summary'] };
        }
    } as any;

    const { formatters } = getUserConfig(hint, 'path/to/directory');

    t.is(formatters && formatters.length, 0);
});
