/* eslint sort-keys: 0, no-undefined: 0 */

import { generateHTMLPage } from '../../../helpers/misc';
import { getRuleName } from '../../../../src/lib/utils/rule-helpers';
import { RuleTest } from '../../../helpers/rule-test-type'; // eslint-disable-line no-unused-vars
import * as ruleRunner from '../../../helpers/rule-runner';

const htmlWithManifestSpecified = generateHTMLPage('<link rel="manifest" href="site.webmanifest">');

const tests: Array<RuleTest> = [
    {
        name: `Web app manifest is not specified`,
        serverConfig: generateHTMLPage('<link rel="stylesheet" href="style.css">')
    },
    {
        name: `Web app manifest is specified with no 'href'`,
        serverConfig: generateHTMLPage('<link rel="manifest">')
    },
    {
        name: `Web app manifest is specified with empty 'href'`,
        serverConfig: generateHTMLPage('<link rel="manifest" href="">')
    },
    {
        name: `Web app manifest is specified and its content is valid JSON`,
        serverConfig: {
            '/': htmlWithManifestSpecified,
            '/site.webmanifest': '{}'
        }
    },
    {
        name: `Web app manifest is specified and its content is not valid JSON`,
        reports: [{ message: `Web app manifest file doesn't contain valid JSON` }],
        serverConfig: {
            '/': htmlWithManifestSpecified,
            '/site.webmanifest': 'x'
        }
    },
    //     {
    //         name: `Web app manifest is specified as a full URL and its content is valid JSON`,
    //         serverConfig: {
    //             '/':
    // `<!doctype html>
    // <html lang="en">
    //     <head>
    //         <title>test</title>
    //         <link rel="manifest" href="https://example.com/site.webmanifest">
    //     </head>
    //     <body></body>
    // </html>`,
    //             '/site.webmanifest': '{}'
    //         }
    //     },
    {
        name: `Web app manifest is specified and it's a binary file`,
        reports: [{ message: `Web app manifest file is not a text file` }],
        serverConfig: {
            '/': htmlWithManifestSpecified,
            '/site.webmanifest': { headers: { 'Content-Type': 'image/png' } }
        }
    },
    {
        name: `Web app manifest is specified and request for file fails`,
        serverConfig: {
            '/': htmlWithManifestSpecified,
            '/site.webmanifest': null
        }
    },
    {
        name: `Web app manifest is specified and request for file fails with status code`,
        serverConfig: {
            '/': htmlWithManifestSpecified,
            '/site.webmanifest': { status: 404 }
        }
    }
];

ruleRunner.testRule(getRuleName(__dirname), tests);
