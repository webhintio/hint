import { generateHTMLPage } from '../../../helpers/misc';
import { getRuleName } from '../../../../src/lib/utils/rule-helpers';
import { IRuleTest } from '../../../helpers/rule-test-type';
import * as ruleRunner from '../../../helpers/rule-runner';
const ruleName = getRuleName(__dirname);

/*
 * You should test for cases where the rule passes and doesn't.
 * More information about how `ruleRunner` can be configured is
 * available in:
 * https://sonarwhal.com/docs/contributor-guide/rules/#howtotestarule
 */
const tests: Array<IRuleTest> = [
    {
        name: 'This test should pass',
        serverConfig: generateHTMLPage()
    },
    {
        name: `This test should fail`,
        reports: [{ message: `This should be your error message` }],
        serverConfig: generateHTMLPage()
    }
];

ruleRunner.testRule(ruleName, tests);
