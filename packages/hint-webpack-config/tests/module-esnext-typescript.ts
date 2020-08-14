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
            process.chdir(path.join(__dirname, 'fixtures', 'tsvalid'));
        },
        name: 'If TS configuration is valid and webpack version >=2 should pass',
        path: path.join(__dirname, 'fixtures', 'tsvalid')
    },
    {
        after() {
            process.chdir(cwd);
        },
        before() {
            process.chdir(path.join(__dirname, 'fixtures', 'tsinvalid'));
        },
        name: `If TS configuration is not valid, is should fail`,
        path: path.join(__dirname, 'fixtures', 'tsinvalid'),
        reports: [{
            message: 'TypeScript `compilerOptions.module` option should be `esnext`',
            severity: Severity.error
        }]
    },
    {
        after() {
            process.chdir(cwd);
        },
        before() {
            process.chdir(path.join(__dirname, 'fixtures', 'version1'));
        },
        name: 'If TS configuration is invalid, but webpack version is < 2, it should pass',
        path: path.join(__dirname, 'fixtures', 'tsinvalid')
    }
];

const generateTest = (testName: string): HintLocalTest[] => {
    return [
        {
            after() {
                process.chdir(cwd);
            },
            before() {
                process.chdir(path.join(__dirname, 'fixtures', 'tsvalid'));
            },
            name: testName,
            path: path.join(__dirname, 'fixtures', 'tsvalid')
        }
    ];
};

testLocalHint(hintPath, tests, {
    parsers: ['webpack-config', 'typescript-config'],
    serial: true
});
testLocalHint(hintPath, generateTest(`If 'webpack-config' parser is not in the configuration it should pass`), {
    parsers: [],
    serial: true
});
testLocalHint(hintPath, generateTest(`if 'typescript-config' parser is no in the configuration it should pass`), {
    parsers: ['webpack-config'],
    serial: true
});
