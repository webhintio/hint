/* eslint sort-keys: 0, no-undefined: 0 */

import { IRule } from '../../../../lib/interfaces'; // eslint-disable-line no-unused-vars
import { RuleTest } from '../../../helpers/rule-test-type'; // eslint-disable-line no-unused-vars

import * as ruleRunner from '../../../helpers/rule-runner';

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
                    'X-Test1': 'test'
                }
            }
        }
    }
];

const testsForIncludeConfigs: Array<RuleTest> = [
    {
        name: `Response contains headers that are disallowed because of the configurations`,
        reports: [
            { message: `Disallowed HTTP headers found: server, x-test1, x-test2` },
            { message: `Disallowed HTTP headers found: server, x-test2` }
        ],
        serverConfig: {
            '/': {
                content: htmlPage,
                headers: {
                    Server: 'test',
                    'X-Test1': 'test',
                    'X-Test2': 'test'
                }
            },
            '/test.js': {
                content: '',
                headers: {
                    Server: 'test',
                    'X-Test2': 'test'
                }
            }
        }
    }
];

const testsForConfigs: Array<RuleTest> = [
    {
        name: `Response contains headers that are both disallowed and ignored because of configurations`,
        reports: [
            { message: `Disallowed HTTP headers found: x-powered-by, x-test1` },
            { message: `Disallowed HTTP header found: x-powered-by` }
        ],
        serverConfig: {
            '/': {
                content: htmlPage,
                headers: {
                    Server: 'test',
                    'X-Powered-By': 'test',
                    'X-Test1': 'test',
                    'X-Test2': 'test'
                }
            },
            '/test.js': {
                content: '',
                headers: {
                    Server: 'test',
                    'X-Powered-By': 'test',
                    'X-Test2': 'test',
                    'X-Test3': 'test'
                }
            }
        }
    }
];

ruleRunner.testRule('disallowed-headers', testsForDefaults);
ruleRunner.testRule('disallowed-headers', testsForIgnoreConfigs, { ignore: ['Server', 'X-Powered-By', 'X-Test1'] });
ruleRunner.testRule('disallowed-headers', testsForIncludeConfigs, { include: ['Server', 'X-Test1', 'X-Test2'] });
ruleRunner.testRule('disallowed-headers', testsForConfigs, {
    ignore: ['Server', 'X-Test2', 'X-Test3'],
    include: ['X-Powered-By', 'X-Test1', 'X-Test2']
});
