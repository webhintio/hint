import { misc, test } from '@hint/utils';
import { HintTest, testHint } from '@hint/utils-tests-helpers';

const { prettyPrintArray } = misc;
const { generateHTMLPage, getHintPath } = test;
const hintPath = getHintPath(__filename);
const htmlPage = generateHTMLPage(undefined, '<script src="test.js"></script>');

const generateMessage = (values: string[]): string => {
    return `Response should not include unneeded ${prettyPrintArray(values)} ${values.length === 1 ? 'header' : 'headers'}.`;
};

const testsForDefaults: HintTest[] = [
    {
        name: `Non HTML resource is served without unneeded headers`,
        serverConfig: {
            '/': {
                content: generateHTMLPage(undefined, '<img src="test.svg"/><script src="test.js"></script><embed src="test.pdf" type="application/pdf">'),
                headers: {
                    'Content-Type': 'text/html; charset=utf-8',
                    'X-Frame-Options': 'SAMEORIGIN'
                }
            },
            '/test.js': {
                headers: {
                    'Content-Security-Policy': 'default-src "none"',
                    'Content-Type': 'application/javascript; charset=utf-8',
                    'X-Content-Security-Policy': 'default-src "none"',
                    'X-WebKit-CSP': 'default-src "none"'
                }
            },
            '/test.pdf': {
                headers: {
                    'Content-Security-Policy': 'default-src "none"',
                    'Content-Type': 'application/pdf',
                    'X-Content-Security-Policy': 'default-src "none"',
                    'X-WebKit-CSP': 'default-src "none"'
                }
            },
            '/test.svg': {
                headers: {
                    'Content-Security-Policy': 'default-src "none"',
                    'Content-Type': 'image/svg+xml',
                    'X-Content-Security-Policy': 'default-src "none"',
                    'X-WebKit-CSP': 'default-src "none"'
                }
            }
        }
    },
    {
        name: `Non HTML resource is specified as a data URI`,
        serverConfig: { '/': generateHTMLPage(undefined, '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==">') }
    },
    {
        name: `Non HTML resource is served with multiple unneeded headers`,
        reports: [
            {
                message: generateMessage([
                    'feature-policy',
                    'x-ua-compatible',
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
                    'Content-Security-Policy': 'default-src "none"',
                    'Content-Type': 'application/javascript; charset=utf-8',
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

const testsForIgnoreConfigs: HintTest[] = [
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

const testsForIncludeConfigs: HintTest[] = [
    {
        name: `Non HTML resource is served with unneeded headers because of configs`,
        reports: [
            {
                message: generateMessage([
                    'x-test-1',
                    'x-ua-compatible'
                ])
            }
        ],
        serverConfig: {
            '/': {
                content: htmlPage,
                headers: {
                    'Content-Type': 'text/html; charset=utf-8',
                    'X-Frame-Options': 'SAMEORIGIN',
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

const testsForConfigs: HintTest[] = [
    {
        name: `Non HTML resource is served with unneeded headers that are both ignored and enforced because of configs`,
        reports: [
            {
                message: generateMessage([
                    'x-test-1',
                    'x-ua-compatible'
                ])
            }
        ],
        serverConfig: {
            '/': {
                content: htmlPage,
                headers: {
                    'Content-Type': 'text/html; charset=utf-8',
                    'X-Frame-Options': 'SAMEORIGIN',
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

testHint(hintPath, testsForDefaults);
testHint(hintPath, testsForIgnoreConfigs, { hintOptions: { ignore: ['X-UA-Compatible', 'X-Test-1'] } });
testHint(hintPath, testsForIncludeConfigs, { hintOptions: { include: ['X-Test-1', 'X-Test-2'] } });
testHint(hintPath, testsForConfigs, {
    hintOptions: {
        ignore: ['X-Frame-Options', 'X-Test-2', 'X-Test-3'],
        include: ['X-Test-1', 'X-Test-2', 'X-UA-Compatible']
    }
});
