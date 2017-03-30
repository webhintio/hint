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
    <body>

    </body>
</html>`;

const tests: Array<RuleTest> = [
    {
        name: `Web app manifest is not specified`,
        reports: [{ message: 'Web app manifest not specified' }],
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
        name: `Web app manifest is already specified`,
        reports: [{ message: 'Web app manifest already specified' }],
        serverConfig: {
            '/':
`<!doctype html>
<html lang="en">
    <head>
        <title>test</title>
        <link rel="manifest" href="site1.webmanifest">
        <link rel="manifest" href="site2.webmanifest">
    </head>
    <body></body>
</html>`,
            '/site1.webmanifest': '',
            '/site2.webmanifest': ''
        }
    },
    {
        name: `Web app manifest is specified with no 'href'`,
        reports: [{ message: `Web app manifest specified with invalid 'href'` }],
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
        reports: [{ message: `Web app manifest specified with invalid 'href'` }],
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
        name: `Web app manifest is specified as a full URL`,
        serverConfig: {
            '/':
`<!doctype html>
<html lang="en">
    <head>
        <title>test</title>
        <link rel="manifest" href="http://localhost/site.webmanifest">
    </head>
    <body></body>
</html>`,
            '/site.webmanifest': ''
        }
    },
    {
        name: `Web app manifest is specified and the file exists`,
        serverConfig: {
            '/': htmlWithManifestSpecified,
            '/site.webmanifest': ''
        }
    },
    {
        name: `Web app manifest is specified and request for file fails`,
        reports: [{ message: `Web app manifest file request failed` }],
        serverConfig: {
            '/': htmlWithManifestSpecified,
            '/site.webmanifest': null
        }
    },
    {
        name: `Web app manifest is specified and request for file fails with status code 404`,
        reports: [{ message: `Web app manifest file could not be fetched (status code: 404)` }],
        serverConfig: {
            '/': htmlWithManifestSpecified,
            '/site.webmanifest': { status: 404 }
        }
    },
    {
        name: `Web app manifest is specified and request for file fails with status code 500`,
        reports: [{ message: `Web app manifest file could not be fetched (status code: 500)` }],
        serverConfig: {
            '/': htmlWithManifestSpecified,
            '/site.webmanifest': { status: 500 }
        }
    }
];

ruleRunner.testRule('manifest-exists', tests);
