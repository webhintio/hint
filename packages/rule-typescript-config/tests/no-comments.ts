import * as path from 'path';

import { getRulePath } from 'sonarwhal/dist/src/lib/utils/rule-helpers';
import * as ruleRunner from '@sonarwhal/utils-tests-helpers/dist/src/rule-runner';
import { RuleLocalTest } from '@sonarwhal/utils-tests-helpers/dist/src/rule-test-type';

const rulePath = getRulePath(__filename, true);

const tests: Array<RuleLocalTest> = [
    {
        name: 'Configuration with "compilerOptions.removeComments = true" should pass',
        path: path.join(__dirname, 'fixtures', 'no-comments', 'valid')
    },
    {
        name: 'Configuration with "compilerOptions.removeComments = false" should fail',
        path: path.join(__dirname, 'fixtures', 'no-comments', 'invalid'),
        reports: [{ message: 'The compiler option "removeComments" should be enabled to reduce the output size.' }]
    }
];

ruleRunner.testLocalRule(rulePath, tests, { parsers: ['typescript-config'] });
