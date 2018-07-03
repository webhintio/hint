import * as path from 'path';

import { getHintPath } from 'hint/dist/src/lib/utils/hint-helpers';
import * as hintRunner from '@hint/utils-tests-helpers/dist/src/hint-runner';
import { HintLocalTest } from '@hint/utils-tests-helpers/dist/src/hint-test-type';

const hintPath = getHintPath(__filename, true);

const tests: Array<HintLocalTest> = [
    {
        name: 'If valid configuration file exists should pass',
        path: path.join(__dirname, 'fixtures', 'valid')
    },
    {
        name: `If invalid configuration file exists it should pass`,
        path: path.join(__dirname, 'fixtures', 'invalidconfig')
    },
    {
        name: 'If there is no config file, it should fail',
        path: path.join(__dirname, 'fixtures', 'noconfig'),
        reports: [{ message: `webpack configuration file not found in your project.` }]
    }
];

hintRunner.testLocalHint(hintPath, tests, { parsers: ['webpack-config'] });
