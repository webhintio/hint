import * as path from 'path';

import { getRulePath } from 'sonarwhal/dist/src/lib/utils/rule-helpers';
import * as ruleRunner from '@sonarwhal/utils-tests-helpers/dist/src/rule-runner';
import { RuleLocalTest } from '@sonarwhal/utils-tests-helpers/dist/src/rule-test-type';

const rulePath = getRulePath(__filename, true);

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

ruleRunner.testLocalRule(rulePath, tests, { parsers: ['webpack-config'] });
