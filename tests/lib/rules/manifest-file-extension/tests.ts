/* eslint sort-keys: 0, no-undefined: 0 */

import { generateHTMLPage } from '../../../helpers/misc';
import { getRuleName } from '../../../../src/lib/utils/rule-helpers';
import { IRuleTest } from '../../../helpers/rule-test-type';
import * as ruleRunner from '../../../helpers/rule-runner';

const tests: Array<IRuleTest> = [
    {
        name: `Manifest file is not specified, so the rule does not apply and the test should pass`,
        serverConfig: generateHTMLPage('<link rel="stylesheet" href="style.css">')
    },
    {
        name: `Manifest file has incorrect file extension`,
        reports: [{
            message: `The file extension should be '.webmanifest' (not '.json')`,
            position: { column: 41, line: 2 }
        }],
        serverConfig: generateHTMLPage(`<link rel="manifest" href="site.json">
        <link rel="stylesheet" href="style.css">`)
    },
    {
        name: `Manifest file has correct file extension`,
        serverConfig: generateHTMLPage(`<link rel="manifest" href="site.webmanifest">
        <link rel="stylesheet" href="style.css">`)
    }
];

ruleRunner.testRule(getRuleName(__dirname), tests);
