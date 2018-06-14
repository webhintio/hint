import { RuleTest } from 'sonarwhal/dist/tests/helpers/rule-test-type';
import { getRulePath } from 'sonarwhal/dist/src/lib/utils/rule-helpers';
import * as ruleRunner from 'sonarwhal/dist/tests/helpers/rule-runner';
import { generateHTMLPage } from 'sonarwhal/dist/tests/helpers/misc';

const ruleName = getRulePath(__filename);

const tests: Array<RuleTest> = [
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

const testsWithCustomConfiguration: Array<RuleTest> = [
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
        'max-html-redirects': 1,
        'max-resource-redirects': 1
    }
});
