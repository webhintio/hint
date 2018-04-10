import * as path from 'path';
import * as mock from 'mock-require';

import * as ruleRunner from 'sonarwhal/dist/tests/helpers/rule-runner';
import { RuleLocalTest } from 'sonarwhal/dist/tests/helpers/rule-test-type';

// We need to use `require` to be able to overwrite the method `getPackage`.
const misc = require('sonarwhal/dist/src/lib/utils/misc');
const webpackDestPath = path.join(__dirname, 'fixtures', 'babelvalid', 'package.json');
const webpackV1DestPath = path.join(__dirname, 'fixtures', 'version1', 'package.json');
const webpackConfig = misc.loadJSONFile(webpackDestPath);
const webpackV1Config = misc.loadJSONFile(webpackV1DestPath);
const originalGetPackage = misc.getPackage;
const ruleName = 'webpack-config/modules-false-babel';

const tests: Array<RuleLocalTest> = [
    {
        after() {
            misc.getPackage = originalGetPackage;
        },
        before() {
            misc.getPackage = () => {
                return webpackConfig;
            };

            mock('sonarwhal/dist/src/lib/utils/misc', misc);
        },
        name: 'If babel configuration is valid and webpack version >=2 should pass',
        path: path.join(__dirname, 'fixtures', 'babelvalid')
    },
    {
        after() {
            misc.getPackage = originalGetPackage;
        },
        before() {
            misc.getPackage = () => {
                return webpackConfig;
            };

            mock('sonarwhal/dist/src/lib/utils/misc', misc);
        },
        name: `If babel configuration is not valid, is should fail`,
        path: path.join(__dirname, 'fixtures', 'babelinvalid'),
        reports: [{ message: 'Babel presets `modules` option should be `false`' }]
    },
    {
        after() {
            misc.getPackage = originalGetPackage;
        },
        before() {
            misc.getPackage = () => {
                return webpackV1Config;
            };

            mock('sonarwhal/dist/src/lib/utils/misc', misc);
        },
        name: 'If babel configuration is invalid, but webpack version is < 2, it should pass',
        path: path.join(__dirname, 'fixtures', 'babelinvalid')
    }
];

const generateTest = (message: string): Array<RuleLocalTest> => {
    return [
        {
            after() {
                misc.getPackage = originalGetPackage;
            },
            before() {
                misc.getPackage = () => {
                    return webpackConfig;
                };

                mock('sonarwhal/dist/src/lib/utils/misc', misc);
            },
            name: 'Even if babel configuration is valid and webpack version >=2 it should fail',
            path: path.join(__dirname, 'fixtures', 'babelvalid'),
            reports: [{ message }]
        }
    ];
};

ruleRunner.testLocalRule(ruleName, tests, {
    parsers: ['webpack-config', 'babel-config'],
    serial: true
});
ruleRunner.testLocalRule(ruleName, generateTest('The parser webpack-config should be activated'), {
    parsers: [],
    serial: true
});
ruleRunner.testLocalRule(ruleName, generateTest('The parser babel-config should be activated'), {
    parsers: ['webpack-config'],
    serial: true
});
