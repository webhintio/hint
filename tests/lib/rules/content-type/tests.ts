/* eslint no-undefined: 0 */

import { generateHTMLPage } from '../../../helpers/misc';
import { getRuleName } from '../../../../src/lib/utils/rule-helpers';
import { RuleTest } from '../../../helpers/rule-test-type'; // eslint-disable-line no-unused-vars
import * as ruleRunner from '../../../helpers/rule-runner';

const pngContent = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
const svgContent = '<svg xmlns="http://www.w3.org/2000/svg"/>';

const ruleName = getRuleName(__dirname);

const testsForDefaults: Array<RuleTest> = [
    {
        name: `Page is served without the 'Content-Type' response header`,
        reports: [{ message: `'Content-Type' header was not specified` }],
        serverConfig: { '/': { headers: { 'Content-Type': null } } }
    },
    {
        name: `Resources are served without the 'Content-Type' response header`,
        reports: [
            { message: `'Content-Type' header was not specified` },
            { message: `'Content-Type' header was not specified` },
            { message: `'Content-Type' header was not specified` }
        ],
        serverConfig: {
            '/': {
                content: generateHTMLPage('<link rel="stylesheet" href="test.css">', `
                    <script src="test.js"></script>
                    <img src="test.png">`
                ),
                headers: { 'Content-Type': 'text/html; charset=utf-8' }
            },
            '/test.css': { headers: { 'Content-Type': null } },
            '/test.js': { headers: { 'Content-Type': null } },
            '/test.png': { headers: { 'Content-Type': null } }
        }
    },
    {
        name: `Page is served with the 'Content-Type' response header with an invalid media type`,
        reports: [{ message: `'Content-Type' header value is invalid (invalid media type)` }],
        serverConfig: { '/': { headers: { 'Content-Type': 'invalid' } } }
    },
    {
        name: `Resources are served with the 'Content-Type' response headers with invalid media types`,
        reports: [
            { message: `'Content-Type' header value is invalid (invalid media type)` },
            { message: `'Content-Type' header value is invalid (invalid media type)` },
            { message: `'Content-Type' header value is invalid (invalid media type)` }
        ],
        serverConfig: {
            '/': {
                content: generateHTMLPage('<link rel="stylesheet" href="test.css">', `
                    <script src="test.js"></script>
                    <img src="test.png">
                `),
                headers: { 'Content-Type': 'text/html; charset=utf-8' }
            },
            '/test.css': { headers: { 'Content-Type': 'invalid' } },
            '/test.js': { headers: { 'Content-Type': ';charset=utf-8' } },
            '/test.png': { headers: { 'Content-Type': '' } }
        }
    },
    {
        name: `Page is served with the 'Content-Type' response header with an invalid parameter format`,
        reports: [{ message: `'Content-Type' header value is invalid (invalid parameter format)` }],
        serverConfig: { '/': { headers: { 'Content-Type': 'text/html; invalid' } } }
    },
    {
        name: `Resources are served with the 'Content-Type' response headers with invalid parameter formats`,
        reports: [
            { message: `'Content-Type' header value is invalid (invalid parameter format)` },
            { message: `'Content-Type' header value is invalid (invalid parameter format)` },
            { message: `'Content-Type' header value is invalid (invalid parameter format)` }
        ],
        serverConfig: {
            '/': {
                content: generateHTMLPage('<link rel="stylesheet" href="test.css">', `
                    <script src="test1.js"></script>
                    <script src="test2.js"></script>
                `),
                headers: { 'Content-Type': 'text/html; charset=utf-8' }
            },
            '/test.css': { headers: { 'Content-Type': 'text/cSS;; charset=utf-8' } },
            '/test1.js': { headers: { 'Content-Type': 'application/javascript; charset=' } },
            '/test2.js': { headers: { 'Content-Type': 'APPlication/JavaScript; charset=/utf-8' } }
        }
    },
    {
        name: `Resources are served with the 'Content-Type' response header without 'charset'`,
        reports: [
            { message: `'Content-Type' header should have 'charset=utf-8'` },
            { message: `'Content-Type' header should have 'charset=utf-8'` }
        ],
        serverConfig: {
            '/': {
                content: generateHTMLPage('<link rel="manifest" href="test.json">', `<img src="test.png"><script src="test.js"></script>`),
                headers: { 'Content-Type': 'text/html; charset=utf-8' }
            },
            '/test.js': { headers: { 'Content-Type': 'application/javascript' } },
            '/test.json': { headers: { 'Content-Type': 'application/manifest+json' } },
            '/test.png': { headers: { 'Content-Type': 'image/png' } }
        }
    },
    {
        name: `Resources are served with the 'Content-Type' response header with incorrect 'charset' value`,
        reports: [
            { message: `'Content-Type' header should have 'charset=utf-8' (not 'iso-8859-1')` },
            { message: `'Content-Type' header should have 'charset=utf-8' (not 'iso-8859-1')` }
        ],
        serverConfig: {
            '/': {
                content: generateHTMLPage('<link rel="manifest" href="test.json">', `<script src="test.js"></script>`),
                headers: { 'Content-Type': 'text/html; charset=utf-8' }
            },
            '/test.js': { headers: { 'Content-Type': 'application/javascript; charset=iso-8859-1' } },
            '/test.json': { headers: { 'Content-Type': 'application/manifest+json; charset=iso-8859-1' } }
        }
    },
    {
        name: `Resources are served with the 'Content-Type' response header with unneeded 'charset'`,
        reports: [{ message: `'Content-Type' header should not have 'charset=utf-8'` }],
        serverConfig: {
            '/': {
                content: generateHTMLPage(undefined, '<img src="test.png">'),
                headers: { 'Content-Type': 'text/html; charset=utf-8' }
            },
            '/test.png': { headers: { 'Content-Type': 'image/png; charset=utf-8' } }
        }
    },
    {
        name: `Image resources are served with 'Content-Type' response headers with the wrong media types`,
        reports: [
            { message: `'Content-Type' header should have media type: 'image/png' (not 'font/woff2')` },
            { message: `'Content-Type' header should have media type: 'image/png' (not 'font/woff2')` },
            { message: `'Content-Type' header should have media type: 'image/svg+xml' (not 'font/woff2')` }
        ],
        serverConfig: {
            '/': {
                content: generateHTMLPage(undefined, '<img src="test.png"><img src="test"><img src="test.svg">'),
                headers: { 'Content-Type': 'text/html; charset=utf-8' }
            },
            '/test': {
                content: pngContent,
                headers: { 'Content-Type': 'font/woff2' }
            },
            '/test.png': {
                content: pngContent,
                headers: { 'Content-Type': 'font/woff2' }
            },
            '/test.svg': {
                content: svgContent,
                headers: { 'Content-Type': 'font/woff2' }
            }
        }
    },
    {
        name: `Web app manifest resource is served with 'Content-Type' response header with the wrong media type`,
        reports: [{ message: `'Content-Type' header should have media type: 'application/manifest+json' (not 'font/woff2')` }],
        serverConfig: {
            '/': {
                content: generateHTMLPage('<link rel="manifest" href="/test.json">'),
                headers: { 'Content-Type': 'text/html; charset=utf-8' }
            },
            '/test.json': { headers: { 'Content-Type': 'font/woff2; charset=utf-8' } }
        }
    },
    {
        name: `Script resource is served with 'Content-Type' response header with the wrong media type`,
        reports: [{ message: `'Content-Type' header should have media type: 'application/javascript' (not 'application/x-javascript')` }],
        serverConfig: {
            '/': {
                content: generateHTMLPage(undefined, `<script src="test.js"></script>`),
                headers: { 'Content-Type': 'text/html; charset=utf-8' }
            },
            '/test.js': { headers: { 'Content-Type': 'application/x-javascript; charset=utf-8' } }
        }
    },
    {
        name: `Script resource is served with 'Content-Type' response header with the wrong media type (has wrong file extension)`,
        reports: [{ message: `'Content-Type' header should have media type: 'application/javascript' (not 'text/css')` }],
        serverConfig: {
            '/': {
                content: generateHTMLPage(undefined, `<script src="test.css"></script>`),
                headers: { 'Content-Type': 'text/html; charset=utf-8' }
            },
            '/test.css': { headers: { 'Content-Type': 'text/css; charset=utf-8' } }
        }
    },
    {
        name: `Script resources are served with 'Content-Type' response headers with the wrong media types (have type attributes)`,
        reports: [
            { message: `'Content-Type' header should have media type: 'application/javascript' (not 'text/plain')` },
            { message: `'Content-Type' header should have media type: 'application/javascript' (not 'text/plain')` },
            { message: `'Content-Type' header should have media type: 'application/javascript' (not 'text/plain')` },
            { message: `'Content-Type' header should have media type: 'application/javascript' (not 'text/plain')` },
            { message: `'Content-Type' header should have media type: 'application/javascript' (not 'text/plain')` }
        ],
        serverConfig: {
            '/': {
                content: generateHTMLPage(undefined, `
                    <script type src="test1"></script>
                    <script type="" src="test2"></script>
                    <script type="text/javascript" src="test3"></script>
                    <script type="module" src="test4"></script>
                    <script type="text/plain" src="test5.js"></script>
                    <script type="text/plain" src="test6.tmpl"></script>
                    <script type="text/plain" src="test7.txt"></script>
                `),
                headers: { 'Content-Type': 'text/html; charset=utf-8' }
            },
            '/test1': { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
            '/test2': { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
            '/test3': { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
            '/test4': { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
            '/test5.js': { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
            '/test6.tmpl': { headers: { 'Content-Type': 'text/plain' } },
            '/test7.txt': { headers: { 'Content-Type': 'text/plain' } }
        }
    },
    {
        name: `Resources are served with the 'Content-Type' response headers with valid and correct values`,
        serverConfig: {
            '/': {
                content: generateHTMLPage(`
                    <link rel="manifest" href="test.json">
                `, `
                    <script src="test.js"></script>
                    <img src="test.png">
                `),
                headers: { 'cOnTent-Type': '  Text/HTML;    charset=UTF-8  ' }
            },
            '/test.js': { headers: { 'coNtEnt-tyPe': 'APPlication/JavaScript; charset=utf-8' } },
            '/test.json': { headers: { 'content-TYPE': 'application/MANIFEST+json; CHARset=UTF-8' } },
            '/test.png': { headers: { 'CONTENT-TYPE': 'IMAGE/PNG' } }
        }
    }
];

const testsForConfigs: Array<RuleTest> = [
    {
        name: `Resources are served with the 'Content-Type' HTTP response header with the wrong media types because of the configs`,
        reports: [
            { message: `'Content-Type' header should have the value: 'text/javascript'` },
            { message: `'Content-Type' header should have the value: 'application/x-javascript'` }
        ],
        serverConfig: {
            '/': {
                content: generateHTMLPage(undefined, `
                    <script src="test1.js"></script>
                    <script src="test/test2.js"></script>
                    <script src="test3.js"></script>
                `),
                headers: { 'Content-Type': 'text/html; charset=utf-8' }
            },
            '/test/test2.js': { headers: { 'Content-Type': 'text/javascript; charset=utf-8' } },
            '/test1.js': { headers: { 'Content-Type': 'application/javascript; charset=utf-8' } },
            '/test3.js': { headers: { 'Content-Type': 'application/x-javascript; charset=utf-8' } }
        }
    }
];

ruleRunner.testRule(ruleName, testsForDefaults);
ruleRunner.testRule(ruleName, testsForConfigs, {
    ruleOptions: {
        '.*\\.js': 'text/javascript',
        'test/test2\\.js': 'text/javascript; charset=utf-8',
        'test3\\.js': 'application/x-javascript'
    }
});
