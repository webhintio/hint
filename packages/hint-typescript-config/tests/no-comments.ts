import * as path from 'path';

import { getHintPath } from 'hint/dist/src/lib/utils/hint-helpers';
import * as hintRunner from '@hint/utils-tests-helpers/dist/src/hint-runner';
import { HintLocalTest } from '@hint/utils-tests-helpers/dist/src/hint-test-type';

const hintPath = getHintPath(__filename, true);

const tests: HintLocalTest[] = [
    {
        name: 'Configuration with "compilerOptions.removeComments = true" should pass',
        path: path.join(__dirname, 'fixtures', 'no-comments', 'valid')
    },
    {
        name: 'Configuration with "compilerOptions.removeComments = false" should fail',
        path: path.join(__dirname, 'fixtures', 'no-comments', 'invalid'),
        reports: [{ message: 'The compiler option "removeComments" should be enabled to reduce the output size.' }]
    },
    {
        name: 'Configuration with "compilerOptions.removeComments = false" in extends should fail',
        path: path.join(__dirname, 'fixtures', 'extends-with-error'),
        reports: [{
            message: 'The compiler option "removeComments" should be enabled to reduce the output size.',
            position: { match: 'extends' }
        }]
    }
];

hintRunner.testLocalHint(hintPath, tests, { parsers: ['typescript-config'] });
