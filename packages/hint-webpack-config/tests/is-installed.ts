import * as path from 'path';

import { getHintPath, HintLocalTest, testLocalHint } from '@hint/utils-tests-helpers';
import { Severity } from '@hint/utils-types';

const cwd = process.cwd();
const hintPath = getHintPath(__filename, true);
const tests: HintLocalTest[] = [
    {
        after() {
            process.chdir(cwd);
        },
        before() {
            process.chdir(path.join(__dirname, 'fixtures', 'valid'));
        },
        name: 'If valid configuration file exists and webpack is installed should pass',
        path: path.join(__dirname, 'fixtures', 'valid')
    },
    {
        after() {
            process.chdir(cwd);
        },
        before() {
            process.chdir(path.join(__dirname, 'fixtures'));
        },
        name: 'If valid configuration file exists but webpack is not installed should fail',
        path: path.join(__dirname, 'fixtures', 'valid'),
        reports: [{
            message: `webpack is not installed in your project.`,
            severity: Severity.warning
        }]
    }
];

testLocalHint(hintPath, tests, {
    parsers: ['webpack-config'],
    serial: true
});
