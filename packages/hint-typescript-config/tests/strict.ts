import * as path from 'path';

import { getHintPath } from 'hint/dist/src/lib/utils/hint-helpers';
import * as hintRunner from '@hint/utils-tests-helpers/dist/src/hint-runner';
import { HintLocalTest } from '@hint/utils-tests-helpers/dist/src/hint-test-type';

const hintPath = getHintPath(__filename, true);

const tests: Array<HintLocalTest> = [
    {
        name: 'Configuration with "compilerOptions.strict = true" should pass',
        path: path.join(__dirname, 'fixtures', 'strict', 'strict-true')
    },
    {
        name: 'Configuration with "compilerOptions.strict = false" should fail',
        path: path.join(__dirname, 'fixtures', 'strict', 'strict-false'),
        reports: [{message: 'The compiler option "strict" should be enabled to reduce type errors.'}]
    },
    {
        name: 'Configuration with no explicit "compilerOptions.strict" should fail',
        path: path.join(__dirname, 'fixtures', 'strict', 'no-strict'),
        reports: [{message: 'The compiler option "strict" should be enabled to reduce type errors.'}]
    }
];

hintRunner.testLocalHint(hintPath, tests, {parsers: ['typescript-config']});
