/* eslint no-undefined: 0 */

import generateHTMLPage from 'hint/dist/src/lib/utils/misc/generate-html-page';
import { getHintPath } from 'hint/dist/src/lib/utils/hint-helpers';
import { HintTest } from '@hint/utils-tests-helpers/dist/src/hint-test-type';
import * as hintRunner from '@hint/utils-tests-helpers/dist/src/hint-runner';

// Error messages.

const noHeaderMessage = `'x-content-type-options' header is not specified`;
const unneededHeaderMessage = `'x-content-type-options' header is not needed`;
const generateInvalidValueMessage = (value: string = '') => {
    return `'x-content-type-options' header value (${value}) is invalid`;
};

// Page data.

const htmlPageWithScript = generateHTMLPage(undefined, '<script src="test.js"></script>');
const htmlPageWithStylesheet = generateHTMLPage('<link rel="stylesheet" href="test.css">');
const htmlPageWithAlternateStylesheet = generateHTMLPage('<link rel="  alternate stylesheet " href="test.css">');

// Tests.

const tests: Array<HintTest> = [
    {
        name: `HTML page is served without 'X-Content-Type-Options' header`,
        serverConfig: { '/': '' }
    },
    {
        name: `Script is served without 'X-Content-Type-Options' header`,
        reports: [{ message: noHeaderMessage }],
        serverConfig: {
            '/': htmlPageWithScript,
            '/test.js': ''
        }
    },
    {
        name: `Stylesheet is served without 'X-Content-Type-Options' header`,
        reports: [{ message: noHeaderMessage }],
        serverConfig: {
            '/': htmlPageWithStylesheet,
            '/test.css': ''
        }
    },
    {
        name: `Alternative stylesheet is served without 'X-Content-Type-Options' header`,
        reports: [{ message: noHeaderMessage }],
        serverConfig: {
            '/': htmlPageWithAlternateStylesheet,
            '/test.css': ''
        }
    },
    {
        name: `Resource is specified as a data URI`,
        serverConfig: { '/': generateHTMLPage(undefined, '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==">') }
    },
    {
        name: `HTML page is served with the 'X-Content-Type-Options' header`,
        reports: [{ message: unneededHeaderMessage }],
        serverConfig: { '/': { headers: { 'X-Content-Type-Options': 'nosniff' } } }
    },
    {
        name: `Script is served with 'X-Content-Type-Options' header with invalid value`,
        reports: [{ message: generateInvalidValueMessage('invalid') }],
        serverConfig: {
            '/': htmlPageWithScript,
            '/test.js': { headers: { 'X-Content-Type-Options': 'invalid' } }
        }
    }
];

hintRunner.testHint(getHintPath(__filename), tests);
