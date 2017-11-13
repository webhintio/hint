import { IRuleTest } from '../../../helpers/rule-test-type';
import { getRuleName } from '../../../../src/lib/utils/rule-helpers';
import * as ruleRunner from '../../../helpers/rule-runner';
import { generateHTMLPage } from '../../../helpers/misc';

const ruleName = getRuleName(__dirname);

const tests: Array<IRuleTest> = [
    {
        name: 'No redirects pass the rule',
        serverConfig: generateHTMLPage()
    },
    {
        name: 'Redirect in resource fails',
        reports: [{ message: '2 redirects detected for http://localhost/image.png (max is 0).' }],
        serverConfig: {
            '/': generateHTMLPage('', '<img src="/image.png">'),
            '/image.png': {
                content: '/image2.png',
                status: 302
            },
            '/image2.png': {
                content: '/image3.png',
                status: 301
            },
            '/image3.png': ''
        }
    },
    {
        name: 'Redirect in manifest fails',
        reports: [{ message: '1 redirect detected for http://localhost/site.webmanifest (max is 0).' }],
        serverConfig: {
            '/': generateHTMLPage(`<link rel="manifest" href="site.webmanifest">`),
            '/site.webmanifest': {
                content: '/site2.webmanifest',
                status: 302
            },
            '/site2.webmanifest': ''
        }
    },
    {
        name: 'Redirect in target fails',
        reports: [{ message: '1 redirect detected for http://localhost/ (max is 0).' }],
        serverConfig: {
            '/': {
                content: '/redirect.html',
                status: 302
            },
            '/redirect.html': generateHTMLPage('', '<img src="/image.png">')
        }
    }
];

const testsWithCustomConfiguration: Array<IRuleTest> = [
    {
        name: 'No redirects pass the rule',
        serverConfig: generateHTMLPage()
    },
    {
        name: 'Redirect in resource with more hops than allowed fails',
        reports: [{ message: '2 redirects detected for http://localhost/image.png (max is 1).' }],
        serverConfig: {
            '/': generateHTMLPage('', '<img src="/image.png">'),
            '/image.png': {
                content: '/image2.png',
                status: 302
            },
            '/image2.png': {
                content: '/image3.png',
                status: 302
            },
            '/image3.png': ''
        }
    },
    {
        name: 'Redirect in resource with less or equal hops than allowed passes',
        serverConfig: {
            '/': generateHTMLPage('', '<img src="/image.png">'),
            '/image.png': {
                content: '/image2.png',
                status: 302
            },
            '/image2.png': ''
        }
    },
    {
        name: 'Redirect in target with more hops than allowed fails',
        reports: [{ message: '2 redirects detected for http://localhost/ (max is 1).' }],
        serverConfig: {
            '/': {
                content: '/redirect.html',
                status: 302
            },
            '/redirect.html': {
                content: '/redirect2.html',
                status: 302
            },
            '/redirect2.html': generateHTMLPage('', '<img src="/image.png">')
        }
    },
    {
        name: 'Redirect in target with less or equal hops than allowed passes',
        serverConfig: {
            '/': {
                content: '/redirect.html',
                status: 302
            },
            '/redirect.html': generateHTMLPage('', '<img src="/image.png">')
        }
    }
];

ruleRunner.testRule(ruleName, tests);
ruleRunner.testRule(ruleName, testsWithCustomConfiguration, {
    ruleOptions: {
        'max-resource-redirects': 1,
        'max-target-redirects': 1
    }
});
