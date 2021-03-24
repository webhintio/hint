import { Severity } from '@hint/utils-types';
import { generateHTMLPage } from '@hint/utils-create-server';
import { getHintPath, HintTest, testHint } from '@hint/utils-tests-helpers';

// Page data.

const pageWithAlternateStylesheet = generateHTMLPage('<link rel="  alternate stylesheet " href="test.css">');
const pageWithScript = generateHTMLPage(undefined, '<script src="test.js"></script>');
const pageWithScriptAndStylesheet = generateHTMLPage('<link rel="stylesheet" href="test.css">', '<script src="test.js"></script>');
const pageWithStylesheet = generateHTMLPage('<link rel="stylesheet" href="test.css">');

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

// Error messages.

const noHeaderErrorMessage = `Response should include 'x-content-type-options' header.`;
const invalidValueMessage = `The 'x-content-type-options' header value should be 'nosniff'.`;

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

// Tests.

const tests: HintTest[] = [
    {
        name: `HTML page is served without 'X-Content-Type-Options' header`,
        reports: [{
            message: noHeaderErrorMessage,
            severity: Severity.error
        }],
        serverConfig: {
            '/': { content: generateHTMLPage() },
            '/favicon.ico': { headers: { 'X-Content-Type-Options': 'nosniff' } }
        }
    },
    {
        name: `Favicon is served without 'X-Content-Type-Options' header`,
        reports: [{
            message: noHeaderErrorMessage,
            severity: Severity.error
        }],
        serverConfig: {
            '/': { content: generateHTMLPage(), headers: { 'Content-Type': 'text/html', 'X-Content-Type-Options': 'nosniff' } },
            '/favicon.ico': ''
        }
    },
    {
        name: `Stylesheet is served without 'X-Content-Type-Options' header`,
        reports: [{
            message: noHeaderErrorMessage,
            severity: Severity.error
        }],
        serverConfig: {
            '/': { content: pageWithStylesheet, headers: { 'Content-Type': 'text/html', 'X-Content-Type-Options': 'nosniff' } },
            '/favicon.ico': { headers: { 'X-Content-Type-Options': 'nosniff' } },
            '/test.css': ''
        }
    },
    {
        name: `Alternate stylesheet is served without 'X-Content-Type-Options' header`,
        reports: [{
            message: noHeaderErrorMessage,
            severity: Severity.error
        }],
        serverConfig: {
            '/': { content: pageWithAlternateStylesheet, headers: { 'Content-Type': 'text/html', 'X-Content-Type-Options': 'nosniff' } },
            '/favicon.ico': { headers: { 'X-Content-Type-Options': 'nosniff' } },
            '/test.css': ''
        }
    },
    {
        name: `Resource is specified as a data URI`,
        serverConfig: {
            '/': {
                content: generateHTMLPage(undefined, '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==">'),
                headers: { 'X-Content-Type-Options': 'nosniff' }
            },
            '/favicon.ico': { headers: { 'X-Content-Type-Options': 'nosniff' } }
        }
    },
    {
        name: `Script is served with 'X-Content-Type-Options' header with invalid value`,
        reports: [{
            message: invalidValueMessage,
            severity: Severity.error
        }],
        serverConfig: {
            '/': { content: pageWithScript, headers: { 'Content-Type': 'text/html', 'X-Content-Type-Options': 'nosniff' } },
            '/favicon.ico': { headers: { 'X-Content-Type-Options': 'nosniff' } },
            '/test.js': { headers: { 'X-Content-Type-Options': 'invalid' } }
        }
    },
    {
        name: `All resources are served with 'X-Content-Type-Options' header`,
        serverConfig: { '*': { content: pageWithScriptAndStylesheet, headers: { 'Content-Type': 'text/html', 'X-Content-Type-Options': 'nosniff' } } }
    }
];

testHint(getHintPath(__filename), tests);
