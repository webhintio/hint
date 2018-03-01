/* eslint no-undefined: 0 */

import { generateHTMLPage } from 'sonarwhal/dist/tests/helpers/misc';
import { getRuleName } from 'sonarwhal/dist/src/lib/utils/rule-helpers';
import { RuleTest } from 'sonarwhal/dist/tests/helpers/rule-test-type';
import * as ruleRunner from 'sonarwhal/dist/tests/helpers/rule-runner';

// Error messages.

const noHeaderMessage = `'x-content-type-options' header is not specified`;
const unneededHeaderMessage = `'x-content-type-options' header is not needed`;
const generateInvalidValueMessage = (value: string = '') => {
    return `'x-content-type-options' header value (${value}) is invalid`;
};

// Page data.

const htmlPageWithScript = generateHTMLPage(undefined, '<script src="test.js"></script>');
const htmlPageWithStylesheet = generateHTMLPage('<link rel="stylesheet" href="test.css">');
const htmlPageWithManifest = generateHTMLPage('<link rel="manifest" href="test.webmanifest">');

// Tests.

const tests: Array<RuleTest> = [
    {
        name: `HTML page is served without 'X-Content-Type-Options' header`,
        serverConfig: { '/': '' }
    },
    {
        name: `Manifest is served without 'X-Content-Type-Options' header`,
        serverConfig: {
            '/': htmlPageWithManifest,
            '/test.webmanifest': ''
        }
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
        name: `Resource is specified as a data URI`,
        serverConfig: { '/': generateHTMLPage(undefined, '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==">') }
    },
    {
        name: `HTML page is served with the 'X-Content-Type-Options' header`,
        reports: [{ message: unneededHeaderMessage }],
        serverConfig: { '/': { headers: { 'X-Content-Type-Options': 'nosniff' } } }
    },
    {
        name: `Manifest is served without 'X-Content-Type-Options' header`,
        reports: [{ message: unneededHeaderMessage }],
        serverConfig: {
            '/': htmlPageWithManifest,
            '/test.webmanifest': { headers: { 'X-Content-Type-Options': 'invalid' } }
        }
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

ruleRunner.testRule(getRuleName(__dirname), tests);
