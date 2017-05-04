/* eslint sort-keys: 0, no-undefined: 0 */

import { getRuleName } from '../../../../src/lib/utils/rule-helpers';
import { RuleTest } from '../../../helpers/rule-test-type'; // eslint-disable-line no-unused-vars
import * as ruleRunner from '../../../helpers/rule-runner';

const generateHTMLPage = (langAttributeValue: string = ''): string => {
    return `<!doctype html>
<html ${langAttributeValue}>
    <head>
        <title>test</title>
    </head>
    <body></body>
</html>`;
};

const tests: Array<RuleTest> = [
    {
        name: `'lang' attribute is not specified`,
        reports: [{ message: `'lang' attribute not specified on the 'html' element` }],
        serverConfig: generateHTMLPage()

    },
    {
        name: `'lang' attribute is specified with no value`,
        reports: [{
            message: `empty 'lang' attribute specified on the 'html' element`,
            position: { column: 7, line: 1 }
        }],
        serverConfig: generateHTMLPage('lang')
    },
    {
        name: `'lang' attribute is specified and its value is an empty string`,
        reports: [{
            message: `empty 'lang' attribute specified on the 'html' element`,
            position: { column: 7, line: 1 }
        }],
        serverConfig: generateHTMLPage('lang=""')
    },
    {
        name: `'lang' attribute is specified and its value is not an empty string`,
        serverConfig: generateHTMLPage('lang="en"')
    }
];

ruleRunner.testRule(getRuleName(__dirname), tests);
