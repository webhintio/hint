/* eslint sort-keys: 0, no-undefined: 0 */

import * as pluralize from 'pluralize';

import { generateHTMLPage } from '../../../helpers/misc';
import { getRuleName } from '../../../../src/lib/utils/rule-helpers';
import { IRuleTest } from '../../../helpers/rule-test-type';
import * as ruleRunner from '../../../helpers/rule-runner';

const ruleName = getRuleName(__dirname);

const htmlPageWithScript = generateHTMLPage(undefined, '<script src="test.js"></script>');
const htmlPageWithManifest = generateHTMLPage('<link rel="manifest" href="test.webmanifest">');

const generateMessage = (values: Array<string>): string => {
    return `'${values.join('\', \'')}' ${pluralize('header', values.length)} ${pluralize('is', values.length)} disallowed`;
};

const testsForDefaults: Array<IRuleTest> = [
    {
        name: `HTML page is served without any of the disallowed headers`,
        serverConfig: { '/': '' }
    },
    {
        name: `Manifest is served without any of the disallowed headers`,
        serverConfig: {
            '/': htmlPageWithManifest,
            'test.webmanifest': ''
        }
    },
    {
        name: `Resource is served without any of the disallowed headers`,
        serverConfig: {
            '/': htmlPageWithScript,
            'test.js': ''
        }
    },
    {
        name: `Resource is specified as a data URI`,
        serverConfig: { '/': generateHTMLPage(undefined, '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==">') }
    },
    {
        name: `HTML page is served with one disallowed header`,
        reports: [{ message: generateMessage(['x-powered-by']) }],
        serverConfig: { '/': { headers: { 'X-Powered-By': 'test' } } }
    },
    {
        name: `HTML page is served with multiple disallowed headers`,
        reports: [{ message: generateMessage(['server', 'x-aspnetmvc-version']) }],
        serverConfig: {
            '/': {
                headers: {
                    Server: 'test',
                    'X-AspNetMvc-Version': 'test'
                }
            }
        }
    }
];

const testsForIgnoreConfigs: Array<IRuleTest> = [
    {
        name: `HTML page is served with disallowed headers that are ignored because of configs`,
        serverConfig: {
            '/': {
                headers: {
                    Server: 'test',
                    'X-Test-1': 'test'
                }
            }
        }
    }
];

const testsForIncludeConfigs: Array<IRuleTest> = [
    {
        name: `HTML page is served with disallowed headers that are enforced because of configs`,
        reports: [{ message: generateMessage(['server', 'x-test-2']) }],
        serverConfig: {
            '/': htmlPageWithScript,
            '/test.js': {
                headers: {
                    Server: 'test',
                    'X-Test-2': 'test'
                }
            }
        }
    }
];

const testsForConfigs: Array<IRuleTest> = [
    {
        name: `HTML page is served with disallowed headers that are both ignored and enforced because of configs`,
        reports: [{ message: generateMessage(['x-powered-by', 'x-test-1']) }],
        serverConfig: {
            '/': {
                headers: {
                    Server: 'test',
                    'X-Powered-By': 'test',
                    'X-Test-1': 'test',
                    'X-Test-2': 'test'
                }
            }
        }
    }
];

ruleRunner.testRule(ruleName, testsForDefaults);
ruleRunner.testRule(ruleName, testsForIgnoreConfigs, { ruleOptions: { ignore: ['Server', 'X-Powered-By', 'X-Test-1'] } });
ruleRunner.testRule(ruleName, testsForIncludeConfigs, { ruleOptions: { include: ['Server', 'X-Test-1', 'X-Test-2'] } });
ruleRunner.testRule(ruleName, testsForConfigs, {
    ruleOptions: {
        ignore: ['Server', 'X-Test-2', 'X-Test-3'],
        include: ['X-Powered-By', 'X-Test-1', 'X-Test-2']
    }
});
