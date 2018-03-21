import * as path from 'path';

import * as ruleRunner from 'sonarwhal/dist/tests/helpers/rule-runner';
import { RuleLocalTest } from 'sonarwhal/dist/tests/helpers/rule-test-type';

const ruleName = 'typescript-config/no-comments';

const tests: Array<RuleLocalTest> = [
    {
        name: 'Configuration with "compilerOptions.removeComments = true" should pass',
        path: path.join(__dirname, 'fixtures', 'no-comments', 'valid')
    },
    {
        name: 'Configuration with "compilerOptions.removeComments = false" should fail',
        path: path.join(__dirname, 'fixtures', 'no-comments', 'invalid'),
        reports: [{message: 'The compiler option "removeComments" should be enabled to reduce the output size.'}]
    }
];

ruleRunner.testLocalRule(ruleName, tests, {parsers: ['typescript-config']});
