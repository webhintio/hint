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
        reports: [{ message: `'moduleId' should be string.` }]
    },
    {
        name: `Invalid json file should fail`,
        path: path.join(__dirname, 'fixtures', 'invalid-json', 'package.json'),
        reports: [{ message: `Unexpected token ' in JSON at position 12` }]
    },
    {
        name: `If package.json doesn't contain "babel" property, it should pass`,
        path: path.join(__dirname, 'fixtures', 'no-babel-package-json', 'package.json')
    },
    {
        name: `If package.json contains valid "babel" property, it should pass`,
        path: path.join(__dirname, 'fixtures', 'has-valid-babel-package-json', 'package.json')
    },
    {
        name: `If package.json contain invalid "babel" property, it should fail`,
        path: path.join(__dirname, 'fixtures', 'has-invalid-babel-package-json', 'package.json'),
        reports: [{ message: `'moduleId' should be string.` }]
    },
    {
        name: `If .babelrc contain an additional property, it should fail`,
        path: path.join(__dirname, 'fixtures', 'has-additional-property', '.babelrc'),
        reports: [{ message: `Should NOT have additional properties. Additional property found 'additional'.` }]
    },
    {
        name: `If .babelrc contain an invalid value, it should fail`,
        path: path.join(__dirname, 'fixtures', 'has-invalid-enum-property', '.babelrc'),
        reports: [{ message: `'sourceMaps' should be equal to one of the allowed values 'both, inline, true, false'. Value found 'invalidValue'` }]
    }
];

ruleRunner.testLocalRule(ruleName, tests, { parsers: ['babel-config'] });
