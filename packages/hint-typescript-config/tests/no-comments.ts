import * as path from 'path';

import { getHintPath, HintLocalTest, testLocalHint } from '@hint/utils-tests-helpers';
import { Severity } from '@hint/utils-types';

const hintPath = getHintPath(__filename, true);

const tests: HintLocalTest[] = [
    {
        name: 'Configuration with "compilerOptions.removeComments = true" should pass',
        path: path.join(__dirname, 'fixtures', 'no-comments', 'valid')
    },
    {
        name: 'Configuration with "compilerOptions.removeComments = false" should fail',
        path: path.join(__dirname, 'fixtures', 'no-comments', 'invalid'),
        reports: [{
            message: 'The compiler option "removeComments" should be enabled to reduce the output size.',
            severity: Severity.warning
        }]
    },
    {
        name: 'Configuration with "compilerOptions.removeComments = false" in extends should fail',
        path: path.join(__dirname, 'fixtures', 'extends-with-error'),
        reports: [{
            message: 'The compiler option "removeComments" should be enabled to reduce the output size.',
            position: { match: '"../no-comments/invalid/tsconfig.json"' },
            severity: Severity.warning
        }]
    },
    {
        name: 'Configuration without "compilerOptions" should fail',
        path: path.join(__dirname, 'fixtures', 'no-compiler-options'),
        reports: [{
            message: 'The compiler option "removeComments" should be enabled to reduce the output size.',
            position: { match: '"../no-comments/invalid/tsconfig.json"' },
            severity: Severity.warning
        }]
    }
];

testLocalHint(hintPath, tests, { parsers: ['typescript-config'] });
