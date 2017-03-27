/* eslint sort-keys: 0, no-undefined: 0 */

import { Rule } from '../../../../lib/types'; // eslint-disable-line no-unused-vars
import { RuleTest } from '../../../helpers/rule-test-type'; // eslint-disable-line no-unused-vars

import * as ruleRunner from '../../../helpers/rule-runner';
import { createNetworkDataFromText, networkDataWithStatusCode200, networkDataWithStatusCode404, networkDataWithStatusCode500 } from '../../../helpers/network-data';
import * as rule from '../../../../lib/rules/manifest-exists/manifest-exists';

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
    <body>

    </body>
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

const htmlWithManifestSpecifiedMultipleTimes = createNetworkDataFromText(
`<!doctype html>
<html lang="en">
    <head>
        <title>test</title>
        <link rel="manifest" href="site1.webmanifest">
        <link rel="manifest" href="site2.webmanifest">
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

const tests: Array<RuleTest> = [
    {
        name: `Web app manifest is not specified`,
        events: [{
            name: 'element::link',
            networkData: [htmlWithManifestNotSpecified]
        }, {
            name: 'traverse::end',
            networkData: [htmlWithManifestNotSpecified]
        }],
        report: { message: 'Web app manifest not specified' }
    },
    {
        name: `Web app manifest is already specified`,
        events: [{
            name: 'element::link::0',
            networkData: [htmlWithManifestSpecifiedMultipleTimes, networkDataWithStatusCode200]
        }, {
            name: 'element::link::1',
            networkData: [htmlWithManifestSpecifiedMultipleTimes]
        },
        {
            name: 'traverse::end',
            networkData: [htmlWithManifestSpecifiedMultipleTimes]
        }],
        report: { message: 'Web app manifest already specified' }
    },
    {
        name: `Web app manifest is specified with no 'href'`,
        events: [{
            name: 'element::link',
            networkData: [htmlWithManifestSpecifiedWithNoHref]
        }],
        report: { message: `Web app manifest specified with invalid 'href'` }
    },
    {
        name: `Web app manifest is specified with empty 'href'`,
        events: [{
            name: 'element::link',
            networkData: [htmlWithManifestSpecifiedWithEmptyHref]
        }],
        report: { message: `Web app manifest specified with invalid 'href'` }
    },
    {
        name: `Web app manifest is specified as a full URL`,
        events: [{
            name: 'element::link',
            networkData: [htmlWithManifestSpecifiedAsFullURL, networkDataWithStatusCode200]
        }]
    },
    {
        name: `Web app manifest is specified and the file exists`,
        events: [{
            name: 'element::link',
            networkData: [htmlWithManifestSpecified, networkDataWithStatusCode200]
        }]
    },
    {
        name: `Web app manifest is specified and request for file fails`,
        events: [{
            name: 'element::link',
            networkData: [htmlWithManifestSpecified]
        }],
        report: { message: `Web app manifest file request failed` }
    },
    {
        name: `Web app manifest is specified and request for file fails with status code 404`,
        events: [{
            name: 'element::link',
            networkData: [htmlWithManifestSpecified, networkDataWithStatusCode404]
        }],
        report: { message: `Web app manifest file could not be fetched (status code: 404)` }
    },
    {
        name: `Web app manifest is specified and request for file fails with status code 500`,
        events: [{
            name: 'element::link',
            networkData: [htmlWithManifestSpecified, networkDataWithStatusCode500]
        }],
        report: { message: `Web app manifest file could not be fetched (status code: 500)` }
    }
];

ruleRunner.testRule(<Rule>rule, tests);
