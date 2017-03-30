/* eslint sort-keys: 0, no-undefined: 0 */

import { Rule } from '../../../../lib/types'; // eslint-disable-line no-unused-vars
import { RuleTest } from '../../../helpers/rule-test-type'; // eslint-disable-line no-unused-vars

import * as ruleRunner from '../../../helpers/rule-runner';

const tests: Array<RuleTest> = [
    {
        name: `Web app manifest file is not specified`,
        serverConfig: `<!doctype html><html lang="en"><head>
        <title>test</title>
        <link rel="stylesheet" href="style.css">
    </head>
    <body></body>
</html>`
    },
    {
        name: `Web app manifest file has incorrect file extension`,
        serverConfig: `<!doctype html><html lang="en"><head>
        <title>test</title>
        <link rel="manifest" href="site.json">
        <link rel="stylesheet" href="style.css">
    </head>
    <body></body>
</html>`,
        reports: [{
            message: `The file extension for the web app manifest file ('site.json') should be '.webmanifest' not '.json'`,
            position: { column: 40, line: 3 }
        }]
    },
    {
        name: `Web app manifest file has correct file extension`,
        serverConfig: `<!doctype html><html lang="en"><head>
        <title>test</title>
        <link rel="manifest" href="site.webmanifest">
        <link rel="stylesheet" href="style.css">
    </head>
    <body></body>
</html>`
    }
];

ruleRunner.testRule('manifest-file-extension', tests);
