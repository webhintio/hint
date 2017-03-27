/* eslint sort-keys: 0, no-undefined: 0 */

import { Rule } from '../../../../lib/types'; // eslint-disable-line no-unused-vars
import { RuleTest } from '../../../helpers/rule-test-type'; // eslint-disable-line no-unused-vars
import { createNetworkDataFromText } from '../../../helpers/network-data';

import * as ruleRunner from '../../../helpers/rule-runner';
import * as rule from '../../../../lib/rules/lang-attribute/lang-attribute';

const htmlWithLangAttrWithNoValue = createNetworkDataFromText(
`<!doctype html>
<html lang>
    <head>
        <title>test</title>
    </head>
    <body></body>
</html>`);

const htmlWithLangAttrWithValidValue = createNetworkDataFromText(
`<!doctype html>
<html lang="en">
    <head>
        <title>test</title>
    </head>
    <body></body>
</html>`);

const htmlWithLangAttrWithValueOfEmptyString = createNetworkDataFromText(
`<!doctype html>
<html lang="">
    <head>
        <title>test</title>
    </head>
    <body></body>
</html>`);

const htmlWithNoLangAttr = createNetworkDataFromText(
`<!doctype html>
<html>
    <head>
        <title>test</title>
    </head>
    <body></body>
</html>`);

const tests: Array<RuleTest> = [
    {
        name: `'lang' attribute is not specified fails`,
        events: [{
            name: 'element::html',
            networkData: [htmlWithNoLangAttr]
        }],
        report: {message: `'lang' attribute not specified on the 'html' element` }
    },
    {
        name: `'lang' attribute is specified with no value fails`,
        events: [{
            name: 'element::html',
            networkData: [htmlWithLangAttrWithNoValue]
        }],
        report: {
            message: `empty 'lang' attribute specified on the 'html' element`,
            position: { column: 7, line: 1 }
        }
    },
    {
        name: `'lang' attribute is specified and its value is an empty string fails`,
        events: [{
            name: 'element::html',
            networkData: [htmlWithLangAttrWithValueOfEmptyString]
        }],
        report: {
            message: `empty 'lang' attribute specified on the 'html' element`,
            position: { column: 7, line: 1 }
        }
    },
    {
        name: `'lang' attribute is specified and its value is not an empty string passes`,
        events: [{
            name: 'element::html',
            networkData: [htmlWithLangAttrWithValidValue]
        }]
    }

];

ruleRunner.testRule(<Rule>rule, tests);
