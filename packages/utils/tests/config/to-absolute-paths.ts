import * as path from 'path';

import test from 'ava';

import { toAbsolutePaths } from '../../src/config/to-absolute-paths';
import { UserConfig, ConnectorConfig, HintsConfigObject } from '../../src';

test('if config is null, it will return null', (t) => {
    const result = toAbsolutePaths(null, '');

    t.is(result, null);
});


test('if configRoot is a folder, it will calculate the path using that folder', (t) => {
    const config: UserConfig = {
        browserslist: './a',
        connector: { name: './jsdom' },
        extends: ['.hintrc-extends', '.hintrc-extends2'],
        formatters: ['./summary', './stylish'],
        hints: {
            './axe': 'error',
            './content-type': 'error',
            './no-bom': 'error'
        },
        parsers: ['./css', './javascript']
    };
    const configRoot = path.join(__dirname, 'fixtures');
    const result = toAbsolutePaths(config, configRoot) as UserConfig;

    t.is(result.browserslist, config.browserslist);
    t.is((result.connector as ConnectorConfig).name, path.resolve(configRoot, (config.connector as ConnectorConfig).name));

    const extConfig = config.extends as string[];
    const extResult = result.extends as string[];

    for (let i = 0; i < extResult.length; i++) {
        t.is(extResult[i], path.resolve(configRoot, extConfig[i]));
    }

    const formattersConfig = config.formatters as string[];
    const formattersResult = result.formatters as string[];

    for (let i = 0; i < formattersResult.length; i++) {
        t.is(formattersResult[i], path.resolve(configRoot, formattersConfig[i]));
    }

    const parsersConfig = config.parsers as string[];
    const parsersResult = result.parsers as string[];

    for (let i = 0; i < parsersResult.length; i++) {
        t.is(parsersResult[i], path.resolve(configRoot, parsersConfig[i]));
    }

    const hintsConfig = config.hints as HintsConfigObject;
    const hintsResult = result.hints as HintsConfigObject;
    const keys = Object.keys(hintsResult);

    for (const k of keys) {
        t.is(hintsResult[k], hintsConfig[path.resolve(configRoot, k)!]);
    }
});
