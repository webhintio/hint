import * as path from 'path';
import * as mock from 'mock-require';

import { getHintPath } from 'hint/dist/src/lib/utils/hint-helpers';
import * as hintRunner from '@hint/utils-tests-helpers/dist/src/hint-runner';
import { HintLocalTest } from '@hint/utils-tests-helpers/dist/src/hint-test-type';

import loadJSONFile from 'hint/dist/src/lib/utils/fs/load-json-file';

const webpackDestPath = path.join(__dirname, 'fixtures', 'babelvalid', 'package.json');
const webpackV1DestPath = path.join(__dirname, 'fixtures', 'version1', 'package.json');
const webpackConfig = loadJSONFile(webpackDestPath);
const webpackV1Config = loadJSONFile(webpackV1DestPath);
const hintPath = getHintPath(__filename, true);
const loadPackage = {
    default() {
        return;
    }
};

const tests: Array<HintLocalTest> = [
    {
        before() {
            loadPackage.default = () => {
                return webpackConfig;
            };

            mock('hint/dist/src/lib/utils/packages/load-package', loadPackage);
        },
        name: 'If babel configuration is valid and webpack version >=2 should pass',
        path: path.join(__dirname, 'fixtures', 'babelvalid')
    },
    {
        before() {
            loadPackage.default = () => {
                return webpackConfig;
            };

            mock('hint/dist/src/lib/utils/packages/load-package', loadPackage);
        },
        name: `If babel configuration is not valid, is should fail`,
        path: path.join(__dirname, 'fixtures', 'babelinvalid'),
        reports: [{ message: 'Babel presets `modules` option should be `false`' }]
    },
    {
        before() {
            loadPackage.default = () => {
                return webpackV1Config;
            };

            mock('hint/dist/src/lib/utils/packages/load-package', loadPackage);
        },
        name: 'If babel configuration is invalid, but webpack version is < 2, it should pass',
        path: path.join(__dirname, 'fixtures', 'babelinvalid')
    }
];

const generateTest = (message: string): Array<HintLocalTest> => {
    return [
        {
            before() {
                loadPackage.default = () => {
                    return webpackConfig;
                };

                mock('hint/dist/src/lib/utils/packages/load-package', loadPackage);
            },
            name: 'Even if babel configuration is valid and webpack version >=2 it should fail',
            path: path.join(__dirname, 'fixtures', 'babelvalid'),
            reports: [{ message }]
        }
    ];
};

hintRunner.testLocalHint(hintPath, tests, {
    parsers: ['webpack-config', 'babel-config'],
    serial: true
});
hintRunner.testLocalHint(hintPath, generateTest('The parser webpack-config should be activated'), {
    parsers: [],
    serial: true
});
hintRunner.testLocalHint(hintPath, generateTest('The parser babel-config should be activated'), {
    parsers: ['webpack-config'],
    serial: true
});
