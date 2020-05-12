import { Severity } from '@hint/utils-types';
import { generateHTMLPage } from '@hint/utils-create-server';
import { getHintPath, HintTest, testHint } from '@hint/utils-tests-helpers';

const hintPath = getHintPath(__filename);

const tests: HintTest[] = [
    {
        name: 'No redirects pass the hint',
        serverConfig: generateHTMLPage()
    },
    {
        name: 'Redirect in resource fails',
        reports: [{
            message: `Too many HTTP redirects detected (max is 0).`,
            severity: Severity.warning
        }],
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
        reports: [{
            message: `Too many HTTP redirects detected (max is 0).`,
            severity: Severity.warning
        }],
        serverConfig: {
            '/': {
                content: '/redirect.html',
                status: 302
            },
            '/redirect.html': generateHTMLPage('', '<img src="/image.png">')
        }
    }
];

const testsWithCustomConfiguration: HintTest[] = [
    {
        name: 'No redirects pass the hint (with custom configuration)',
        serverConfig: generateHTMLPage()
    },
    {
        name: 'Redirect in resource with more hops than allowed fails',
        reports: [{
            message: `Too many HTTP redirects detected (max is 1).`,
            severity: Severity.warning
        }],
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
        reports: [{
            message: `Too many HTTP redirects detected (max is 1).`,
            severity: Severity.warning
        }],
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

testHint(hintPath, tests);
testHint(hintPath, testsWithCustomConfiguration, {
    hintOptions: {
        'max-html-redirects': 1,
        'max-resource-redirects': 1
    }
});
