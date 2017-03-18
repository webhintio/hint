/* eslint sort-keys: 0, no-undefined: 0 */
import * as path from 'path';

import { Rule } from '../../../../lib/types'; // eslint-disable-line no-unused-vars
import { RuleTest } from '../../../helpers/rule-test-type'; // eslint-disable-line no-unused-vars

import * as ruleRunner from '../../../helpers/rule-runner';
import * as rule from '../../../../lib/rules/lang-attribute/lang-attribute';

const tests: Array<RuleTest> = [
    {
        name: `'lang' attribute is not specified fails`,
        events: [{
            name: 'element::html',
            fixture: path.resolve(__dirname, './fixtures/no-lang-attribute.html')
        }],
        report: {
            message: `'lang' attribute not specified on the 'html' element`,
            position: undefined
        }
    },
    {
        name: `'lang' attribute is specified with no value fails`,
        events: [{
            name: 'element::html',
            fixture: path.resolve(__dirname, './fixtures/lang-attribute-with-no-value.html')
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
            fixture: path.resolve(__dirname, './fixtures/lang-attribute-with-value-of-empty-string.html')
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
            fixture: path.resolve(__dirname, './fixtures/lang-attribute-with-valid-value.html')
        }]
    }

];

ruleRunner.testRule(<Rule>rule, tests);
