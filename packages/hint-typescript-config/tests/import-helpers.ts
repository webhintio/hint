import * as path from 'path';

import { ExecutionContext } from 'ava';
import * as mock from 'mock-require';
import * as sinon from 'sinon';

import * as utils from '@hint/utils';
import { HintLocalTest, testLocalHint } from '@hint/utils-tests-helpers';

const { getHintPath } = utils.test;

type ImportHelpersContext = {
    sandbox: sinon.SinonSandbox;
};

const packages = utils.packages;

const hintPath = getHintPath(__filename, true);

const tests: HintLocalTest[] = [
    {
        after: (t: ExecutionContext<ImportHelpersContext>) => {
            t.context.sandbox.restore();
        },
        before: (t: ExecutionContext<ImportHelpersContext>) => {
            const sandbox = sinon.createSandbox();

            sandbox.stub(utils.packages, 'loadPackage').returns({ exists: true });

            t.context.sandbox = sandbox;

            mock('@hint/utils/dist/src/packages/load-package', { loadPackage: packages.loadPackage });
        },
        name: 'Configuration with "compilerOptions.importHelpers = true" should pass',
        path: path.join(__dirname, 'fixtures', 'import-helpers', 'import')
    },
    {
        after: (t: ExecutionContext<ImportHelpersContext>) => {
            t.context.sandbox.restore();
        },
        before: (t: ExecutionContext<ImportHelpersContext>) => {
            const sandbox = sinon.createSandbox();

            sandbox.stub(utils.packages, 'loadPackage').throws(new Error('Not found'));

            t.context.sandbox = sandbox;

            mock('@hint/utils/dist/src/packages/load-package', { loadPackage: packages.loadPackage });
        },
        name: 'Configuration with "compilerOptions.importHelpers = true" but tslibs is not installed should fail',
        path: path.join(__dirname, 'fixtures', 'import-helpers', 'import'),
        reports: [{ message: `Couldn't find package "tslib".` }]
    },
    {
        after: (t: ExecutionContext<ImportHelpersContext>) => {
            t.context.sandbox.restore();
        },
        before: (t: ExecutionContext<ImportHelpersContext>) => {
            const sandbox = sinon.createSandbox();

            sandbox.stub(utils.packages, 'loadPackage').returns({ exists: true });

            t.context.sandbox = sandbox;

            mock('@hint/utils/dist/src/packages/load-package', { loadPackage: packages.loadPackage });
        },
        name: 'Configuration with "compilerOptions.importHelpers = false" should fail',
        path: path.join(__dirname, 'fixtures', 'import-helpers', 'import-false'),
        reports: [{ message: 'The compiler option "importHelpers" should be enabled to reduce the output size.' }]
    },
    {
        after: (t: ExecutionContext<ImportHelpersContext>) => {
            t.context.sandbox.restore();
        },
        before: (t: ExecutionContext<ImportHelpersContext>) => {
            const sandbox = sinon.createSandbox();

            sandbox.stub(utils.packages, 'loadPackage').returns({ exists: true });

            t.context.sandbox = sandbox;

            mock('@hint/utils/dist/src/packages/load-package', { loadPackage: packages.loadPackage });
        },
        name: 'Configuration with no explicit "compilerOptions.importHelpers" should fail',
        path: path.join(__dirname, 'fixtures', 'import-helpers', 'no-import'),
        reports: [{ message: 'The compiler option "importHelpers" should be enabled to reduce the output size.' }]
    },
    {
        after: (t: ExecutionContext<ImportHelpersContext>) => {
            t.context.sandbox.restore();
        },
        before: (t: ExecutionContext<ImportHelpersContext>) => {
            const sandbox = sinon.createSandbox();

            sandbox.stub(utils.packages, 'loadPackage').throws(new Error('Not found'));

            t.context.sandbox = sandbox;

            mock('@hint/utils/dist/src/packages/load-package', { loadPackage: packages.loadPackage });
        },
        name: 'Configuration with no explicit "compilerOptions.importHelpers" and no "tslib" installed should fail',
        path: path.join(__dirname, 'fixtures', 'import-helpers', 'no-import'),
        reports: [
            { message: 'The compiler option "importHelpers" should be enabled to reduce the output size.' },
            { message: `Couldn't find package "tslib".` }
        ]
    }
];

testLocalHint(hintPath, tests, { parsers: ['typescript-config'], serial: true });
