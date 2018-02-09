/* eslint no-undefined: 0 */

import * as fs from 'fs';

import { generateHTMLPage } from 'sonarwhal/dist/tests/helpers/misc';
import { getRuleName } from 'sonarwhal/dist/src/lib/utils/rule-helpers';
import { IRuleTest } from 'sonarwhal/dist/tests/helpers/rule-test-type';
import * as ruleRunner from 'sonarwhal/dist/tests/helpers/rule-runner';

const ruleName = getRuleName(__dirname);

const pngFileContent = fs.readFileSync(`${__dirname}/fixtures/image.png`); // eslint-disable-line no-sync
const svgFileContent = '<svg xmlns="http://www.w3.org/2000/svg"><path d="M1,1"/></svg>';
// const woff2FileContent = fs.readFileSync(`${__dirname}/fixtures/test.woff2`);

const incorrectCharsetMessage = `'content-type' header should have 'charset=utf-8' (not 'iso-8859-1')`;
const invalidMediaTypeMessage = `'content-type' header value is invalid (invalid media type)`;
const invalidParameterFormatMessage = `'content-type' header value is invalid (invalid parameter format)`;
const noCharsetMessage = `'content-type' header should have 'charset=utf-8'`;
const noHeaderMessage = `'content-type' header was not specified`;
const unneededCharsetMessage = `'content-type' header should not have 'charset=utf-8'`;

const generateIncorrectMediaTypeMessage = (expectedType: string, actualType: string) => {
    return `'content-type' header should have media type '${expectedType}' (not '${actualType}')`;
};

const generateRequireValueMessage = (expectedValue: string) => {
    return `'content-type' header should have the value '${expectedValue}'`;
};

const generateHTMLPageData = (content: string) => {
    return {
        content,
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
    };
};

