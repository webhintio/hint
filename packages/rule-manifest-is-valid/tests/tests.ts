/* eslint sort-keys: 0, no-undefined: 0 */

import { generateHTMLPage } from 'sonarwhal/dist/tests/helpers/misc';
import { getRuleName } from 'sonarwhal/dist/src/lib/utils/rule-helpers';
import { IRuleTest } from 'sonarwhal/dist/tests/helpers/rule-test-type';
import * as ruleRunner from 'sonarwhal/dist/tests/helpers/rule-runner';

const htmlWithManifestSpecified = generateHTMLPage('<link rel="manifest" href="site.webmanifest">');

const tests: Array<IRuleTest> = [
    {
        name: `Manifest is not specified, so the rule does not apply and the test should pass`,
        serverConfig: generateHTMLPage('<link rel="stylesheet" href="style.css">')
    },
    {
        name: `Manifest is specified with no 'href', so the rule does not apply and the test should pass`,
        serverConfig: generateHTMLPage('<link rel="manifest">')
    },
    {
        name: `Manifest is specified with empty 'href', so the rule does not apply and the test should pass`,
        serverConfig: generateHTMLPage('<link rel="manifest" href="">')
    },
    {
        name: `Manifest is specified and its content is valid JSON`,
        serverConfig: {
            '/': htmlWithManifestSpecified,
            '/site.webmanifest': '{}'
        }
    },
    {
        name: `Manifest is specified and its content is not valid JSON`,
        reports: [{ message: `Manifest file doesn't contain valid JSON` }],
        serverConfig: {
            '/': htmlWithManifestSpecified,
            '/site.webmanifest': 'x'
        }
    },
    /*
     *     {
     *         name: `Manifest is specified as a full URL and its content is valid JSON`,
     *         serverConfig: {
     *             '/':
     * `<!doctype html>
     * <html lang="en">
     *     <head>
     *         <title>test</title>
     *         <link rel="manifest" href="https://example.com/site.webmanifest">
     *     </head>
     *     <body></body>
     * </html>`,
     *             '/site.webmanifest': '{}'
     *         }
     *     },
     */
    {
        name: `Manifest is specified and it's a binary file`,
        reports: [{ message: `Manifest file is not a text file` }],
        serverConfig: {
            '/': htmlWithManifestSpecified,
            '/site.webmanifest': { headers: { 'Content-Type': 'image/png' } }
        }
    },
    {
        name: `Manifest is specified and request for file fails`,
        serverConfig: {
            '/': htmlWithManifestSpecified,
            '/site.webmanifest': null
        }
    },
    {
        name: `Manifest is specified and request for file fails with status code`,
        serverConfig: {
            '/': htmlWithManifestSpecified,
            '/site.webmanifest': { status: 404 }
        }
    }
];

ruleRunner.testRule(getRuleName(__dirname), tests);
