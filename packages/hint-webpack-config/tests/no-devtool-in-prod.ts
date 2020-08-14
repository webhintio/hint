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
        name: 'If no devtool in configuration, it should pass',
        path: path.join(__dirname, 'fixtures', 'valid')
    },
    {
        after() {
            process.chdir(cwd);
        },
        before() {
            process.chdir(path.join(__dirname, 'fixtures', 'valid'));
        },
        name: 'If devtool has a value different than `eval`, it should pass',
        path: path.join(__dirname, 'fixtures', 'noeval')
    },
    {
        after() {
            process.chdir(cwd);
        },
        before() {
            process.chdir(path.join(__dirname, 'fixtures', 'valid'));
        },
        name: 'If devtool is set to `eval` should fail',
        path: path.join(__dirname, 'fixtures', 'eval'),
        reports: [{
            message: '`eval` not recommended for prodution',
            severity: Severity.warning
        }]
    }
];

testLocalHint(hintPath, tests, {
    parsers: ['webpack-config'],
    serial: true
});
