import * as path from 'path';

import { getHintPath } from 'hint/dist/src/lib/utils/hint-helpers';
import * as hintRunner from '@hint/utils-tests-helpers/dist/src/hint-runner';
import { HintLocalTest } from '@hint/utils-tests-helpers/dist/src/hint-test-type';

const hintPath = getHintPath(__filename, true);

const tests: Array<HintLocalTest> = [
    {
        name: 'Valid configuration should pass',
        path: path.join(__dirname, 'fixtures', 'valid')
    },
    {
        name: `If there is no config file, it should pass`,
        path: path.join(__dirname, 'fixtures', 'noconfig')
    },
    {
        name: 'Invalid configuration should fail',
        path: path.join(__dirname, 'fixtures', 'invalidconfig'),
        reports: [{ message: `Invalid or unexpected token` }]
    }
];

hintRunner.testLocalHint(hintPath, tests, { parsers: ['webpack-config'] });
