/* eslint sort-keys: 0, no-undefined: 0 */
import * as path from 'path';

import { Rule } from '../../../../lib/types'; // eslint-disable-line no-unused-vars
import { RuleTest } from '../../../helpers/rule-test-type'; // eslint-disable-line no-unused-vars

import * as ruleRunner from '../../../helpers/rule-runner';
import * as rule from '../../../../lib/rules/manifest-exists/manifest-exists';

const tests: Array<RuleTest> = [
    {
        name: `Web app manifest is not specified`,
        events: [{
            name: 'element::link',
            fixture: path.resolve(__dirname, './fixtures/manifest-not-specified.html')
        }, {
            name: 'traverse::end',
            fixture: path.resolve(__dirname, './fixtures/manifest-not-specified.html')
        }],
        report: { message: 'Web app manifest not specified' }
    },
    {
        name: `Web app manifest is already specified`,
        events: [{
            name: 'element::link::0',
            fixture: path.resolve(__dirname, './fixtures/manifest-specified-multiple-times.html'),
            networkData: [{
                request: { headers: null },
                response: {
                    body: null,
                    headers: null,
                    statusCode: 200
                }
            }]
        }, {
            name: 'element::link::1',
            fixture: path.resolve(__dirname, './fixtures/manifest-specified-multiple-times.html')
        },
        {
            name: 'traverse::end',
            fixture: path.resolve(__dirname, './fixture/manifest-specified-multiple-times.html')
        }],
        report: { message: 'Web app manifest already specified' }
    },
    {
        name: `Web app manifest is specified with no 'href'`,
        events: [{
            name: 'element::link',
            fixture: path.resolve(__dirname, './fixtures/manifest-specified-with-no-href.html')
        }],
        report: { message: `Web app manifest specified with invalid 'href'` }
    },
    {
        name: `Web app manifest is specified with empty 'href'`,
        events: [{
            name: 'element::link',
            fixture: path.resolve(__dirname, './fixtures/manifest-specified-with-empty-href.html')
        }],
        report: { message: `Web app manifest specified with invalid 'href'` }
    },
    {
        name: `Web app manifest is specified as a full URL`,
        events: [{
            name: 'element::link',
            fixture: path.resolve(__dirname, './fixtures/manifest-specified-as-full-url.html'),
            networkData: [{
                request: { headers: null },
                response: {
                    body: null,
                    headers: null,
                    statusCode: 200
                }
            }]
        }]
    },
    {
        name: `Web app manifest is specified and the file exists`,
        events: [{
            name: 'element::link',
            fixture: path.resolve(__dirname, './fixtures/manifest-specified-and-file-does-exist.html'),
            networkData: [{
                request: { headers: null },
                response: {
                    body: null,
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
            fixture: path.resolve(__dirname, './fixtures/manifest-specified-and-file-does-not-exist.html')
        }],
        report: { message: `Web app manifest file request failed` }
    },
    {
        name: `Web app manifest is specified and request for file fails with status code 404`,
        events: [{
            name: 'element::link',
            fixture: path.resolve(__dirname, './fixtures/manifest-specified-and-file-does-exist.html'),
            networkData: [{
                request: { headers: null },
                response: {
                    body: null,
                    headers: null,
                    statusCode: 404
                }
            }]
        }],
        report: { message: `Web app manifest file could not be fetched (status code: 404)` }
    },
    {
        name: `Web app manifest is specified and request for file fails with status code 500`,
        events: [{
            name: 'element::link',
            fixture: path.resolve(__dirname, './fixtures/manifest-specified-and-file-does-exist.html'),
            networkData: [{
                request: { headers: null },
                response: {
                    body: null,
                    headers: null,
                    statusCode: 500
                }
            }]
        }],
        report: { message: `Web app manifest file could not be fetched (status code: 500)` }
    }
];

ruleRunner.testRule(<Rule>rule, tests);