const testsForDefaults: Array<IRuleTest> = [

    // No `Content-Type` header.

    // {
    //     name: `HTML page is served without 'Content-Type' header`,
    //     reports: [{ message: noHeaderMessage }],
    //     serverConfig: { '/': { headers: { 'Content-Type': null } } }
    // },
    {
        name: `Resource is served without 'Content-Type' header`,
        reports: [{ message: noHeaderMessage }],
        serverConfig: {
            '/': generateHTMLPageData(generateHTMLPage('<link rel="stylesheet" href="test.css">')),
            '/test.css': { headers: { 'Content-Type': null } }
        }
    },
//     {
//         name: `Resource is specified as a data URI`,
//         serverConfig: { '/': generateHTMLPageData(generateHTMLPage(undefined, '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==">')) }
//     },

//     // `Content-Type` value contains invalid media type.

//     {
//         name: `HTML page is served with 'Content-Type' header with invalid media type`,
//         reports: [{ message: invalidMediaTypeMessage }],
//         serverConfig: { '/': { headers: { 'Content-Type': 'invalid' } } }
//     },
//     {
//         name: `Resource is served with 'Content-Type' header with invalid media type (empty media type)`,
//         reports: [{ message: invalidMediaTypeMessage }],
//         serverConfig: {
//             '/': generateHTMLPageData(generateHTMLPage(undefined, '<img src="test.png">')),
//             '/test.png': { headers: { 'Content-Type': '' } }
//         }
//     },

//     // `Content-Type` value contains invalid parameter format.

//     {
//         name: `HTML page is served with 'Content-Type' header with an invalid parameter format`,
//         reports: [{ message: invalidParameterFormatMessage }],
//         serverConfig: { '/': { headers: { 'Content-Type': 'text/html; invalid' } } }
//     },
//     {
//         name: `Resource is served with 'Content-Type' header with an invalid parameter format`,
//         reports: [{ message: invalidParameterFormatMessage }],
//         serverConfig: {
//             '/': generateHTMLPageData(generateHTMLPage(undefined, '<script src="test.js"></script>')),
//             '/test.js': { headers: { 'Content-Type': 'text/javascript; charset=inva/id' } }
//         }
//     },

//     // `Content-Type` value doesn't contain `charset` parameter were needed.

//     {
//         name: `HTML page is served with 'Content-Type' header without 'charset' parameter`,
//         reports: [{ message: noCharsetMessage }],
//         serverConfig: { '/': { headers: { 'Content-Type': 'text/html' } } }
//     },
//     {
//         name: `Image is served with 'Content-Type' header without 'charset' parameter`,
//         serverConfig: {
//             '/': generateHTMLPageData(generateHTMLPage(undefined, '<img src="test.png">')),
//             '/test.png': { headers: { 'Content-Type': 'image/png' } }
//         }
//     },
//     {
//         name: `Script is served with 'Content-Type' header without 'charset' parameter`,
//         reports: [{ message: noCharsetMessage }],
//         serverConfig: {
//             '/': generateHTMLPageData(generateHTMLPage(undefined, '<script src="test.js"></script>')),
//             '/test.js': { headers: { 'Content-Type': 'text/javascript' } }
//         }
//     },

//     // `Content-Type` value contain wrong `charset`.

//     {
//         name: `HTML page is served with 'Content-Type' header with wrong 'charset'`,
//         reports: [{ message: incorrectCharsetMessage }],
//         serverConfig: { '/': { headers: { 'Content-Type': 'text/html; charset=iso-8859-1' } } }
//     },
//     {
//         name: `Image is served with 'Content-Type' header with unneeded 'charset' parameter`,
//         reports: [{ message: unneededCharsetMessage }],
//         serverConfig: {
//             '/': generateHTMLPageData(generateHTMLPage(undefined, '<img src="test.png">')),
//             '/test.png': { headers: { 'Content-Type': 'image/png; charset=utf-8' } }
//         }
//     },
//     {
//         name: `Manifest is served with 'Content-Type' header with wrong 'charset'`,
//         reports: [{ message: incorrectCharsetMessage }],
//         serverConfig: {
//             '/': generateHTMLPageData(generateHTMLPage('<link rel="manifest" href="test.json">')),
//             '/test.json': { headers: { 'Content-Type': 'application/manifest+json; charset=iso-8859-1' } }
//         }
//     },
//     {
//         name: `Script is served with 'Content-Type' header with wrong 'charset'`,
//         reports: [{ message: incorrectCharsetMessage }],
//         serverConfig: {
//             '/': generateHTMLPageData(generateHTMLPage(undefined, '<script src="test.js"></script>')),
//             '/test.js': { headers: { 'Content-Type': 'text/javascript;charset=iso-8859-1' } }
//         }
//     },

//     /*
//      * `Content-Type` value contain wrong `media type`.
//      * TODO: Enable if `jsdom` supports downloading fonts, or #250 is implemented.
//      * {
//      *     name: `WOFF2 font is served with 'Content-Type' header with the wrong media type`,
//      *     reports: [{ message: generateIncorrectMediaTypeMessage('font/woff2', 'application/font-woff2') }],
//      *     serverConfig: {
//      *         '/': generateHTMLPageData(generateHTMLPage(`
//      *             <style>
//      *                 @font-face {
//      *                     font-family: 'Open Sans';
//      *                     font-style: normal;
//      *                     font-weight: 400;
//      *                     src: local('Open Sans Regular'), local('OpenSans-Regular'), url(test.woff2) format('woff2');
//      *                 }
//      *
//      *                 body {
//      *                     font-family: 'Open Sans';
//      *                 }
//      *             </style>`, 'a')),
//      *         '/test.woff2': {
//      *             content: woff2FileContent,
//      *             headers: { 'Content-Type': 'application/font-woff2' }
//      *         }
//      *     }
//      * },
//      */
//     {
//         name: `Image is served with 'Content-Type' header with the wrong media type`,
//         reports: [{ message: generateIncorrectMediaTypeMessage('image/png', 'font/woff') }],
//         serverConfig: {
//             '/': generateHTMLPageData(generateHTMLPage(undefined, '<img src="test.png">')),
//             '/test.png': {
//                 content: pngFileContent,
//                 headers: { 'Content-Type': 'font/woff' }
//             }
//         }
//     },
//     {
//         name: `Manifest is served with 'Content-Type' header with the wrong media type`,
//         reports: [{ message: generateIncorrectMediaTypeMessage('application/manifest+json', 'font/woff') }],
//         serverConfig: {
//             '/': generateHTMLPageData(generateHTMLPage('<link rel="manifest" href="/test.json">')),
//             '/test.json': {
//                 content: pngFileContent,
//                 headers: { 'Content-Type': 'font/woff; charset=utf-8' }
//             }
//         }
//     },
//     {
//         name: `Script is served with 'Content-Type' header with the wrong media type`,
//         reports: [{ message: generateIncorrectMediaTypeMessage('text/javascript', 'application/javascript') }],
//         serverConfig: {
//             '/': generateHTMLPageData(generateHTMLPage(undefined, '<script src="test.js"></script>')),
//             '/test.js': { headers: { 'Content-Type': 'application/javascript; charset=utf-8' } }
//         }
//     },
//     {
//         name: `Script is served with 'Content-Type' header with the wrong media type (has wrong file extension)`,
//         reports: [{ message: generateIncorrectMediaTypeMessage('text/javascript', 'text/css') }],
//         serverConfig: {
//             '/': generateHTMLPageData(generateHTMLPage(undefined, '<script src="test.css"></script>')),
//             '/test.css': { headers: { 'Content-Type': 'text/css; charset=utf-8' } }
//         }
//     },
//     {
//         name: `Script is served with 'Content-Type' header with the wrong media type (has empty 'type' attribute)`,
//         reports: [{ message: generateIncorrectMediaTypeMessage('text/javascript', 'text/plain') }],
//         serverConfig: {
//             '/': generateHTMLPageData(generateHTMLPage(undefined, '<script type src="test"></script>')),
//             '/test': { headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
//         }
//     },
//     {
//         name: `Script is served with 'Content-Type' header with the wrong media type (has 'type=text/javascript')`,
//         reports: [{ message: generateIncorrectMediaTypeMessage('text/javascript', 'text/plain') }],
//         serverConfig: {
//             '/': generateHTMLPageData(generateHTMLPage(undefined, '<script type="text/javascript" src="test"></script>')),
//             '/test': { headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
//         }
//     },
//     /*
//      * TODO: Enable once Chrome has support for modules without a flag (https://www.chromestatus.com/feature/5365692190687232)
//      * {
//      *     name: `Script is served with 'Content-Type' header with the wrong media type (has 'type=module')`,
//      *     reports: [{ message: generateIncorrectMediaTypeMessage('text/javascript', 'text/plain') }],
//      *     serverConfig: {
//      *         '/': generateHTMLPageData(generateHTMLPage(undefined, '<script type="module" src="test"></script>')),
//      *         '/test': { headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
//      *     }
//      * },
//      * TODO: Chrome will not download if it doesn't like the type: https://github.com/sonarwahl/sonarwhal/pull/245#discussion_r120083650, #250
//      * {
//      *     name: `Script is served with 'Content-Type' header with the wrong media type (has 'type=text/plain' and 'js' file extension)`,
//      *     reports: [{ message: generateIncorrectMediaTypeMessage('text/javascript', 'text/plain') }],
//      *     serverConfig: {
//      *         '/': generateHTMLPageData(generateHTMLPage(undefined, '<script type="text/plain" src="test.js"></script>')),
//      *         '/test.js': { headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
//      *     }
//      * },
//      * TODO: The following test passes in CDP because it doesn't download anything so no errors. Need to do #250 so we can keep testing elsewhere
//      * {
//      *     name: `Script is served with 'Content-Type' header with the wrong media type (has 'type=text/plain' and 'tmpl' file extension)`,
//      *     serverConfig: {
//      *         '/': generateHTMLPageData(generateHTMLPage(undefined, '<script type="text/plain" src="test.tmpl"></script>')),
//      *         '/test.tmpl': { headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
//      *     }
//      * },
//      * TODO: The following test passes in CDP because it doesn't download anything so no errors. Need to do #250 so we can keep testing elsewhere
//      * {
//      *     name: `Script is served with 'Content-Type' header with the wrong media type (has 'type=simple/template' and 'tmpl' file extension)`,
//      *     serverConfig: {
//      *         '/': generateHTMLPageData(generateHTMLPage(undefined, '<script type="text/plain" src="test.txt"></script>')),
//      *         '/test.txt': { headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
//      *     }
//      * },
//      */
//     {
//         name: `Stylesheet is served with 'Content-Type' header with the wrong media type`,
//         reports: [{ message: generateIncorrectMediaTypeMessage('text/css', 'font/woff') }],
//         serverConfig: {
//             '/': generateHTMLPageData(generateHTMLPage('<link rel="stylesheet" href="test.css">')),
//             '/test.css': { headers: { 'Content-Type': 'font/woff; charset=utf-8' } }
//         }
//     },
//     {
//         name: `SVG is served with 'Content-Type' header with the wrong media type`,
//         reports: [
//             { message: generateIncorrectMediaTypeMessage('image/svg+xml', 'font/woff') },
//             { message: noCharsetMessage }
//         ],
//         serverConfig: {
//             '/': generateHTMLPageData(generateHTMLPage(undefined, '<img src="test.svg">')),
//             '/test.svg': {
//                 content: svgFileContent,
//                 headers: { 'Content-Type': 'font/woff' }
//             }
//         }
//     },

//     // `Content-Type` value contain correct value.

//     {
//         name: `HTML page is served with correct value for 'Content-Type' header`,
//         serverConfig: { '/': { headers: { 'Content-Type': 'text/html;charset=utf-8' } } }
//     },
//     {
//         name: `Image is served with correct value for 'Content-Type' header`,
//         serverConfig: {
//             '/': generateHTMLPageData(generateHTMLPage(undefined, '<img src="test.png">')),
//             '/test.png': { headers: { 'content-Type': 'image/PNG' } }
//         }
//     },
//     {
//         name: `Manifest is served with correct value for 'Content-Type' header`,
//         serverConfig: {
//             '/': generateHTMLPageData(generateHTMLPage('<link rel="manifest" href="test.json">')),
//             '/test.json': { headers: { 'CONTENT-TYPE': 'APPLICATION/MANIFEST+JSON; CHARSET=UTF-8' } }
//         }
//     },
//     {
//         name: `Script is served with correct value for 'Content-Type' header`,
//         serverConfig: {
//             '/': generateHTMLPageData(generateHTMLPage(undefined, '<script src="test.js"></script>')),
//             '/test.js': { headers: { 'content-type': '   Text/JavaScript;   Charset=UTF-8' } }
//         }
//     }
];

