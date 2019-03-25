import * as path from 'path';

import { test } from '@hint/utils';
import { HintLocalTest, testLocalHint } from '@hint/utils-tests-helpers';

const { getHintPath } = test;
const hintPath = getHintPath(__filename, true);

const tests: HintLocalTest[] = [
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

testLocalHint(hintPath, tests, { parsers: ['webpack-config'] });
