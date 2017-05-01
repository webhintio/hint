/* eslint sort-keys: 0, no-undefined: 0 */

import { RuleTest } from '../../../helpers/rule-test-type'; // eslint-disable-line no-unused-vars
import * as ruleRunner from '../../../helpers/rule-runner';
import { getRuleName } from '../../../../src/lib/utils/rule-helpers';

const ruleName = getRuleName(__dirname);

const generateHTML = (body: string): string => {
    return `<!doctype html>
<html lang="en">
    <head>
        <title>test</title>
    </head>
    <body>
        ${body}
    </body>
</html>`;
};

const testsForDefaults: Array<RuleTest> = [
    {
        name: 'Elements do not have `target="_blank"`',
        serverConfig: {
            '/': {
                content: generateHTML(`
        <a href="/">test</a>
        <a href="test.html">test</a>
        <a href="https://example.com">test</a>
        <img src="test.png" width="10" height="10" usemap="#test">
        <map name="test">
            <area shape="rect" coords="0,0,82,126" href="https://example.com">
        </map>`)
            }
        }
    },
    {
        name: 'Elements have `target="_blank"`',
        reports: [
            { message: 'Missing link types on `<a href="//example.com" target="_blank">test</a>`: noopener, noreferrer' },
            { message: 'Missing link types on `<a href="https://example.com" target="_blank">test</a>`: noopener, noreferrer' },
            { message: 'Missing link types on `<area shape="rect" coords="0,0,5,5" href="//example.com" target="_blank">`: noopener, noreferrer' },
            { message: 'Missing link types on `<area shape="rect" coords="0,0,50,50" href="https://example.com" target="_blank">`: noopener, noreferrer' }
        ],
        serverConfig: {
            '/': {
                content: generateHTML(`
        <a href="/" target="_blank">test</a>
        <a href="test.html" target="_blank">test</a>
        <a href="http://localhost/test.html" target="_blank">test</a>
        <a href="//example.com" target="_blank">test</a>
        <a href="https://example.com" target="_blank">test</a>
        <img src="test.png" width="10" height="10" usemap="#test">
        <map name="test">
            <area shape="rect" coords="0,0,5,5" href="//example.com" target="_blank">
            <area shape="rect" coords="0,0,50,50" href="https://example.com" target="_blank">
        </map>`)
            }
        }
    },
    {
        name: 'Elements have `target="_blank"` and no `href`',
        serverConfig: {
            '/': {
                content: generateHTML(`
        <a target="_blank">test</a>
        <img src="test.png" width="10" height="10" usemap="#test">
        <map name="test">
            <area shape="rect" coords="0,0,5,5" target="_blank">
        </map>`)
            }
        }
    },
    {
        name: 'Elements have `target="_blank"` and empty `href`',
        serverConfig: {
            '/': {
                content: generateHTML(`
        <a href target="_blank">test</a>
        <a href="" target="_blank">test</a>
        <img src="test.png" width="10" height="10" usemap="#test">
        <map name="test">
            <area shape="rect" coords="0,0,5,5" href target="_blank">
            <area shape="rect" coords="0,0,5,5" href="" target="_blank">
        </map>`)
            }
        }
    },
    {
        name: 'Elements have `target="_blank"` and `rel="noopener"`',
        reports: [
            { message: 'Missing link type on `<a href="https://example.com" target="_blank" rel="noopener">test</a>`: noreferrer' },
            { message: 'Missing link type on `<area shape="rect" coords="0,0,5,5" href="https://example.com" target="_blank" rel="noopener">`: noreferrer' }
        ],
        serverConfig: {
            '/': {
                content: generateHTML(`
        <a href="https://example.com" target="_blank" rel="noopener">test</a>
        <img src="test.png" width="10" height="10" usemap="#test">
        <map name="test">
            <area shape="rect" coords="0,0,5,5" href="https://example.com" target="_blank" rel="noopener">
        </map>`)
            }
        }
    },
    {
        name: 'Elements have `target="_blank"` and `rel="noreferrer"`',
        reports: [
            { message: 'Missing link type on `<a href="https://example.com" target="_blank" rel="noreferrer">test</a>`: noopener' },
            { message: 'Missing link type on `<area shape="rect" coords="0,0,5,5" href="https://example.com" target="_blank" rel="noreferrer">`: noopener' }
        ],
        serverConfig: {
            '/': {
                content: generateHTML(`
        <a href="https://example.com" target="_blank" rel="noreferrer">test</a>
        <img src="test.png" width="10" height="10" usemap="#test">
        <map name="test">
            <area shape="rect" coords="0,0,5,5" href="https://example.com" target="_blank" rel="noreferrer">
        </map>`)
            }
        }
    },
    {
        name: 'Elements have `target="_blank"` and `rel="noopener noreferrer"`',
        serverConfig: {
            '/': {
                content: generateHTML(`
        <a href="https://example.com" target="_blank" rel="noopener noreferrer">test</a>
        <img src="test.png" width="10" height="10" usemap="#test">
        <map name="test">
            <area shape="rect" coords="0,0,5,5" href="https://example.com" target="_blank" rel="noopener noreferrer">
        </map>`)
            }
        }
    }
];

const testsForConfigs: Array<RuleTest> = [
    {
        name: `Elements that point to the same origin have target="_blank"`,
        reports: [
            { message: 'Missing link types on `<a href="" target="_blank">test</a>`: noopener, noreferrer' },
            { message: 'Missing link types on `<a href="/test.html" target="_blank">test</a>`: noopener, noreferrer' },
            { message: 'Missing link types on `<a href="http://localhost/test.html" target="_blank">test</a>`: noopener, noreferrer' },
            { message: 'Missing link types on `<area shape="rect" coords="0,0,5,5" href="" target="_blank">`: noopener, noreferrer' },
            { message: 'Missing link types on `<area shape="rect" coords="0,0,5,5" href="/test.html" target="_blank">`: noopener, noreferrer' },
            { message: 'Missing link types on `<area shape="rect" coords="0,0,5,5" href="http://localhost/test.html" target="_blank">`: noopener, noreferrer' }
        ],
        serverConfig: {
            '/': {
                content: generateHTML(`
        <a href="" target="_blank">test</a>
        <a href="/test.html" target="_blank">test</a>
        <a href="http://localhost/test.html" target="_blank">test</a>
        <img src="test.png" width="10" height="10" usemap="#test">
        <map name="test">
            <area shape="rect" coords="0,0,5,5" href="" target="_blank">
            <area shape="rect" coords="0,0,5,5" href="/test.html" target="_blank">
            <area shape="rect" coords="0,0,5,5" href="http://localhost/test.html" target="_blank">
        </map>`)
            }
        }
    }
];

ruleRunner.testRule(ruleName, testsForDefaults);
ruleRunner.testRule(ruleName, testsForConfigs, { includeSameOriginURLs: true });
