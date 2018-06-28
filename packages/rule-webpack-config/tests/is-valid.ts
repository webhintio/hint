import * as path from 'path';

import { getRulePath } from 'hint/dist/src/lib/utils/rule-helpers';
import * as ruleRunner from '@hint/utils-tests-helpers/dist/src/rule-runner';
import { RuleLocalTest } from '@hint/utils-tests-helpers/dist/src/rule-test-type';

const rulePath = getRulePath(__filename, true);

const tests: Array<RuleLocalTest> = [
    {
        name: 'Valid configuration should pass',
        path: path.join(__dirname, 'fixtures', 'valid')
    },
    {
        name: `If there is no config file, it should pass`,
        path: path.join(__dirname, 'fixtures', 'noconfig')
    },
    {
        name: 'Invalid configuration should fail',
        path: path.join(__dirname, 'fixtures', 'invalidconfig'),
        reports: [{ message: `Invalid or unexpected token` }]
    }
];

ruleRunner.testLocalRule(rulePath, tests, { parsers: ['webpack-config'] });
