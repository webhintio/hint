import * as path from 'path';
import * as mock from 'mock-require';

import { fs, test } from '@hint/utils';
import { HintLocalTest, testLocalHint } from '@hint/utils-tests-helpers';

const { getHintPath } = test;
const { loadJSONFile } = fs;

const webpackDestPath = path.join(__dirname, 'fixtures', 'babelvalid', 'package.json');
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
        name: 'If babel configuration is valid and webpack version >=2 should pass',
        path: path.join(__dirname, 'fixtures', 'babelvalid')
    },
    {
        before() {
            const loadPackage = () => {
                return webpackConfig;
            };

            mock('@hint/utils/dist/src/packages/load-package', { loadPackage });
        },
        name: `If babel configuration is not valid, is should fail`,
        path: path.join(__dirname, 'fixtures', 'babelinvalid'),
        reports: [{ message: 'Babel presets `modules` option should be `false`' }]
    },
    {
        before() {
            const loadPackage = () => {
                return webpackV1Config;
            };

            mock('@hint/utils/dist/src/packages/load-package', { loadPackage });
        },
        name: 'If babel configuration is invalid, but webpack version is < 2, it should pass',
        path: path.join(__dirname, 'fixtures', 'babelinvalid')
    }
];

const generateTest = (testName: string): HintLocalTest[] => {
    return [
        {
            before() {
                const loadPackage = () => {
                    return webpackConfig;
                };

                mock('@hint/utils/dist/src/packages/load-package', { loadPackage });
            },
            name: testName,
            path: path.join(__dirname, 'fixtures', 'babelvalid')
        }
    ];
};

testLocalHint(hintPath, tests, {
    parsers: ['webpack-config', 'babel-config'],
    serial: true
});
testLocalHint(hintPath, generateTest(`If 'webpack-config' parser is not in the configuration it should pass`), {
    parsers: [],
    serial: true
});
testLocalHint(hintPath, generateTest(`If 'babel-config' parser is not in the configuration it should pass`), {
    parsers: ['webpack-config'],
    serial: true
});
