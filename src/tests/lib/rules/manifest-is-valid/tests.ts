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
        name: `Web app manifest is specified and its content is valid JSON`,
        serverConfig: {
            '/': htmlWithManifestSpecified,
            '/site.webmanifest': '{}'
        }
    },
    {
        name: `Web app manifest is specified and its content is not valid JSON`,
        serverConfig: {
            '/': htmlWithManifestSpecified,
            '/site.webmanifest': 'x'
        },
        reports: [{ message: `Web app manifest file doesn't contain valid JSON` }]
    }
];

ruleRunner.testRule('manifest-is-valid', tests);
