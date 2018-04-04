/* eslint sort-keys: 0, no-undefined: 0 */

import { generateHTMLPage } from 'sonarwhal/dist/tests/helpers/misc';
import { getRuleName } from 'sonarwhal/dist/src/lib/utils/rule-helpers';
import { RuleTest } from 'sonarwhal/dist/tests/helpers/rule-test-type';
import * as ruleRunner from 'sonarwhal/dist/tests/helpers/rule-runner';

const tests: Array<RuleTest> = [
    {
        name: `Web app manifest file is not specified, so the rule does not apply and the test should pass`,
        serverConfig: generateHTMLPage('<link rel="stylesheet" href="style.css">')
    },
    {
        name: `Web app manifest file has incorrect file extension`,
        reports: [{ message: `The file extension should be 'webmanifest' (not 'json')` }],
        serverConfig: generateHTMLPage(`<link rel="manifest" href="site.json">
        <link rel="stylesheet" href="style.css">`)
    },
    {
        name: `Web app manifest file is specified only as '.webmanifest'`,
        reports: [{ message: `The file extension should be 'webmanifest'` }],
        serverConfig: generateHTMLPage(`<link rel="manifest" href=".webmanifest">
        <link rel="stylesheet" href="style.css">`)
    },
    {
        name: `Web app manifest file has correct file extension`,
        serverConfig: generateHTMLPage(`<link rel="manifest" href="site.webmanifest">
        <link rel="stylesheet" href="style.css">`)
    },
    {
        name: `Web app manifest file has correct file extension being specified in a path that contains '.'`,
        serverConfig: generateHTMLPage(`<link rel="manifest" href="/.well-known/site.webmanifest">
        <link rel="stylesheet" href="style.css">`)
    }
];

ruleRunner.testRule(getRuleName(__dirname), tests, { parsers: ['manifest'] });
