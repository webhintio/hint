import * as path from 'path';

import { ExecutionContext } from 'ava';
import * as mock from 'mock-require';
import * as sinon from 'sinon';

import * as utils from '@hint/utils';
import { getHintPath, HintLocalTest, testLocalHint } from '@hint/utils-tests-helpers';
import { Severity } from '@hint/utils-types';

type ImportHelpersContext = {
    sandbox: sinon.SinonSandbox;
};

const hintPath = getHintPath(__filename, true);

const tests: HintLocalTest[] = [
    {
        after: (t: ExecutionContext<ImportHelpersContext>) => {
            t.context.sandbox.restore();
        },
        before: (t: ExecutionContext<ImportHelpersContext>) => {
            const sandbox = sinon.createSandbox();

            sandbox.stub(utils, 'loadPackage').returns({ exists: true });

            t.context.sandbox = sandbox;

            mock('@hint/utils/dist/src/packages/load-package', { loadPackage: utils.loadPackage });
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

            sandbox.stub(utils, 'loadPackage').throws(new Error('Not found'));

            t.context.sandbox = sandbox;

            mock('@hint/utils/dist/src/packages/load-package', { loadPackage: utils.loadPackage });
        },
        name: 'Configuration with "compilerOptions.importHelpers = true" but tslibs is not installed should fail',
        path: path.join(__dirname, 'fixtures', 'import-helpers', 'import'),
        reports: [{
            message: `Couldn't find package "tslib".`,
            severity: Severity.error
        }]
    },
    {
        after: (t: ExecutionContext<ImportHelpersContext>) => {
            t.context.sandbox.restore();
        },
        before: (t: ExecutionContext<ImportHelpersContext>) => {
            const sandbox = sinon.createSandbox();

            sandbox.stub(utils, 'loadPackage').returns({ exists: true });

            t.context.sandbox = sandbox;

            mock('@hint/utils/dist/src/packages/load-package', { loadPackage: utils.loadPackage });
        },
        name: 'Configuration with "compilerOptions.importHelpers = false" should fail',
        path: path.join(__dirname, 'fixtures', 'import-helpers', 'import-false'),
        reports: [
            {
                message: 'The compiler option "importHelpers" should be enabled to reduce the output size.',
                position: { match: 'false' },
                severity: Severity.warning
            }
        ]
    },
    {
        after: (t: ExecutionContext<ImportHelpersContext>) => {
            t.context.sandbox.restore();
        },
        before: (t: ExecutionContext<ImportHelpersContext>) => {
            const sandbox = sinon.createSandbox();

            sandbox.stub(utils, 'loadPackage').returns({ exists: true });

            t.context.sandbox = sandbox;

            mock('@hint/utils/dist/src/packages/load-package', { loadPackage: utils.loadPackage });
        },
        name: 'Configuration with no explicit "compilerOptions.importHelpers" should fail',
        path: path.join(__dirname, 'fixtures', 'import-helpers', 'no-import'),
        reports: [
            {
                message: 'The compiler option "importHelpers" should be enabled to reduce the output size.',
                position: { match: 'compilerOptions' },
                severity: Severity.warning
            }
        ]
    },
    {
        after: (t: ExecutionContext<ImportHelpersContext>) => {
            t.context.sandbox.restore();
        },
        before: (t: ExecutionContext<ImportHelpersContext>) => {
            const sandbox = sinon.createSandbox();

            sandbox.stub(utils, 'loadPackage').throws(new Error('Not found'));

            t.context.sandbox = sandbox;

            mock('@hint/utils/dist/src/packages/load-package', { loadPackage: utils.loadPackage });
        },
        name: 'Configuration with no explicit "compilerOptions.importHelpers" and no "tslib" installed should fail',
        path: path.join(__dirname, 'fixtures', 'import-helpers', 'no-import'),
        reports: [
            {
                message: 'The compiler option "importHelpers" should be enabled to reduce the output size.',
                position: { match: 'compilerOptions' },
                severity: Severity.warning
            },
            {
                message: `Couldn't find package "tslib".`,
                severity: Severity.error
            }
        ]
    }
];

testLocalHint(hintPath, tests, { parsers: ['typescript-config'], serial: true });
