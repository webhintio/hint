import { IRuleTest } from '../../../helpers/rule-test-type';
import { getRuleName } from '../../../../src/lib/utils/rule-helpers';
import * as ruleRunner from '../../../helpers/rule-runner';
import { generateHTMLPage } from '../../../helpers/misc';

const ruleName = getRuleName(__dirname);

const defaultTests: Array<IRuleTest> = [
    {
        name: `Target with "Cache-Control: no-cache" passes`,
        serverConfig: {
            '/': {
                content: generateHTMLPage('<link rel="icon" href="/favicon.123.ico">'),
                headers: { 'cache-control': ' No-CaChe' }
            },
            '/favicon.123.ico': {
                content: '',
                headers: { 'Cache-Control': 'mAx-Age=31536000,Immutable' }
            }
        }
    },
    {
        name: `Target with "Cache-Control: max-age=100" passes`,
        serverConfig: {
            '/': {
                content: generateHTMLPage('<link rel="icon" href="/favicon.123.ico">'),
                headers: { 'Cache-Control': 'max-age=100' }
            },
            '/favicon.123.ico': {
                content: '',
                headers: { 'Cache-Control': 'max-age=31536000,     Immutable' }
            }
        }
    },
    {
        name: 'Target with long max-age fails',
        reports: [{ message: 'The target should not be cached, or have a small "max-age" value (180):\nmax-age=500' }],
        serverConfig: {
            '/': {
                content: generateHTMLPage('<link rel="icon" href="/favicon.123.ico">'),
                headers: { 'Cache-Control': 'max-age=500' }
            },
            '/favicon.123.ico': {
                content: '',
                headers: { 'Cache-Control': 'max-age=31536000, immutable' }
            }
        }
    },
    {
        name: 'Asset with no "Cache-Control" header fails',
        reports: [{ message: `No "cache-control" header or empty value found. It should have a value` }],
        serverConfig: {
            '/': generateHTMLPage('<link rel="icon" href="/favicon.123.ico"><link rel="stylesheet" href="styles.123.css">'),
            '/favicon.123.ico': {
                content: '',
                headers: { 'Cache-Control': 'max-age=31536000, immutable' }
            },
            '/styles.123.css': {
                content: '',
                headers: { 'Cache-Control': null }
            }
        }
    },
    {
        name: `Asset with "Cache-Control: " header fails`,
        reports: [{ message: `No "cache-control" header or empty value found. It should have a value` }],
        serverConfig: {
            '/': generateHTMLPage('<link rel="icon" href="/favicon.123.ico"><link rel="stylesheet" href="styles.123.css"><link rel="stylesheet" href="styles.123.css">'),
            '/favicon.123.ico': {
                content: '',
                headers: { 'Cache-Control': 'max-age=31536000, immutable' }
            },
            '/styles.123.css': {
                content: '',
                headers: { 'Cache-Control': '' }
            }
        }
    },
    {
        name: `Asset with "Cache-Control: invalid-directive" header fails`,
        reports: [{ message: `The directive invalid-directive is invalid` }],
        serverConfig: {
            '/': generateHTMLPage('<link rel="icon" href="/favicon.123.ico"><link rel="stylesheet" href="styles.123.css">'),
            '/favicon.123.ico': {
                content: '',
                headers: { 'Cache-Control': 'max-age=31536000, immutable' }
            },
            '/styles.123.css': {
                content: '',
                headers: { 'Cache-Control': 'invalid-directive' }
            }
        }
    },
    {
        name: `Asset with "Cache-Control: max-age=abcd" header fails`,
        reports: [{ message: `The following directive has an invalid value:\nmax-age=abcd` }],
        serverConfig: {
            '/': generateHTMLPage('<link rel="icon" href="/favicon.123.ico"><link rel="stylesheet" href="styles.123.css">'),
            '/favicon.123.ico': {
                content: '',
                headers: { 'Cache-Control': 'max-age=31536000, immutable' }
            },
            '/styles.123.css': {
                content: '',
                headers: { 'Cache-Control': 'max-age=abcd' }
            }
        }
    },
    {
        name: `Asset with "Cache-Control: no-cache=10" header fails`,
        reports: [{ message: `The following directive has an invalid value:\nno-cache=10` }],
        serverConfig: {
            '/': generateHTMLPage('<link rel="icon" href="/favicon.123.ico"><link rel="stylesheet" href="styles.123.css">'),
            '/favicon.123.ico': {
                content: '',
                headers: { 'Cache-Control': 'max-age=31536000, immutable' }
            },
            '/styles.123.css': {
                content: '',
                headers: { 'Cache-Control': 'no-cache=10' }
            }
        }
    },
    {
        name: `Asset with "Cache-Control: no-cache, max-age=10" header fails`,
        reports: [{ message: `The following Cache-Control header is using a wrong combination of directives:\nno-cache, max-age=10` }],
        serverConfig: {
            '/': generateHTMLPage('<link rel="icon" href="/favicon.123.ico"><link rel="stylesheet" href="styles.123.css">'),
            '/favicon.123.ico': {
                content: '',
                headers: { 'Cache-Control': 'max-age=31536000, immutable' }
            },
            '/styles.123.css': {
                content: '',
                headers: { 'Cache-Control': 'no-cache, max-age=10' }
            }
        }
    },
    {
        name: `Asset with "Cache-Control: no-cache, s-maxage=10" header fails`,
        reports: [{ message: `The following Cache-Control header is using a wrong combination of directives:\nno-cache, s-maxage=10` }],
        serverConfig: {
            '/': generateHTMLPage('<link rel="icon" href="/favicon.123.ico"><link rel="stylesheet" href="styles.123.css">'),
            '/favicon.123.ico': {
                content: '',
                headers: { 'Cache-Control': 'max-age=31536000, immutable' }
            },
            '/styles.123.css': {
                content: '',
                headers: { 'Cache-Control': 'no-cache, s-maxage=10' }
            }
        }
    },
    {
        name: `Asset with "Cache-Control: must-revalidate, max-age=10" header fails`,
        reports: [{ message: `The directive "must-revalidate" is not recommended` }],
        serverConfig: {
            '/': generateHTMLPage('<link rel="icon" href="/favicon.123.ico"><link rel="stylesheet" href="styles.123.css">'),
            '/favicon.123.ico': {
                content: '',
                headers: { 'Cache-Control': 'max-age=31536000, immutable' }
            },
            '/styles.123.css': {
                content: '',
                headers: { 'Cache-Control': 'must-revalidate, max-age=10' }
            }
        }
    },
    {
        name: 'JS with "Cache-Control: no-cache" fails',
        reports: [{ message: 'Static resources should have a long cache value (31536000) and use the immutable directive:\nno-cache' }],
        serverConfig: {
            '/': generateHTMLPage('<link rel="icon" href="/favicon.123.ico"><script src="/script.123.js"></script>'),
            '/favicon.123.ico': {
                content: '',
                headers: { 'Cache-Control': 'max-age=31536000, immutable' }
            },
            '/script.123.js': {
                content: 'var a = 10;',
                headers: { 'Cache-Control': 'no-cache' }
            }
        }
    },
    {
        name: 'JS with short max-age fails',
        reports: [{ message: 'Static resources should have a long cache value (31536000) and use the immutable directive:\nmax-age=100' }],
        serverConfig: {
            '/': generateHTMLPage('<link rel="icon" href="/favicon.123.ico"><script src="/script.123.js"></script>'),
            '/favicon.123.ico': {
                content: '',
                headers: { 'Cache-Control': 'max-age=31536000, immutable' }
            },
            '/script.123.js': {
                content: 'var a = 10;',
                headers: { 'Cache-Control': 'max-age=100' }
            }
        }
    },
    {
        name: 'JS with long max-age but no immutable fails',
        reports: [{ message: 'Static resources should have a long cache value (31536000) and use the immutable directive:\nmax-age=31536000' }],
        serverConfig: {
            '/': generateHTMLPage('<link rel="icon" href="/favicon.123.ico"><script src="/script.123.js"></script>'),
            '/favicon.123.ico': {
                content: '',
                headers: { 'Cache-Control': 'max-age=31536000, immutable' }
            },
            '/script.123.js': {
                content: 'var a = 10;',
                headers: { 'Cache-Control': 'max-age=31536000' }
            }
        }
    },
    {
        name: 'JS with long max-age, immutable and no file revving fails',
        reports: [{ message: 'No configured patterns for cache busting match http://localhost/script.js. See docs to add a custom one.' }],
        serverConfig: {
            '/': generateHTMLPage('<link rel="icon" href="/favicon.123.ico"><script src="/script.js"></script>'),
            '/favicon.123.ico': {
                content: '',
                headers: { 'Cache-Control': 'max-age=31536000, immutable' }
            },
            '/script.js': {
                content: 'var a = 10;',
                headers: { 'Cache-Control': 'max-age=31536000, immutable' }
            }
        }
    },
    {
        name: 'JS with long max-age, immutable and file revving passes',
        serverConfig: {
            '/': generateHTMLPage('<link rel="icon" href="/favicon.123.ico"><script src="/script.123.js"></script>'),
            '/favicon.123.ico': {
                content: '',
                headers: { 'Cache-Control': 'max-age=31536000, immutable' }
            },
            '/script.123.js': {
                content: 'var a = 10;',
                headers: { 'Cache-Control': 'max-age=31536000, immutable' }
            }
        }
    },
    {
        name: 'JS with long max-age, immutable and file revving with `_` passes',
        serverConfig: {
            '/': generateHTMLPage('<link rel="icon" href="/favicon_123.ico"><script src="/script_123.js"></script>'),
            '/favicon_123.ico': {
                content: '',
                headers: { 'Cache-Control': 'max-age=31536000, immutable' }
            },
            '/script_123.js': {
                content: 'var a = 10;',
                headers: { 'Cache-Control': 'max-age=31536000, immutable' }
            }
        }
    },
    {
        name: 'JS with long max-age, immutable and parameter file revving fails',
        reports: [{ message: 'No configured patterns for cache busting match http://localhost/script.js?v=123. See docs to add a custom one.' }],
        serverConfig: {
            '/': generateHTMLPage('<link rel="icon" href="/favicon.123.ico"><script src="/script.js?v=123"></script>'),
            '/favicon.123.ico': {
                content: '',
                headers: { 'Cache-Control': 'max-age=31536000, immutable' }
            },
            '/script.js': {
                content: 'var a = 10;',
                headers: { 'Cache-Control': 'max-age=31536000, immutable' }
            }
        }
    },

    {
        name: 'CSS with max-age but no immutable fails',
        reports: [{ message: 'Static resources should have a long cache value (31536000) and use the immutable directive:\nmax-age=31536000' }],
        serverConfig: {
            '/': generateHTMLPage('<link rel="icon" href="/favicon.123.ico"><link rel="stylesheet" href="styles.123.css">'),
            '/favicon.123.ico': {
                content: '',
                headers: { 'Cache-Control': 'max-age=31536000, immutable' }
            },
            '/styles.123.css': {
                content: '',
                headers: { 'Cache-Control': 'max-age=31536000' }
            }
        }
    },
    {
        name: 'CSS with long max-age, immutable and no file revving fails',
        reports: [{ message: 'No configured patterns for cache busting match http://localhost/styles.css. See docs to add a custom one.' }],
        serverConfig: {
            '/': generateHTMLPage('<link rel="icon" href="/favicon.123.ico"><link rel="stylesheet" href="styles.css">'),
            '/favicon.123.ico': {
                content: '',
                headers: { 'Cache-Control': 'max-age=31536000, immutable' }
            },
            '/styles.css': {
                content: '',
                headers: { 'Cache-Control': 'max-age=31536000, immutable' }
            }
        }
    },
    {
        name: 'CSS with long max-age, immutable and file revving passes',
        serverConfig: {
            '/': generateHTMLPage('<link rel="icon" href="/favicon.123.ico"><link rel="stylesheet" href="styles-123.css">'),
            '/favicon.123.ico': {
                content: '',
                headers: { 'Cache-Control': 'max-age=31536000, immutable' }
            },
            '/styles-123.css': {
                content: '',
                headers: { 'Cache-Control': 'max-age=31536000, immutable' }
            }
        }
    },
    {
        name: 'CSS with long max-age, immutable and parameter file revving fails',
        reports: [{ message: 'No configured patterns for cache busting match http://localhost/styles.css?v=123. See docs to add a custom one.' }],
        serverConfig: {
            '/': generateHTMLPage('<link rel="icon" href="/favicon.123.ico"><link rel="stylesheet" href="styles.css?v=123">'),
            '/favicon.123.ico': {
                content: '',
                headers: { 'Cache-Control': 'max-age=31536000, immutable' }
            },
            '/styles.css': {
                content: '',
                headers: { 'Cache-Control': 'max-age=31536000, immutable' }
            }
        }
    }];

