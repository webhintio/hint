/* eslint sort-keys: 0, no-undefined: 0 */
import * as path from 'path';

import { Rule } from '../../../../lib/types'; // eslint-disable-line no-unused-vars
import { RuleTest } from '../../../helpers/rule-test-type'; // eslint-disable-line no-unused-vars

import * as ruleRunner from '../../../helpers/rule-runner';
import * as rule from '../../../../lib/rules/manifest-file-extension/manifest-file-extension';

const tests: Array<RuleTest> = [
    {
        name: `Web app manifest file is not specified`,
        events: [{
            name: 'element::link',
            fixture: path.resolve(__dirname, './fixtures/no-manifest.html')
        }]
    },
    {
        name: `Web app manifest file has incorrect file extension`,
        events: [{
            name: 'element::link',
            fixture: path.resolve(__dirname, './fixtures/manifest-with-incorrect-extension.html')
        }],
        report: {
            message: `The file extension for the web app manifest file ('site.json') should be '.webmanifest' not '.json'`,
            position: { column: 32, line: 3 }
        }
    },
    {
        name: `Web app manifest file has correct file extension`,
        events: [{
            name: 'element::link',
            fixture: path.resolve(__dirname, './fixtures/manifest-with-correct-extension.html')
        }]
    }
];

ruleRunner.testRule(<Rule>rule, tests);
