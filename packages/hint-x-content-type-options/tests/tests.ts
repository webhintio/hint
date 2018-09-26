import generateHTMLPage from 'hint/dist/src/lib/utils/misc/generate-html-page';
import { getHintPath } from 'hint/dist/src/lib/utils/hint-helpers';
import { HintTest } from '@hint/utils-tests-helpers/dist/src/hint-test-type';
import * as hintRunner from '@hint/utils-tests-helpers/dist/src/hint-runner';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

// Page data.

const pageWithAlternateStylesheet = generateHTMLPage('<link rel="  alternate stylesheet " href="test.css">');
const pageWithScript = generateHTMLPage(undefined, '<script src="test.js"></script>');
const pageWithStylesheet = generateHTMLPage('<link rel="stylesheet" href="test.css">');

// Error messages.

const noHeaderErrorMessage = `Response should include 'x-content-type-options' header.`;
const unneededHeaderErrorMessage = `Response should not include unneeded 'x-content-type-options' header.`;

const generateInvalidValueMessage = (value: string = '') => {
    return `'x-content-type-options' header value should be 'nosniff', not '${value}'.`;
};

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

// Tests.

const tests: Array<HintTest> = [
    {
        name: `HTML page is served without 'X-Content-Type-Options' header`,
        serverConfig: { '/': '' }
    },
    {
        name: `Script is served without 'X-Content-Type-Options' header`,
        reports: [{ message: noHeaderErrorMessage }],
        serverConfig: {
            '/': pageWithScript,
            '/test.js': ''
        }
    },
    {
        name: `Stylesheet is served without 'X-Content-Type-Options' header`,
        reports: [{ message: noHeaderErrorMessage }],
        serverConfig: {
            '/': pageWithStylesheet,
            '/test.css': ''
        }
    },
    {
        name: `Alternate stylesheet is served without 'X-Content-Type-Options' header`,
        reports: [{ message: noHeaderErrorMessage }],
        serverConfig: {
            '/': pageWithAlternateStylesheet,
            '/test.css': ''
        }
    },
    {
        name: `Resource is specified as a data URI`,
        serverConfig: { '/': generateHTMLPage(undefined, '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==">') }
    },
    {
        name: `HTML page is served with the 'X-Content-Type-Options' header`,
        reports: [{ message: unneededHeaderErrorMessage }],
        serverConfig: { '/': { headers: { 'X-Content-Type-Options': 'nosniff' } } }
    },
    {
        name: `Script is served with 'X-Content-Type-Options' header with invalid value`,
        reports: [{ message: generateInvalidValueMessage('invalid') }],
        serverConfig: {
            '/': pageWithScript,
            '/test.js': { headers: { 'X-Content-Type-Options': 'invalid' } }
        }
    }
];

hintRunner.testHint(getHintPath(__filename), tests);
