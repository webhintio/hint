import * as path from 'path';

import { getRulePath } from 'hint/dist/src/lib/utils/rule-helpers';
import * as ruleRunner from '@hint/utils-tests-helpers/dist/src/rule-runner';
import { RuleLocalTest } from '@hint/utils-tests-helpers/dist/src/rule-test-type';

const rulePath = getRulePath(__filename, true);

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

ruleRunner.testLocalRule(rulePath, tests, {parsers: ['typescript-config']});
