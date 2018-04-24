import * as path from 'path';

import * as ruleRunner from 'sonarwhal/dist/tests/helpers/rule-runner';
import { RuleLocalTest } from 'sonarwhal/dist/tests/helpers/rule-test-type';

const ruleName = 'typescript-config/consistent-casing';

const tests: Array<RuleLocalTest> = [
    {
        name: 'Configuration with "compilerOptions.forceConsistentCasingInFileNames = true" should pass',
        path: path.join(__dirname, 'fixtures', 'consistent-casing', 'valid')
    },
    {
        name: 'Configuration with "compilerOptions.forceConsistentCasingInFileNames = false" should fail',
        path: path.join(__dirname, 'fixtures', 'consistent-casing', 'consistent-casing-false'),
        reports: [{message: 'The compiler option "forceConsistentCasingInFileNames" should be enabled to reduce issues when working with different OSes.'}]
    },
    {
        name: 'Configuration without "compilerOptions.forceConsistentCasingInFileNames" should fail',
        path: path.join(__dirname, 'fixtures', 'consistent-casing', 'no-consistent-casing'),
        reports: [{message: 'The compiler option "forceConsistentCasingInFileNames" should be enabled to reduce issues when working with different OSes.'}]
    }
];

ruleRunner.testLocalRule(ruleName, tests, {parsers: ['typescript-config']});
