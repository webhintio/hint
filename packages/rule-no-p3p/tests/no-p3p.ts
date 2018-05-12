/* eslint no-undefined: 0 */

import { generateHTMLPage } from 'sonarwhal/dist/tests/helpers/misc';
import { RuleTest } from 'sonarwhal/dist/tests/helpers/rule-test-type';
import * as ruleRunner from 'sonarwhal/dist/tests/helpers/rule-runner';
import { getRuleName } from 'sonarwhal/dist/src/lib/utils/rule-helpers';

const ruleName = getRuleName(__dirname);
const htmlPage = generateHTMLPage(undefined, '<script src="test.js"></script>');

const testsForDefaults: Array<RuleTest> = [
    {
        name: `P3P header is deprecated`,
        reports: [{ message: 'P3P is deprecated and should not be used' }, { message: 'P3P is deprecated and should not be used' }],
        serverConfig: {
            '/': {
                content: htmlPage,
                headers: {P3P: 'something'}
            },
            '/test.js': {headers: {p3p: 'something'}}
        }
    },
    {
        name: `No P3P header exists`,
        serverConfig: {
            '/': {content: htmlPage},
            '/test.js': {}
        }
    }
];

ruleRunner.testRule(ruleName, testsForDefaults);
