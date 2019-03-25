import * as path from 'path';
import * as mock from 'mock-require';

import { fs, test } from '@hint/utils';
import { HintLocalTest, testLocalHint } from '@hint/utils-tests-helpers';

const { getHintPath } = test;
const { loadJSONFile } = fs;

const webpackDestPath = path.join(__dirname, 'fixtures', 'valid', 'package.json');
const webpackV1DestPath = path.join(__dirname, 'fixtures', 'version1', 'package.json');
const webpackConfig = loadJSONFile(webpackDestPath);
const webpackV1Config = loadJSONFile(webpackV1DestPath);
const hintPath = getHintPath(__filename, true);

const tests: HintLocalTest[] = [
    {
        before() {
            const loadPackage = () => {
                return webpackConfig;
            };

            mock('@hint/utils/dist/src/packages/load-package', { loadPackage });
        },
        name: 'If TS configuration is valid and webpack version >=2 should pass',
        path: path.join(__dirname, 'fixtures', 'tsvalid')
    },
    {
        before() {
            const loadPackage = () => {
                return webpackConfig;
            };

            mock('@hint/utils/dist/src/packages/load-package', { loadPackage });
        },
        name: `If TS configuration is not valid, is should fail`,
        path: path.join(__dirname, 'fixtures', 'tsinvalid'),
        reports: [{ message: 'TypeScript `compilerOptions.module` option should be `esnext`' }]
    },
    {
        before() {
            const loadPackage = () => {
                return webpackV1Config;
            };

            mock('@hint/utils/dist/src/packages/load-package', { loadPackage });
        },
        name: 'If TS configuration is invalid, but webpack version is < 2, it should pass',
        path: path.join(__dirname, 'fixtures', 'tsinvalid')
    }
];

const generateTest = (message: string, testName: string): HintLocalTest[] => {
    return [
        {
            before() {
                const loadPackage = () => {
                    return webpackConfig;
                };

                mock('@hint/utils/dist/src/packages/load-package', { loadPackage });
            },
            name: testName,
            path: path.join(__dirname, 'fixtures', 'tsvalid'),
            reports: [{ message }]
        }
    ];
};

testLocalHint(hintPath, tests, {
    parsers: ['webpack-config', 'typescript-config'],
    serial: true
});
testLocalHint(hintPath, generateTest('The parser webpack-config should be activated', `If 'webpack-config' parser is not in the configuration it should fail`), {
    parsers: [],
    serial: true
});
testLocalHint(hintPath, generateTest('The parser typescript-config should be activated', `if 'typescript-config' parser is no in the configuration it should fail`), {
    parsers: ['webpack-config'],
    serial: true
});
