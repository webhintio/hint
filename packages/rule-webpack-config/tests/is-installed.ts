import * as path from 'path';
import * as mock from 'mock-require';

import { getRulePath } from 'hint/dist/src/lib/utils/rule-helpers';
import * as ruleRunner from '@hint/utils-tests-helpers/dist/src/rule-runner';
import { RuleLocalTest } from '@hint/utils-tests-helpers/dist/src/rule-test-type';
import loadJSONFile from 'hint/dist/src/lib/utils/fs/load-json-file';

const webpackDestPath = path.join(__dirname, 'fixtures', 'valid', 'package.json');
const webpackConfig = loadJSONFile(webpackDestPath);
const loadPackage = {
    default() {
        return;
    }
};

const rulePath = getRulePath(__filename, true);
const tests: Array<RuleLocalTest> = [
    {
        before() {
            loadPackage.default = () => {
                return webpackConfig;
            };

            mock('hint/dist/src/lib/utils/packages/load-package', loadPackage);
        },
        name: 'If valid configuration file exists and webpack is installed should pass',
        path: path.join(__dirname, 'fixtures', 'valid')
    },
    {
        before() {
            loadPackage.default = () => {
                throw new Error('error');
            };

            mock('hint/dist/src/lib/utils/packages/load-package', loadPackage);
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
