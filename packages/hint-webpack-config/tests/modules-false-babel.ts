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
            process.chdir(path.join(__dirname, 'fixtures', 'babelvalid'));
        },
        name: 'If babel configuration is valid and webpack version >=2 should pass',
        path: path.join(__dirname, 'fixtures', 'babelvalid')
    },
    {
        after() {
            process.chdir(cwd);
        },
        before() {
            process.chdir(path.join(__dirname, 'fixtures', 'babelinvalid'));
        },
        name: `If babel configuration is not valid, is should fail`,
        path: path.join(__dirname, 'fixtures', 'babelinvalid'),
        reports: [{
            message: 'Babel presets `modules` option should be `false`',
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
        name: 'If babel configuration is invalid, but webpack version is < 2, it should pass',
        path: path.join(__dirname, 'fixtures', 'babelinvalid')
    }
];

const generateTest = (testName: string): HintLocalTest[] => {
    return [
        {
            after() {
                process.chdir(cwd);
            },
            before() {
                process.chdir(path.join(__dirname, 'fixtures', 'babelvalid'));
            },
            name: testName,
            path: path.join(__dirname, 'fixtures', 'babelvalid')
        }
    ];
};

testLocalHint(hintPath, tests, {
    parsers: ['webpack-config', 'babel-config'],
    serial: true
});
testLocalHint(hintPath, generateTest(`If 'webpack-config' parser is not in the configuration it should pass`), {
    parsers: [],
    serial: true
});
testLocalHint(hintPath, generateTest(`If 'babel-config' parser is not in the configuration it should pass`), {
    parsers: ['webpack-config'],
    serial: true
});
