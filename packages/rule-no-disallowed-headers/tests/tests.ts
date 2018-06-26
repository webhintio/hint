/* eslint no-undefined: 0 */

import generateHTMLPage from 'sonarwhal/dist/src/lib/utils/misc/generate-html-page';
import { getRulePath } from 'sonarwhal/dist/src/lib/utils/rule-helpers';
import { RuleTest } from '@sonarwhal/utils-tests-helpers/dist/src/rule-test-type';
import * as ruleRunner from '@sonarwhal/utils-tests-helpers/dist/src/rule-runner';

const rulePath = getRulePath(__filename);

const htmlPageWithScript = generateHTMLPage(undefined, '<script src="test.js"></script>');
const htmlPageWithManifest = generateHTMLPage('<link rel="manifest" href="test.webmanifest">');

const generateMessage = (values: Array<string>): string => {
    return `'${values.join('\', \'')}' ${values.length === 1 ? 'header is' : 'headers are'} disallowed`;
};

const testsForDefaults: Array<RuleTest> = [
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
        reports: [{ message: generateMessage(['x-aspnetmvc-version', 'x-powered-by']) }],
        serverConfig: {
            '/': {
                headers: {
                    Server: 'test',
                    'X-AspNetMvc-Version': 'test',
                    'X-Powered-By': 'test'
                }
            }
        }
    }
];

const testsForDifferentServerHeaderValues: Array<RuleTest> = (() => {

    const allowedServerHeaderValues = [
        'amo-cookiemap',
        'aorta',
        'APACHE',
        'ecs',
        'jetty',
        'jino.ru',
        'lighttpd',
        'marrakesh',
        'microsoft-iis',
        'mt3',
        'nginx',
        'omniture',
        'pingmatch',
        'radiumone',
        'waf',
        'windows-azure-blo'
    ];

    const disallowedServerHeaderValues = [
        'Apache/2.2.24 (uNix) Mod_ssl/2.2.24 OpenSSl/1.0.1e-fips MOD_fastcgi/2.4.6',
        'jetty(9.4.6.v20170531)',
        'windows-azure-blob/1.0 microsoft-httpapi/2.0',
        'apache/2.4.6 (CENTOS) PHP/5.4.16',
        'apache/2.2.34 (amazon)',
        'omniture dc/2.0.0',
        'jino.ru/mod_pizza',
        'amo-cookiemap/1.1',
        'lighttpd/1.4.35',
        'radiumone/1.4.2',
        'mt3 1.15.20.1 33bcb65 release pao-pixel-x16',
        'aorta/2.4.13-20180105.e4d0482',
        'marrakesh 1.9.9',
        'waf/2.4-12.1',
        'ecs (sjc/4e6a)',
        'pingmatch/v2.0.30-165-g51bed16#rel-ec2-master i-077d449239c04b184@us-west-2b@dxedge-app_us-west-2_prod_asg',
        'microsoft-iis/8.5',
        'nginx/1.12.2',
        'NgiNx/1.4.6 (ubuntu)'
    ];

    const tests = [];

    allowedServerHeaderValues.forEach((value) => {
        tests.push({
            name: `HTML page is served with allowed 'Server: ${value}'`,
            serverConfig: { '/': { headers: { Server: value } } }
        });
    });

    disallowedServerHeaderValues.forEach((value) => {
        tests.push({
            name: `HTML page is served with disallowed 'Server: ${value}'`,
            reports: [{ message: `'Server' header value contains more than the server name` }],
            serverConfig: { '/': { headers: { Server: value } } }
        });
    });

    return tests;

})();

const testsForIgnoreConfigs: Array<RuleTest> = [
    {
        name: `HTML page is served with disallowed headers that are ignored because of configs`,
        serverConfig: {
            '/': {
                headers: {
                    Server: 'apache/2.2.24 (unix) mod_ssl/2.2.24 openssl/1.0.1e-fips mod_fastcgi/2.4.6',
                    'X-Test-1': 'test'
                }
            }
        }
    }
];

const testsForIncludeConfigs: Array<RuleTest> = [
    {
        name: `HTML page is served with disallowed headers that are enforced because of configs`,
        reports: [{ message: generateMessage(['server', 'x-test-2']) }],
        serverConfig: {
            '/': htmlPageWithScript,
            '/test.js': {
                headers: {
                    Server: 'apache/2.2.24 (unix) mod_ssl/2.2.24 openssl/1.0.1e-fips mod_fastcgi/2.4.6',
                    'X-Test-2': 'test'
                }
            }
        }
    }
];

const testsForConfigs: Array<RuleTest> = [
    {
        name: `HTML page is served with disallowed headers that are both ignored and enforced because of configs`,
        reports: [{ message: generateMessage(['x-powered-by', 'x-test-1']) }],
        serverConfig: {
            '/': {
                headers: {
                    Server: 'apache/2.2.24 (unix) mod_ssl/2.2.24 openssl/1.0.1e-fips mod_fastcgi/2.4.6',
                    'X-Powered-By': 'test',
                    'X-Test-1': 'test',
                    'X-Test-2': 'test'
                }
            }
        }
    }
];

ruleRunner.testRule(rulePath, testsForDefaults);
ruleRunner.testRule(rulePath, testsForDifferentServerHeaderValues);
ruleRunner.testRule(rulePath, testsForIgnoreConfigs, { ruleOptions: { ignore: ['Server', 'X-Powered-By', 'X-Test-1'] } });
ruleRunner.testRule(rulePath, testsForIncludeConfigs, { ruleOptions: { include: ['Server', 'X-Test-1', 'X-Test-2'] } });
ruleRunner.testRule(rulePath, testsForConfigs, {
    ruleOptions: {
        ignore: ['Server', 'X-Test-2', 'X-Test-3'],
        include: ['X-Powered-By', 'X-Test-1', 'X-Test-2']
    }
});
