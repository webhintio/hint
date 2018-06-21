import * as path from 'path';

import { getRulePath } from 'sonarwhal/dist/src/lib/utils/rule-helpers';
import * as ruleRunner from '@sonarwhal/utils-tests-helpers/dist/src/rule-runner';
import { RuleLocalTest } from '@sonarwhal/utils-tests-helpers/dist/src/rule-test-type';

const rulePath = getRulePath(__filename, true);

const tests: Array<RuleLocalTest> = [
    {
        name: 'Configuration with "compilerOptions.strict = true" should pass',
        path: path.join(__dirname, 'fixtures', 'strict', 'strict-true')
    },
    {
        name: 'Configuration with "compilerOptions.strict = false" should fail',
        path: path.join(__dirname, 'fixtures', 'strict', 'strict-false'),
        reports: [{message: 'The compiler option "strict" should be enabled to reduce type errors.'}]
    },
    {
        name: 'Configuration with no explicit "compilerOptions.strict" should fail',
        path: path.join(__dirname, 'fixtures', 'strict', 'no-strict'),
        reports: [{message: 'The compiler option "strict" should be enabled to reduce type errors.'}]
    }
];

ruleRunner.testLocalRule(rulePath, tests, {parsers: ['typescript-config']});
