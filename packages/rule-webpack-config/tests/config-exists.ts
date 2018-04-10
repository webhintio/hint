import * as path from 'path';

import * as ruleRunner from 'sonarwhal/dist/tests/helpers/rule-runner';
import { RuleLocalTest } from 'sonarwhal/dist/tests/helpers/rule-test-type';

const ruleName = 'webpack-config/config-exists';

const tests: Array<RuleLocalTest> = [
    {
        name: 'If valid configuration file exists should pass',
        path: path.join(__dirname, 'fixtures', 'valid')
    },
    {
        name: `If invalid configuration file exists it should pass`,
        path: path.join(__dirname, 'fixtures', 'invalidconfig')
    },
    {
        name: 'If there is no config file, it should fail',
        path: path.join(__dirname, 'fixtures', 'noconfig'),
        reports: [{ message: `webpack configuration file not found in your project.` }]
    }
];

ruleRunner.testLocalRule(ruleName, tests, { parsers: ['webpack-config'] });
