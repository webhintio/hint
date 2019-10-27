import * as path from 'path';

import { test } from '@hint/utils';
import { HintLocalTest, testLocalHint } from '@hint/utils-tests-helpers';

const { getHintPath } = test;
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
                position: { match: 'false' }
            }
        ]
    },
    {
        name: 'Configuration with no explicit "compilerOptions.strict" should fail',
        path: path.join(__dirname, 'fixtures', 'strict', 'no-strict'),
        reports: [
            {
                message: 'The compiler option "strict" should be enabled to reduce type errors.',
                position: { match: 'compilerOptions' }
            }
        ]
    }
];

testLocalHint(hintPath, tests, { parsers: ['typescript-config'] });
