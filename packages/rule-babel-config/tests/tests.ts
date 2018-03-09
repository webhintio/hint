import * as path from 'path';

import * as ruleRunner from 'sonarwhal/dist/tests/helpers/rule-runner';
import { RuleLocalTest } from 'sonarwhal/dist/tests/helpers/rule-test-type';

const ruleName = 'babel-config/is-valid';

const tests: Array<RuleLocalTest> = [
    {
        name: 'Valid .babelrc configuration should pass',
        path: path.join(__dirname, 'fixtures', 'valid-schema', '.babelrc')
    },
    {
        name: `Invalid .babelrc configuration should fail`,
        path: path.join(__dirname, 'fixtures', 'invalid-schema', '.babelrc'),
        reports: [{ message: `'moduleId' should be string.`}]
    },
    {
        name: 'If package.json doesn\'t contain "babel" property, it should pass',
        path: path.join(__dirname, 'fixtures', 'no-babel-package-json', 'package.json')
    },
    {
        name: 'If package.json doesn\'t contain valid "babel" property, it should pass',
        path: path.join(__dirname, 'fixtures', 'has-valid-babel-package-json', 'package.json')
    },
    {
        name: 'If package.json doesn\'t contain invalid "babel" property, it should fail',
        path: path.join(__dirname, 'fixtures', 'has-invalid-babel-package-json', 'package.json'),
        reports: [{ message: `'moduleId' should be string.`}]
    }
];

ruleRunner.testLocalRule(ruleName, tests, { parsers: ['babel-config'] });
