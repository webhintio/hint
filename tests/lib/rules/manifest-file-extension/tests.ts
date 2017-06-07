/* eslint sort-keys: 0, no-undefined: 0 */

import { generateHTMLPage } from '../../../helpers/misc';
import { getRuleName } from '../../../../src/lib/utils/rule-helpers';
import { RuleTest } from '../../../helpers/rule-test-type'; // eslint-disable-line no-unused-vars
import * as ruleRunner from '../../../helpers/rule-runner';

const tests: Array<RuleTest> = [
    {
        name: `Web app manifest file is not specified`,
        serverConfig: generateHTMLPage('<link rel="stylesheet" href="style.css">')
    },
    {
        name: `Web app manifest file has incorrect file extension`,
        reports: [{
            message: `The file extension for the web app manifest file ('site.json') should be '.webmanifest' not '.json'`,
            position: { column: 41, line: 2 }
        }],
        serverConfig: generateHTMLPage(`<link rel="manifest" href="site.json">
        <link rel="stylesheet" href="style.css">`)
    },
    {
        name: `Web app manifest file has correct file extension`,
        serverConfig: generateHTMLPage(`<link rel="manifest" href="site.webmanifest">
        <link rel="stylesheet" href="style.css">`)
    }
];

ruleRunner.testRule(getRuleName(__dirname), tests);
