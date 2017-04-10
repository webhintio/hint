/* eslint sort-keys: 0, no-undefined: 0 */

import { RuleTest } from '../../../helpers/rule-test-type'; // eslint-disable-line no-unused-vars
import * as ruleRunner from '../../../helpers/rule-runner';
import { getRuleName } from '../../../../src/lib/util/rule-helpers';

const ruleName = getRuleName(__dirname);

const htmlPage =
`<!doctype html>
 <html lang="en">
    <head>
        <title>test</title>
    </head>
    <body>
        <script src="test.js"></script>
    </body>
</html>`;

const testsForDefaults: Array<RuleTest> = [
    {
        name: `Response does not contain any of the disallowed headers`,
        serverConfig: {
            '/': htmlPage,
            '/test.js': ''
        }
    },
    {
        name: `Response contains one disallowed header`,
        reports: [
            { message: `Disallowed HTTP header found: x-powered-by` },
            { message: `Disallowed HTTP header found: x-aspnetmvc-version` }
        ],
        serverConfig: {
            '/': {
                content: htmlPage,
                headers: { 'X-Powered-By': 'test' }
            },
            '/test.js': {
                content: '',
                headers: { 'X-AspNetMvc-Version': 'test' }
            }
        }
    },
    {
        name: `Response contains multiple disallowed headers`,
        reports: [
            { message: `Disallowed HTTP headers found: server, x-powered-by` },
            { message: `Disallowed HTTP headers found: server, x-aspnetmvc-version` }
        ],
        serverConfig: {
            '/': {
                content: htmlPage,
                headers: {
                    Server: 'test',
                    'X-Powered-By': 'test'
                }
            },
            '/test.js': {
                content: '',
                headers: {
                    Server: 'test',
                    'X-AspNetMvc-Version': 'test'
                }
            }
        }
    }
];

const testsForIgnoreConfigs: Array<RuleTest> = [
    {
        name: `Response contains default disallowed headers that are ignored because of the configurations`,
        serverConfig: {
            '/': {
                content: htmlPage,
                headers: {
                    Server: 'test',
                    'X-Powered-By': 'test'
                }
            },
            '/test.js': {
                content: '',
                headers: {
                    Server: 'test',
                    'X-Test-1': 'test'
                }
            }
        }
    }
];

const testsForIncludeConfigs: Array<RuleTest> = [
    {
        name: `Response contains headers that are disallowed because of the configurations`,
        reports: [
            { message: `Disallowed HTTP headers found: server, x-test-1, x-test-2` },
            { message: `Disallowed HTTP headers found: server, x-test-2` }
        ],
        serverConfig: {
            '/': {
                content: htmlPage,
                headers: {
                    Server: 'test',
                    'X-Test-1': 'test',
                    'X-Test-2': 'test'
                }
            },
            '/test.js': {
                content: '',
                headers: {
                    Server: 'test',
                    'X-Test-2': 'test'
                }
            }
        }
    }
];

const testsForConfigs: Array<RuleTest> = [
    {
        name: `Response contains headers that are both disallowed and ignored because of configurations`,
        reports: [
            { message: `Disallowed HTTP headers found: x-powered-by, x-test-1` },
            { message: `Disallowed HTTP header found: x-powered-by` }
        ],
        serverConfig: {
            '/': {
                content: htmlPage,
                headers: {
                    Server: 'test',
                    'X-Powered-By': 'test',
                    'X-Test-1': 'test',
                    'X-Test-2': 'test'
                }
            },
            '/test.js': {
                content: '',
                headers: {
                    Server: 'test',
                    'X-Powered-By': 'test',
                    'X-Test-2': 'test',
                    'X-Test-3': 'test'
                }
            }
        }
    }
];

ruleRunner.testRule(ruleName, testsForDefaults);
ruleRunner.testRule(ruleName, testsForIgnoreConfigs, { ignore: ['Server', 'X-Powered-By', 'X-Test-1'] });
ruleRunner.testRule(ruleName, testsForIncludeConfigs, { include: ['Server', 'X-Test-1', 'X-Test-2'] });
ruleRunner.testRule(ruleName, testsForConfigs, {
    ignore: ['Server', 'X-Test-2', 'X-Test-3'],
    include: ['X-Powered-By', 'X-Test-1', 'X-Test-2']
});
