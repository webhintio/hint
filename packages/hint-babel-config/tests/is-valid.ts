import * as path from 'path';

import { test } from '@hint/utils';
import { HintLocalTest, testLocalHint } from '@hint/utils-tests-helpers';

const { getHintPath } = test;
const hintPath = getHintPath(__filename, true);

const tests: HintLocalTest[] = [
    {
        name: 'Valid .babelrc configuration should pass',
        path: path.join(__dirname, 'fixtures', 'valid-schema', '.babelrc')
    },
    {
        name: `Invalid .babelrc configuration should fail`,
        path: path.join(__dirname, 'fixtures', 'invalid-schema', '.babelrc'),
        reports: [{
            message: `'moduleId' should be 'string'.`,
            position: { match: 'moduleId' }
        }]
    },
    {
        name: `Invalid json file should fail`,
        path: path.join(__dirname, 'fixtures', 'invalid-json', 'package.json'),
        reports: [{ message: `Unexpected token i in JSON at position 0` }]
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
        name: `If package.json contains invalid "babel" property, it should fail`,
        path: path.join(__dirname, 'fixtures', 'has-invalid-babel-package-json', 'package.json'),
        reports: [{
            message: `'moduleId' should be 'string'.`,
            position: { match: 'moduleId' }
        }]
    },
    {
        name: `If .babelrc contains an additional property, it should fail`,
        path: path.join(__dirname, 'fixtures', 'has-additional-property', '.babelrc'),
        reports: [{
            message: `'root' should NOT have additional properties. Additional property found 'additional'.`,
            position: { match: 'additional' }
        }]
    },
    {
        name: `If .babelrc contains an invalid value, it should fail`,
        path: path.join(__dirname, 'fixtures', 'has-invalid-enum-property', '.babelrc'),
        reports: [{
            message: `'sourceMaps' should be equal to one of the allowed values 'both, inline, true, false'. Value found 'invalidValue'`,
            position: { match: 'sourceMaps' }
        }]
    },
    {
        name: 'If .babelrc contains a circular reference, it should fail',
        path: path.join(__dirname, 'fixtures', 'circular'),
        reports: [
            {
                message: `Circular reference found in file ${path.join(__dirname, 'fixtures', 'circular-2', '.babelrc')}`,
                position: { match: 'extends' }
            }
        ]
    },
    {
        name: 'If .babelrc contains an invalid extends, it should fail',
        path: path.join(__dirname, 'fixtures', 'invalid-extends'),
        reports: [
            {
                message: `Unexpected token ' in JSON at position 191`,
                position: { match: 'extends' }
            }
        ]
    }
];

testLocalHint(hintPath, tests, { parsers: ['babel-config'] });