// const testsForConfigs: Array<IRuleTest> = [
//     {
//         name: `Script is served with 'Content-Type' header with the correct media type but wrong because of the custom config`,
//         reports: [{ message: generateRequireValueMessage('application/javascript') }],
//         serverConfig: {
//             '/': generateHTMLPageData(generateHTMLPage(undefined, `<script src="test.js"></script>`)),
//             '/test.js': { headers: { 'Content-Type': 'text/javascript; charset=utf-8' } }
//         }
//     },
//     {
//         name: `Script is served with 'Content-Type' header with the correct media type but fails because of the custom config overwrites`,
//         reports: [{ message: generateRequireValueMessage('application/x-javascript; charset=utf-8') }],
//         serverConfig: {
//             '/': generateHTMLPageData(generateHTMLPage(undefined, `<script src="test/test2.js"></script>`)),
//             '/test/test2.js': { headers: { 'Content-Type': 'application/javascript' } }
//         }
//     },
//     {
//         name: `Script is served with 'Content-Type' header with the incorrect media type but passes because of the custom config`,
//         serverConfig: {
//             '/': generateHTMLPageData(generateHTMLPage(undefined, `<script src="test3.js"></script>`)),
//             '/test3.js': { headers: { 'Content-Type': 'application/x-javascript' } }
//         }
//     }
// ];

ruleRunner.testRule(ruleName, testsForDefaults);
// ruleRunner.testRule(ruleName, testsForConfigs, {
//     ruleOptions: {
//         '.*\\.js': 'application/javascript',
//         'test/test2\\.js': 'application/x-javascript; charset=utf-8',
//         'test3\\.js': 'application/x-javascript'
//     }
// });
