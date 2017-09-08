/* eslint no-undefined: 0 */

import { generateHTMLPage } from '../../../helpers/misc';
import { getRuleName } from '../../../../src/lib/utils/rule-helpers';
import { IRuleTest } from '../../../helpers/rule-test-type';
import * as ruleRunner from '../../../helpers/rule-runner';

// Error messages.

const noHeaderMessage = `'x-content-type-options' header was not specified`;
const generateInvalidValueMessage = (value: string = '') => {
    return `'x-content-type-options' header value (${value}) is invalid`;
};

// Page data.

const generateHTMLPageData = (content: string) => {
    return {
        content,
        headers: { 'X-Content-Type-Options': 'nosniff' }
    };
};

const htmlPageWithScriptData = generateHTMLPageData(generateHTMLPage(undefined, '<script src="test.js"></script>'));
const htmlPageWithManifestData = generateHTMLPageData(generateHTMLPage('<link rel="manifest" href="test.webmanifest">'));

// Tests.

const tests: Array<IRuleTest> = [
    {
        name: `HTML page is served without 'X-Content-Type-Options' header`,
        reports: [{ message: noHeaderMessage }],
        serverConfig: { '/': '' }
    },
    {
        name: `Manifest is served without 'X-Content-Type-Options' header`,
        reports: [{ message: noHeaderMessage }],
        serverConfig: {
            '/': htmlPageWithManifestData,
            '/test.webmanifest': ''
        }
    },
    {
        name: `Resource is served without 'X-Content-Type-Options' header`,
        reports: [{ message: noHeaderMessage }],
        serverConfig: {
            '/': htmlPageWithScriptData,
            '/test.js': ''
        }
    },
    {
        name: `Resource is specified as a data URI`,
        serverConfig: { '/': generateHTMLPageData(generateHTMLPage(undefined, '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==">')) }
    },
    {
        name: `HTML page is served with 'X-Content-Type-Options' header with invalid value`,
        reports: [{ message: generateInvalidValueMessage('no-sniff') }],
        serverConfig: { '/': { headers: { 'X-Content-Type-Options': 'no-sniff' } } }
    },
    {
        name: `Manifest is served with 'X-Content-Type-Options' header with invalid value`,
        reports: [{ message: generateInvalidValueMessage() }],
        serverConfig: {
            '/': htmlPageWithManifestData,
            '/test.webmanifest': { headers: { 'X-Content-Type-Options': '' } }
        }
    },
    {
        name: `Resource is served with 'X-Content-Type-Options' header with invalid value`,
        reports: [{ message: generateInvalidValueMessage('invalid') }],
        serverConfig: {
            '/': htmlPageWithScriptData,
            '/test.js': { headers: { 'X-Content-Type-Options': 'invalid' } }
        }
    }
];

ruleRunner.testRule(getRuleName(__dirname), tests);
