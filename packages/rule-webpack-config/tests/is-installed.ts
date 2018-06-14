import * as path from 'path';
import * as mock from 'mock-require';

import { getRulePath } from 'sonarwhal/dist/src/lib/utils/rule-helpers';
import * as ruleRunner from 'sonarwhal/dist/tests/helpers/rule-runner';
import { RuleLocalTest } from 'sonarwhal/dist/tests/helpers/rule-test-type';

// We need to use `require` to be able to overwrite the method `getPackage`.
const misc = require('sonarwhal/dist/src/lib/utils/misc');
const webpackDestPath = path.join(__dirname, 'fixtures', 'valid', 'package.json');
const webpackConfig = misc.loadJSONFile(webpackDestPath);
const originalGetPackage = misc.getPackage;

const rulePath = getRulePath(__filename, true);
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
        name: 'If valid configuration file exists and webpack is installed should pass',
        path: path.join(__dirname, 'fixtures', 'valid')
    },
    {
        after() {
            misc.getPackage = originalGetPackage;
        },
        before() {
            misc.getPackage = () => {
                throw new Error('error');
            };

            mock('sonarwhal/dist/src/lib/utils/misc', misc);
        },
        name: 'If valid configuration file exists but webpack is not installed should fail',
        path: path.join(__dirname, 'fixtures', 'valid'),
        reports: [{ message: `webpack is not installed in your project.` }]
    }
];

ruleRunner.testLocalRule(rulePath, tests, {
    parsers: ['webpack-config'],
    serial: true
});
