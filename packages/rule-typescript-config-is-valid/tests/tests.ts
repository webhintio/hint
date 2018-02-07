import { generateHTMLPage } from 'sonarwhal/dist/tests/helpers/misc';
import { getRuleName } from 'sonarwhal/dist/src/lib/utils/rule-helpers';
import { RuleTest } from 'sonarwhal/dist/tests/helpers/rule-test-type';
import * as ruleRunner from 'sonarwhal/dist/tests/helpers/rule-runner';
const ruleName = getRuleName(__dirname);

/*
 * You should test for cases where the rule passes and doesn't.
 * More information about how `ruleRunner` can be configured is
 * available in:
 * https://sonarwhal.com/docs/contributor-guide/rules/#howtotestarule
 */
const tests: Array<any> = [
    {
        files: ['valid/tsconfig.json'],
        name: 'Valid configuration should pass',
    },
    {
        files: ['noconfig.json'],
        name: `If there is no config files, it should fail`,
        reports: [{ message: `This should be your error message` }],
        serverConfig: generateHTMLPage()
    }
];

ruleRunner.testRule(ruleName, tests);
