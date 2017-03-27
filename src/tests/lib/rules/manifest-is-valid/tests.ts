/* eslint sort-keys: 0, no-undefined: 0 */

import { Rule } from '../../../../lib/types'; // eslint-disable-line no-unused-vars
import { RuleTest } from '../../../helpers/rule-test-type'; // eslint-disable-line no-unused-vars
import { createNetworkDataFromText, networkDataWithStatusCode404 } from '../../../helpers/network-data';

import * as ruleRunner from '../../../helpers/rule-runner';
import * as rule from '../../../../lib/rules/manifest-is-valid/manifest-is-valid';

const htmlWithManifestNotSpecified = createNetworkDataFromText(
`<!doctype html>
<html lang="en">
    <head>
        <title>test</title>
        <link rel="stylesheet" href="style.css">
    </head>
    <body></body>
</html>`);

const htmlWithManifestSpecified = createNetworkDataFromText(
`<!doctype html>
<html lang="en">
    <head>
        <title>test</title>
        <link rel="manifest" href="site.webmanifest">
    </head>
    <body></body>
</html>`);

const htmlWithManifestSpecifiedAsFullURL = createNetworkDataFromText(
`<!doctype html>
<html lang="en">
    <head>
        <title>test</title>
        <link rel="manifest" href="https://example.com/site.webmanifest">
    </head>
    <body></body>
</html>`);

const htmlWithManifestSpecifiedWithEmptyHref = createNetworkDataFromText(
`<!doctype html>
<html lang="en">
    <head>
        <title>test</title>
        <link rel="manifest" href="">
    </head>
    <body></body>
</html>`);

const htmlWithManifestSpecifiedWithNoHref = createNetworkDataFromText(
`<!doctype html>
<html lang="en">
    <head>
        <title>test</title>
        <link rel="manifest">
    </head>
    <body></body>
</html>`);

const invalidManifest = createNetworkDataFromText('x', 'https://example.com/site.webmanifest');
const validManifest = createNetworkDataFromText('{}', 'https://example.com/site.webmanifest');

const tests: Array<RuleTest> = [
    {
        name: `Web app manifest is not specified`,
        events: [{
            name: 'element::link',
            networkData: [htmlWithManifestNotSpecified]
        }]
    },
    {
        name: `Web app manifest is specified with no 'href'`,
        events: [{
            name: 'element::link',
            networkData: [htmlWithManifestSpecifiedWithNoHref]
        }]
    },
    {
        name: `Web app manifest is specified with empty 'href'`,
        events: [{
            name: 'element::link',
            networkData: [htmlWithManifestSpecifiedWithEmptyHref]
        }]
    },
    {
        name: `Web app manifest is specified and its content is valid JSON`,
        events: [{
            name: 'element::link',
            networkData: [htmlWithManifestSpecified, validManifest]
        }]
    },
    {
        name: `Web app manifest is specified and its content is not valid JSON`,
        events: [{
            name: 'element::link',
            networkData: [htmlWithManifestSpecified, invalidManifest]
        }],
        report: { message: `Web app manifest file doesn't contain valid JSON` }
    },
    {
        name: `Web app manifest is specified as a full URL and its content is valid JSON`,
        events: [{
            name: 'element::link',
            networkData: [htmlWithManifestSpecifiedAsFullURL, validManifest]
        }]
    },
    {
        name: `Web app manifest is specified and request for file fails`,
        events: [{
            name: 'element::link',
            networkData: [htmlWithManifestSpecified]
        }]
    },
    {
        name: `Web app manifest is specified and request for file fails with status code`,
        events: [{
            name: 'element::link',
            networkData: [htmlWithManifestSpecified, networkDataWithStatusCode404]
        }]
    }
];

ruleRunner.testRule(<Rule>rule, tests);
