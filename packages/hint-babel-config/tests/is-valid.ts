import * as path from 'path';

import { getHintPath } from 'hint/dist/src/lib/utils/hint-helpers';
import * as hintRunner from '@hint/utils-tests-helpers/dist/src/hint-runner';
import { HintLocalTest } from '@hint/utils-tests-helpers/dist/src/hint-test-type';

const hintPath = getHintPath(__filename, true);

const tests: Array<HintLocalTest> = [
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
        name: `If package.json contains invalid "babel" property, it should fail`,
        path: path.join(__dirname, 'fixtures', 'has-invalid-babel-package-json', 'package.json'),
        reports: [{ message: `'moduleId' should be string.` }]
    },
    {
        name: `If .babelrc contains an additional property, it should fail`,
        path: path.join(__dirname, 'fixtures', 'has-additional-property', '.babelrc'),
        reports: [{ message: `Should NOT have additional properties. Additional property found 'additional'.` }]
    },
    {
        name: `If .babelrc contains an invalid value, it should fail`,
        path: path.join(__dirname, 'fixtures', 'has-invalid-enum-property', '.babelrc'),
        reports: [{ message: `'sourceMaps' should be equal to one of the allowed values 'both, inline, true, false'. Value found 'invalidValue'` }]
    },
    {
        name: 'If .babelrc contains a circular reference, it should fail',
        path: path.join(__dirname, 'fixtures', 'circular'),
        reports: [
            { message: `Circular reference found in file ${path.join(__dirname, 'fixtures', 'circular-2', '.babelrc')}` }
        ]
    },
    {
        name: 'If .babelrc contains an invalid extends, it should fail',
        path: path.join(__dirname, 'fixtures', 'invalid-extends'),
        reports: [
            { message: `Unexpected token ' in JSON at position 191` }
        ]
    }
];

hintRunner.testLocalHint(hintPath, tests, { parsers: ['babel-config'] });
