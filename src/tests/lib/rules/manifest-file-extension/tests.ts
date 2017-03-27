/* eslint sort-keys: 0, no-undefined: 0 */

import { Rule } from '../../../../lib/types'; // eslint-disable-line no-unused-vars
import { RuleTest } from '../../../helpers/rule-test-type'; // eslint-disable-line no-unused-vars
import { createNetworkDataFromText } from '../../../helpers/network-data';

import * as ruleRunner from '../../../helpers/rule-runner';
import * as rule from '../../../../lib/rules/manifest-file-extension/manifest-file-extension';

const htmlWithManifestWithCorrectExtension = createNetworkDataFromText(
`<!doctype html>
<html lang="en">
    <head>
        <title>test</title>
        <link rel="manifest" href="site.webmanifest">
        <link rel="stylesheet" href="style.css">
    </head>
    <body></body>
</html>`);

const htmlWithManifestWithIncorrectExtension = createNetworkDataFromText(
`<!doctype html>
<html lang="en">
    <head>
        <title>test</title>
        <link rel="manifest" href="site.json">
        <link rel="stylesheet" href="style.css">
    </head>
    <body></body>
</html>`);

const htmlWithNoManifest = createNetworkDataFromText(
`<!doctype html>
<html lang="en">
    <head>
        <title>test</title>
        <link rel="stylesheet" href="style.css">
    </head>
    <body></body>
</html>`);

const tests: Array<RuleTest> = [
    {
        name: `Web app manifest file is not specified`,
        events: [{
            name: 'element::link',
            networkData: [htmlWithNoManifest]
        }]
    },
    {
        name: `Web app manifest file has incorrect file extension`,
        events: [{
            name: 'element::link',
            networkData: [htmlWithManifestWithIncorrectExtension]
        }],
        report: {
            message: `The file extension for the web app manifest file ('site.json') should be '.webmanifest' not '.json'`,
            position: { column: 32, line: 3 }
        }
    },
    {
        name: `Web app manifest file has correct file extension`,
        events: [{
            name: 'element::link',
            networkData: [htmlWithManifestWithCorrectExtension]
        }]
    }
];

ruleRunner.testRule(<Rule>rule, tests);
