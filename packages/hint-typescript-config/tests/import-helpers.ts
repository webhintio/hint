import * as path from 'path';

import { GenericTestContext, Context } from 'ava';
import * as sinon from 'sinon';

import { getHintPath } from 'hint/dist/src/lib/utils/hint-helpers';
import * as hintRunner from '@hint/utils-tests-helpers/dist/src/hint-runner';
import { HintLocalTest } from '@hint/utils-tests-helpers/dist/src/hint-test-type';


const loadPackage = require('hint/dist/src/lib/utils/packages/load-package');

const hintPath = getHintPath(__filename, true);

const tests: Array<HintLocalTest> = [
    {
        after: (t: GenericTestContext<Context<any>>) => {
            t.context.sandbox.restore();
        },
        before: (t: GenericTestContext<Context<any>>) => {
            const sandbox = sinon.createSandbox();

            sandbox.stub(loadPackage, 'default').returns({ exists: true });

            t.context.sandbox = sandbox;
        },
        name: 'Configuration with "compilerOptions.importHelpers = true" should pass',
        path: path.join(__dirname, 'fixtures', 'import-helpers', 'import')
    },
    {
        after: (t: GenericTestContext<Context<any>>) => {
            t.context.sandbox.restore();
        },
        before: (t: GenericTestContext<Context<any>>) => {
            const sandbox = sinon.createSandbox();

            sandbox.stub(loadPackage, 'default').throws(new Error('Not found'));

            t.context.sandbox = sandbox;
        },
        name: 'Configuration with "compilerOptions.importHelpers = true" but tslibs is not installed should fail',
        path: path.join(__dirname, 'fixtures', 'import-helpers', 'import'),
        reports: [{ message: `Couldn't find package "tslib".` }]
    },
    {
        after: (t: GenericTestContext<Context<any>>) => {
            t.context.sandbox.restore();
        },
        before: (t: GenericTestContext<Context<any>>) => {
            const sandbox = sinon.createSandbox();

            sandbox.stub(loadPackage, 'default').returns({ exists: true });

            t.context.sandbox = sandbox;
        },
        name: 'Configuration with "compilerOptions.importHelpers = false" should fail',
        path: path.join(__dirname, 'fixtures', 'import-helpers', 'import-false'),
        reports: [{ message: 'The compiler option "importHelpers" should be enabled to reduce the output size.' }]
    },
    {
        after: (t: GenericTestContext<Context<any>>) => {
            t.context.sandbox.restore();
        },
        before: (t: GenericTestContext<Context<any>>) => {
            const sandbox = sinon.createSandbox();

            sandbox.stub(loadPackage, 'default').returns({ exists: true });

            t.context.sandbox = sandbox;
        },
        name: 'Configuration with no explicit "compilerOptions.importHelpers" should fail',
        path: path.join(__dirname, 'fixtures', 'import-helpers', 'no-import'),
        reports: [{ message: 'The compiler option "importHelpers" should be enabled to reduce the output size.' }]
    },
    {
        after: (t: GenericTestContext<Context<any>>) => {
            t.context.sandbox.restore();
        },
        before: (t: GenericTestContext<Context<any>>) => {
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

hintRunner.testLocalHint(hintPath, tests, { parsers: ['typescript-config'], serial: true });
