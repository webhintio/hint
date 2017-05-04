/* eslint sort-keys: 0, no-undefined: 0 */

import { generateHTMLPage } from '../../../helpers/misc';
import { getRuleName } from '../../../../src/lib/utils/rule-helpers';
import { RuleTest } from '../../../helpers/rule-test-type'; // eslint-disable-line no-unused-vars
import * as ruleRunner from '../../../helpers/rule-runner';

const ruleName = getRuleName(__dirname);
const htmlPage = generateHTMLPage(undefined, '<script src="test.js"></script>');

const testsForDefaults: Array<RuleTest> = [
    {
        name: `Non HTML resource is not served with unneded headers`,
        serverConfig: {
            '/': {
                content: htmlPage,
                headers: {
                    'X-Frame-Options': 'SAMEORIGIN',
                    'Content-Type': 'text/html; charset=utf-8'
                }
            },
            '/test.js': { headers: { 'Content-Type': 'application/javascript; charset=utf-8' } }
        }
    },
    {
        name: `Non HTML resource is served with one unneded headers`,
        reports: [{ message: `Unneeded HTTP header found: content-security-policy` }],
        serverConfig: {
            '/': {
                content: htmlPage,
                headers: {
                    'X-Frame-Options': 'SAMEORIGIN',
                    'Content-Type': 'text/html; charset=utf-8'
                }
            },
            '/test.js': {
                headers: {
                    'Content-Security-Policy': 'default-src "none"',
                    'Content-Type': 'application/javascript; charset=utf-8'
                }
            }
        }
    },
    {
        name: `Non HTML resource is served with multiple unneded headers`,
        reports: [{ message: `Unneeded HTTP headers found: content-security-policy, x-content-security-policy, x-frame-options, x-ua-compatible, x-webkit-csp, x-xss-protection` }],
        serverConfig: {
            '/': {
                content: htmlPage,
                headers: {
                    'Content-Type': 'text/html; charset=utf-8',
                    'X-Content-Security-Policy': 'default-src "none"',
                    'X-Frame-Options': 'DENY',
                    'X-UA-Compatible': 'IE=Edge',
                    'X-WebKit-CSP': 'default-src "none"',
                    'X-XSS-Protection': '1; mode=block'
                }
            },
            '/test.js': {
                content: '',
                headers: {
                    'Content-Type': 'application/javascript; charset=utf-8',
                    'Content-Security-Policy': 'default-src "none"',
                    'X-Content-Security-Policy': 'default-src "none"',
                    'X-Frame-Options': 'DENY',
                    'X-UA-Compatible': 'IE=Edge',
                    'X-WebKit-CSP': 'default-src "none"',
                    'X-XSS-Protection': '1; mode=block'
                }
            }
        }
    },
    {
        name: `HTML document with valid but incorrect media type is treated as non-HTML resource`,
        reports: [{ message: `Unneeded HTTP headers found: x-frame-options, x-ua-compatible` }],
        serverConfig: {
            '/': {
                content: '',
                headers: {
                    'X-Frame-Options': 'SAMEORIGIN',
                    'Content-Type': 'image/jpeg',
                    'X-UA-Compatible': 'IE=Edge'
                }
            }
        }
    }

    // Note: There are no tests for invalid media types as Express
    // (more specifically, content-type) doesn't allow them.
];

const testsForIgnoreConfigs: Array<RuleTest> = [
    {
        name: `Non HTML resource is served with one unneded headers but ignored because of the configurations`,
        serverConfig: {
            '/': {
                content: htmlPage,
                headers: {
                    'X-Frame-Options': 'SAMEORIGIN',
                    'Content-Type': 'text/html; charset=utf-8',
                    'X-UA-Compatible': 'IE=Edge'
                }
            },
            '/test.js': {
                headers: {
                    'Content-Security-Policy': 'default-src "none"',
                    'Content-Type': 'application/javascript; charset=utf-8',
                    'X-UA-Compatible': 'IE=Edge'
                }
            }
        }
    }
];

const testsForIncludeConfigs: Array<RuleTest> = [
    {
        name: `Non HTML resource is served with unneded headers also because of the configurations`,
        reports: [{ message: `Unneeded HTTP headers found: content-security-policy, x-test-1, x-ua-compatible` }],
        serverConfig: {
            '/': {
                content: htmlPage,
                headers: {
                    'X-Frame-Options': 'SAMEORIGIN',
                    'Content-Type': 'text/html; charset=utf-8',
                    'X-Test-1': 'test',
                    'X-Test-2': 'test'
                }
            },
            '/test.js': {
                headers: {
                    'Content-Security-Policy': 'default-src "none"',
                    'Content-Type': 'application/javascript; charset=utf-8',
                    'X-Test-1': 'test',
                    'X-UA-Compatible': 'IE=Edge'
                }
            }
        }
    }
];

const testsForConfigs: Array<RuleTest> = [
    {
        name: `Non HTML resource is served with unneded headers that are both ignored and because of the configuration`,
        reports: [{ message: `Unneeded HTTP headers found: content-security-policy, x-test-1, x-ua-compatible` }],
        serverConfig: {
            '/': {
                content: htmlPage,
                headers: {
                    'X-Frame-Options': 'SAMEORIGIN',
                    'Content-Type': 'text/html; charset=utf-8',
                    'X-Test-1': 'test',
                    'X-Test-2': 'test'
                }
            },
            '/test.js': {
                headers: {
                    'Content-Security-Policy': 'default-src "none"',
                    'Content-Type': 'application/javascript; charset=utf-8',
                    'X-Test-1': 'test',
                    'X-Test-2': 'test',
                    'X-UA-Compatible': 'IE=Edge'
                }
            }
        }
    }
];

ruleRunner.testRule(ruleName, testsForDefaults);
ruleRunner.testRule(ruleName, testsForIgnoreConfigs, { ignore: ['Content-Security-Policy', 'X-UA-Compatible', 'X-Test-1'] });
ruleRunner.testRule(ruleName, testsForIncludeConfigs, { include: ['Content-Security-Policy', 'X-Test-1', 'X-Test-2'] });
ruleRunner.testRule(ruleName, testsForConfigs, {
    ignore: ['X-Frame-Options', 'X-Test-2', 'X-Test-3'],
    include: ['X-Test-1', 'X-Test-2', 'X-UA-Compatible']
});
