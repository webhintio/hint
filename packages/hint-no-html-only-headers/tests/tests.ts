/* eslint sort-keys: 0 */

import generateHTMLPage from 'hint/dist/src/lib/utils/misc/generate-html-page';
import { getHintPath } from 'hint/dist/src/lib/utils/hint-helpers';
import { HintTest } from '@hint/utils-tests-helpers/dist/src/hint-test-type';
import * as hintRunner from '@hint/utils-tests-helpers/dist/src/hint-runner';
import prettyPrintArray from 'hint/dist/src/lib/utils/misc/pretty-print-array';

const hintPath = getHintPath(__filename);
const htmlPage = generateHTMLPage(undefined, '<script src="test.js"></script>');

const generateMessage = (values: Array<string>): string => {
    return `Response should not include unneeded ${prettyPrintArray(values)} ${values.length === 1 ? 'header' : 'headers'}.`;
};

const testsForDefaults: Array<HintTest> = [
    {
        name: `Non HTML resource is served without unneeded headers`,
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
        name: `Non HTML resource is specified as a data URI`,
        serverConfig: { '/': generateHTMLPage(undefined, '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==">') }
    },
    {
        name: `Non HTML resource is served with unneeded header`,
        reports: [{ message: generateMessage(['content-security-policy']) }],
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
        name: `Non HTML resource is served with multiple unneeded headers`,
        reports: [
            {
                message: generateMessage([
                    'content-security-policy',
                    'feature-policy',
                    'x-content-security-policy',
                    'x-frame-options',
                    'x-ua-compatible',
                    'x-webkit-csp',
                    'x-xss-protection'
                ])
            }
        ],
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
                headers: {
                    'Content-Type': 'application/javascript; charset=utf-8',
                    'Content-Security-Policy': 'default-src "none"',
                    'Feature-Policy': `geolocation 'self'`,
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
        name: `HTML document treated as non-HTML resource (no media type) is served with unneeded header`,
        reports: [{ message: generateMessage(['x-ua-compatible']) }],
        serverConfig: {
            '/': {
                content: '',
                headers: {
                    'Content-Type': null,
                    'X-UA-Compatible': 'IE=Edge'
                }
            }
        }
    },
    {
        name: `HTML document treated as non-HTML resource (invalid media type) is served with unneeded header`,
        reports: [{ message: generateMessage(['x-ua-compatible']) }],
        serverConfig: {
            '/': {
                content: '',
                headers: {
                    'Content-Type': 'invalid',
                    'X-UA-Compatible': 'IE=Edge'
                }
            }
        }
    },
    {
        name: `HTML document treated as non-HTML resource (valid, but incorrect media type) is served with unneeded header`,
        reports: [{ message: generateMessage(['x-ua-compatible']) }],
        serverConfig: {
            '/': {
                content: '',
                headers: {
                    'Content-Type': 'image/jpeg',
                    'X-UA-Compatible': 'IE=Edge'
                }
            }
        }
    }
];

const testsForIgnoreConfigs: Array<HintTest> = [
    {
        name: `Non HTML resource is served with one unneeded headers but ignored because of configs`,
        serverConfig: {
            '/': {
                content: htmlPage,
                headers: {
                    'Content-Type': 'text/html; charset=utf-8',
                    'Feature-Policy': `geolocation 'self'`,
                    'X-Frame-Options': 'SAMEORIGIN',
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

const testsForIncludeConfigs: Array<HintTest> = [
    {
        name: `Non HTML resource is served with unneeded headers because of configs`,
        reports: [
            {
                message: generateMessage([
                    'content-security-policy',
                    'x-test-1',
                    'x-ua-compatible'
                ])
            }
        ],
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

const testsForConfigs: Array<HintTest> = [
    {
        name: `Non HTML resource is served with unneeded headers that are both ignored and enforced because of configs`,
        reports: [
            {
                message: generateMessage([
                    'content-security-policy',
                    'x-test-1',
                    'x-ua-compatible'
                ])
            }
        ],
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

hintRunner.testHint(hintPath, testsForDefaults);
hintRunner.testHint(hintPath, testsForIgnoreConfigs, { hintOptions: { ignore: ['Content-Security-Policy', 'X-UA-Compatible', 'X-Test-1'] } });
hintRunner.testHint(hintPath, testsForIncludeConfigs, { hintOptions: { include: ['Content-Security-Policy', 'X-Test-1', 'X-Test-2'] } });
hintRunner.testHint(hintPath, testsForConfigs, {
    hintOptions: {
        ignore: ['X-Frame-Options', 'X-Test-2', 'X-Test-3'],
        include: ['X-Test-1', 'X-Test-2', 'X-UA-Compatible']
    }
});
