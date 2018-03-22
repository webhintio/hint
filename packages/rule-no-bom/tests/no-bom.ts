import * as fs from 'fs';

import { getRuleName } from 'sonarwhal/dist/src/lib/utils/rule-helpers';
import { RuleTest } from 'sonarwhal/dist/tests/helpers/rule-test-type';
import * as ruleRunner from 'sonarwhal/dist/tests/helpers/rule-runner';

const ruleName = getRuleName(__dirname);
const bom = fs.readFileSync(`${__dirname}/fixtures/bom.html`); // eslint-disable-line no-sync
const noBom = fs.readFileSync(`${__dirname}/fixtures/no-bom.html`); // eslint-disable-line no-sync

/*
 * You should test for cases where the rule passes and doesn't.
 * More information about how `ruleRunner` can be configured is
 * available in:
 * https://sonarwhal.com/docs/contributor-guide/rules/#howtotestarule
 */
const tests: Array<RuleTest> = [
    {
        name: 'HTML with no BOM should pass',
        serverConfig: {
            '/': {
                content: noBom,
                headers: { 'Content-Type': 'text/html' }
            }
        }
    },
    {
        name: `HTML with BOM should fail`,
        reports: [{ message: `Text based files shouldn't start with the BOM character to force UTF-8 encoding` }],
        serverConfig: {
            '/': {
                content: bom,
                headers: { 'Content-Type': 'text/html' }
            }
        }
    }
];

ruleRunner.testRule(ruleName, tests);
