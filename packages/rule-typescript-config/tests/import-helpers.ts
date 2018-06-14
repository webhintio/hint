import * as path from 'path';

import * as sinon from 'sinon';

import { getRulePath } from 'sonarwhal/dist/src/lib/utils/rule-helpers';
import * as ruleRunner from 'sonarwhal/dist/tests/helpers/rule-runner';
import { RuleLocalTest } from 'sonarwhal/dist/tests/helpers/rule-test-type';
import * as misc from 'sonarwhal/dist/src/lib/utils/misc';

const rulePath = getRulePath(__filename, true);

const tests: Array<RuleLocalTest> = [
    {
        after: (t) => {
            t.context.sandbox.restore();
        },
        before: (t) => {
            const sandbox = sinon.createSandbox();

            sandbox.stub(misc, 'getPackage').returns({ exists: true });

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

            sandbox.stub(misc, 'getPackage').throws(new Error('Not found'));

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

            sandbox.stub(misc, 'getPackage').returns({ exists: true });

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

            sandbox.stub(misc, 'getPackage').returns({ exists: true });

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

            sandbox.stub(misc, 'getPackage').throws(new Error('Not found'));

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
