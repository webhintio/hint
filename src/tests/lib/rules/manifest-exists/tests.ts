/* eslint sort-keys: 0, no-undefined: 0 */
import * as path from 'path';

import { Rule } from '../../../../lib/types'; // eslint-disable-line no-unused-vars
import { RuleTest } from '../../../helpers/rule-test-type'; // eslint-disable-line no-unused-vars

import * as ruleRunner from '../../../helpers/rule-runner';
import * as rule from '../../../../lib/rules/manifest-exists/manifest-exists';

const tests: Array<RuleTest> = [
    {
        name: `Web app manifest file is not specified`,
        events: [{
            name: 'element::link',
            fixture: path.resolve(__dirname, './fixtures/no-manifest.html')
        }, {
            name: 'traverse::end',
            fixture: path.resolve(__dirname, './fixtures/no-manifest.html')
        }],
        report: { message: 'Web app manifest file not specified' }
    },
    {
        name: `Web app manifest is already specified`,
        // TODO:
        events: [{
            name: 'element::link::0',
            fixture: path.resolve(__dirname, './fixtures/manifest-specified-multiple-times.html')
        }, {
            name: 'element::link::1',
            fixture: path.resolve(__dirname, './fixtures/manifest-specified-multiple-times.html')
        }],
        report: { message: 'Web app manifest file already specified' }
    },
    {
        name: `Web app manifest is specified with no 'href'`,
        events: [{
            name: 'element::link',
            fixture: path.resolve(__dirname, './fixtures/manifest-specified-with-no-href.html')
        }],
        report: { message: `Web app manifest file is specified with invalid 'href'` }
    },
    {
        name: `Web app manifest is specified with empty 'href'`,
        events: [{
            name: 'element::link',
            fixture: path.resolve(__dirname, './fixtures/manifest-specified-with-empty-href.html')
        }],
        report: { message: `Web app manifest file is specified with invalid 'href'` }
    },
    {
        name: `Web app manifest is specified but the file does not exists`,
        events: [{
            name: 'element::link',
            fixture: path.resolve(__dirname, './fixtures/manifest-specified-and-file-does-not-exist.html')
        }],
        report: { message: `Web app manifest file cannot be fetched` }
    },
    {
        name: `Web app manifest is specified and the file exists`,
        events: [{
            name: 'element::link',
            fixture: path.resolve(__dirname, './fixtures/manifest-specified-and-file-does-exist.html')
        }]
    }
];

ruleRunner.testRule(<Rule>rule, tests);
