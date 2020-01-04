import * as path from 'path';

import { getHintPath, HintLocalTest, testLocalHint } from '@hint/utils-tests-helpers';
import { Severity } from '@hint/utils-types';

const hintPath = getHintPath(__filename, true);

const tests: HintLocalTest[] = [
    {
        name: 'Configuration with "compilerOptions.strict = true" should pass',
        path: path.join(__dirname, 'fixtures', 'strict', 'strict-true')
    },
    {
        name: 'Configuration with "compilerOptions.strict = false" should fail',
        path: path.join(__dirname, 'fixtures', 'strict', 'strict-false'),
        reports: [
            {
                message: 'The compiler option "strict" should be enabled to reduce type errors.',
                position: { match: 'false' },
                severity: Severity.error
            }
        ]
    },
    {
        name: 'Configuration with no explicit "compilerOptions.strict" should fail',
        path: path.join(__dirname, 'fixtures', 'strict', 'no-strict'),
        reports: [
            {
                message: 'The compiler option "strict" should be enabled to reduce type errors.',
                position: { match: 'compilerOptions' },
                severity: Severity.error
            }
        ]
    }
];

testLocalHint(hintPath, tests, { parsers: ['typescript-config'] });
