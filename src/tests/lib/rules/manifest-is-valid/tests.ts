/* eslint sort-keys: 0, no-undefined: 0 */
import * as path from 'path';

import { Rule } from '../../../../lib/types'; // eslint-disable-line no-unused-vars
import { RuleTest } from '../../../helpers/rule-test-type'; // eslint-disable-line no-unused-vars

import * as ruleRunner from '../../../helpers/rule-runner';
import * as rule from '../../../../lib/rules/manifest-is-valid/manifest-is-valid';

const tests: Array<RuleTest> = [
    {
        name: `Web app manifest is not specified`,
        events: [{
            name: 'element::link',
            fixture: path.resolve(__dirname, './fixtures/manifest-not-specified.html')
        }]
    },
    {
        name: `Web app manifest is specified with no 'href'`,
        events: [{
            name: 'element::link',
            fixture: path.resolve(__dirname, './fixtures/manifest-specified-with-no-href.html')
        }]
    },
    {
        name: `Web app manifest is specified with empty 'href'`,
        events: [{
            name: 'element::link',
            fixture: path.resolve(__dirname, './fixtures/manifest-specified-with-empty-href.html')
        }]
    },
    {
        name: `Web app manifest is specified and its content is valid JSON`,
        events: [{
            name: 'element::link',
            fixture: path.resolve(__dirname, './fixtures/manifest-specified.html'),
            networkData: [{
                request: { headers: null },
                response: {
                    body: '{}',
                    headers: null,
                    statusCode: 200
                }
            }]
        }]
    },
    {
        name: `Web app manifest is specified and its content is not valid JSON`,
        events: [{
            name: 'element::link',
            fixture: path.resolve(__dirname, './fixtures/manifest-specified-as-full-url.html'),
            networkData: [{
                request: { headers: null },
                response: {
                    body: 'x',
                    headers: null,
                    statusCode: 200
                }
            }]
        }],
        report: { message: `Web app manifest file doesn't contain valid JSON` }
    },
    {
        name: `Web app manifest is specified as a full URL and its content is valid JSON`,
        events: [{
            name: 'element::link',
            fixture: path.resolve(__dirname, './fixtures/manifest-specified-as-full-url.html'),
            networkData: [{
                request: { headers: null },
                response: {
                    body: '{}',
                    headers: null,
                    statusCode: 200
                }
            }]
        }]
    },
    {
        name: `Web app manifest is specified and request for file fails`,
        events: [{
            name: 'element::link',
            fixture: path.resolve(__dirname, './fixtures/manifest-specified.html')
        }]
    },
    {
        name: `Web app manifest is specified and request for file fails with status code`,
        events: [{
            name: 'element::link',
            fixture: path.resolve(__dirname, './fixtures/manifest-specified.html'),
            networkData: [{
                request: { headers: null },
                response: {
                    body: null,
                    headers: null,
                    statusCode: 404
                }
            }]
        }]
    }
];

ruleRunner.testRule(<Rule>rule, tests);
