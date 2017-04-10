/* eslint sort-keys: 0, no-undefined: 0 */

import { RuleTest } from '../../../helpers/rule-test-type'; // eslint-disable-line no-unused-vars
import * as ruleRunner from '../../../helpers/rule-runner';
import { getRuleName } from '../../../../lib/util/rule-helpers';

const tests: Array<RuleTest> = [
    {
        name: `'lang' attribute is not specified`,
        reports: [{ message: `'lang' attribute not specified on the 'html' element` }],
        serverConfig:
`<!doctype html>
<html>
    <head>
        <title>test</title>
    </head>
    <body></body>
</html>`
    },
    {
        name: `'lang' attribute is specified with no value`,
        reports: [{
            message: `empty 'lang' attribute specified on the 'html' element`,
            position: { column: 7, line: 1 }
        }],
        serverConfig:
`<!doctype html><html lang><head>
        <title>test</title>
    </head>
    <body></body>
</html>`
    },
    {
        name: `'lang' attribute is specified and its value is an empty string`,
        reports: [{
            message: `empty 'lang' attribute specified on the 'html' element`,
            position: { column: 7, line: 1 }
        }],
        serverConfig:
`<!doctype html><html lang=""><head>
        <title>test</title>
    </head>
    <body></body>
</html>`
    },
    {
        name: `'lang' attribute is specified and its value is not an empty string`,
        serverConfig:
`<!doctype html>
<html lang="en">
    <head>
        <title>test</title>
    </head>
    <body></body>
</html>`
    }
];

ruleRunner.testRule(getRuleName(__dirname), tests);
