/* eslint sort-keys: 0, no-undefined: 0 */

import generateHTMLPage from 'hint/dist/src/lib/utils/misc/generate-html-page';
import { getRulePath } from 'hint/dist/src/lib/utils/rule-helpers';
import { RuleTest } from '@hint/utils-tests-helpers/dist/src/rule-test-type';
import * as ruleRunner from '@hint/utils-tests-helpers/dist/src/rule-runner';

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
    },
    {
        name: `Resource is not an HTML document`,
        serverConfig: { '/': { headers: { 'Content-Type': 'image/png' } } }
    }
];

ruleRunner.testRule(getRulePath(__filename), tests, { parsers: ['manifest'] });