const customRegexTests: Array<IRuleTest> = [
    {
        name: 'JS with long max-age, immutable and file revving fails custom regex',
        reports: [{ message: 'No configured patterns for cache busting match http://localhost/script.123.js. See docs to add a custom one.' }],
        serverConfig: {
            '/': generateHTMLPage('<link rel="icon" href="/12345/favicon.ico"><script src="/script.123.js"></script>'),
            '/12345/favicon.ico': {
                content: '',
                headers: { 'Cache-Control': 'max-age=31536000, immutable' }
            },
            '/script.123.js': {
                content: 'var a = 10;',
                headers: { 'Cache-Control': 'max-age=31536000, immutable' }
            }
        }
    },
    {
        name: 'JS with long max-age, immutable and custom file revving passes',
        serverConfig: {
            '/': generateHTMLPage('<link rel="icon" href="/12345/favicon.ico"><script src="/12345/script.js"></script>'),
            '/12345/favicon.ico': {
                content: '',
                headers: { 'Cache-Control': 'max-age=31536000, immutable' }
            },
            '/12345/script.js': {
                content: 'var a = 10;',
                headers: { 'Cache-Control': 'max-age=31536000, immutable' }
            }
        }
    }];

ruleRunner.testRule(ruleName, defaultTests);
ruleRunner.testRule(ruleName, customRegexTests, { ruleOptions: { revvingPatterns: ['\\/\\d+\\/\\w+\\.\\w{1,3}'] } });
