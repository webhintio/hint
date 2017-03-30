/* eslint sort-keys: 0, no-undefined: 0 */

import { Rule } from '../../../../lib/types'; // eslint-disable-line no-unused-vars
import { RuleTest } from '../../../helpers/rule-test-type'; // eslint-disable-line no-unused-vars
import * as ruleRunner from '../../../helpers/rule-runner';

const htmlWithManifestSpecified =
    `<!doctype html>
<html lang="en">
    <head>
        <title>test</title>
        <link rel="manifest" href="site.webmanifest">
    </head>
    <body></body>
</html>`;

const tests: Array<RuleTest> = [
    {
        name: `Web app manifest is not specified`,
        serverConfig:
`<!doctype html>
<html lang="en">
    <head>
        <title>test</title>
        <link rel="stylesheet" href="style.css">
    </head>
    <body></body>
</html>`
    },
    {
        name: `Web app manifest is specified with no 'href'`,
        serverConfig:
`<!doctype html>
<html lang="en">
    <head>
        <title>test</title>
        <link rel="manifest">
    </head>
    <body></body>
</html>`
    },
    {
        name: `Web app manifest is specified with empty 'href'`,
        serverConfig:
`<!doctype html>
<html lang="en">
    <head>
        <title>test</title>
        <link rel="manifest" href="">
    </head>
    <body></body>
</html>`
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
    {
        name: `Web app manifest is specified as a full URL and its content is valid JSON`,
        serverConfig: {
            '/':
`<!doctype html>
<html lang="en">
    <head>
        <title>test</title>
        <link rel="manifest" href="https://example.com/site.webmanifest">
    </head>
    <body></body>
</html>`,
            '/site.webmanifest': '{}'
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

ruleRunner.testRule('manifest-is-valid', tests);
