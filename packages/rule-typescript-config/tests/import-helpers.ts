import * as path from 'path';

import * as sinon from 'sinon';

import { getRulePath } from 'hint/dist/src/lib/utils/rule-helpers';
import * as ruleRunner from '@hint/utils-tests-helpers/dist/src/rule-runner';
import { RuleLocalTest } from '@hint/utils-tests-helpers/dist/src/rule-test-type';
const loadPackage = require('hint/dist/src/lib/utils/packages/load-package');

const rulePath = getRulePath(__filename, true);

const tests: Array<RuleLocalTest> = [
    {
        after: (t) => {
            t.context.sandbox.restore();
        },
        before: (t) => {
            const sandbox = sinon.createSandbox();

            sandbox.stub(loadPackage, 'default').returns({ exists: true });

            t.context.sandbox = sandbox;
        },
        name: 'Configuration with "compilerOptions.importHelpers = true" should pass',
        path: path.join(__dirname, 'fixtures', 'import-helpers', 'import')
    },
    {
        after: (t) => {
            t.context.sandbox.restore();
        },
        before: (t) => {
            const sandbox = sinon.createSandbox();

            sandbox.stub(loadPackage, 'default').throws(new Error('Not found'));

            t.context.sandbox = sandbox;
        },
        name: 'Configuration with "compilerOptions.importHelpers = true" but tslibs is not installed should fail',
        path: path.join(__dirname, 'fixtures', 'import-helpers', 'import'),
        reports: [{ message: `Couldn't find package "tslib".` }]
    },
    {
        after: (t) => {
            t.context.sandbox.restore();
        },
        before: (t) => {
            const sandbox = sinon.createSandbox();

            sandbox.stub(loadPackage, 'default').returns({ exists: true });

            t.context.sandbox = sandbox;
        },
        name: 'Configuration with "compilerOptions.importHelpers = false" should fail',
        path: path.join(__dirname, 'fixtures', 'import-helpers', 'import-false'),
        reports: [{ message: 'The compiler option "importHelpers" should be enabled to reduce the output size.' }]
    },
    {
        after: (t) => {
            t.context.sandbox.restore();
        },
        before: (t) => {
            const sandbox = sinon.createSandbox();

            sandbox.stub(loadPackage, 'default').returns({ exists: true });

            t.context.sandbox = sandbox;
        },
        name: 'Configuration with no explicit "compilerOptions.importHelpers" should fail',
        path: path.join(__dirname, 'fixtures', 'import-helpers', 'no-import'),
        reports: [{ message: 'The compiler option "importHelpers" should be enabled to reduce the output size.' }]
    },
    {
        after: (t) => {
            t.context.sandbox.restore();
        },
        before: (t) => {
            const sandbox = sinon.createSandbox();

            sandbox.stub(loadPackage, 'default').throws(new Error('Not found'));

            t.context.sandbox = sandbox;
        },
        name: 'Configuration with no explicit "compilerOptions.importHelpers" and no "tslib" installed should fail',
        path: path.join(__dirname, 'fixtures', 'import-helpers', 'no-import'),
        reports: [
            { message: 'The compiler option "importHelpers" should be enabled to reduce the output size.' },
            { message: `Couldn't find package "tslib".` }
        ]
    }
];

ruleRunner.testLocalRule(rulePath, tests, { parsers: ['typescript-config'], serial: true });
