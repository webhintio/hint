import * as path from 'path';

import { getHintPath, HintLocalTest, testLocalHint } from '@hint/utils-tests-helpers';
import { Severity } from '@hint/utils-types';

const hintPath = getHintPath(__filename, true);

const tests: HintLocalTest[] = [
    {
        name: 'Configuration with "compilerOptions.importHelpers = true" should pass',
        overrides: {
            '@hint/utils': {
                loadPackage() {
                    return { exists: true };
                }
            }
        },
        path: path.join(__dirname, 'fixtures', 'import-helpers', 'import')
    },
    {
        name: 'Configuration with "compilerOptions.importHelpers = true" but tslibs is not installed should fail',
        overrides: {
            '@hint/utils': {
                loadPackage() {
                    throw new Error('Not found');
                }
            }
        },
        path: path.join(__dirname, 'fixtures', 'import-helpers', 'import'),
        reports: [{
            message: `Couldn't find package "tslib".`,
            severity: Severity.error
        }]
    },
    {
        name: 'Configuration with "compilerOptions.importHelpers = false" should fail',
        overrides: {
            '@hint/utils': {
                loadPackage() {
                    return { exists: true };
                }
            }
        },
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
        name: 'Configuration with no explicit "compilerOptions.importHelpers" should fail',
        overrides: {
            '@hint/utils': {
                loadPackage() {
                    return { exists: true };
                }
            }
        },
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
        name: 'Configuration with no explicit "compilerOptions.importHelpers" and no "tslib" installed should fail',
        overrides: {
            '@hint/utils': {
                loadPackage() {
                    throw new Error('Not found');
                }
            }
        },
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
