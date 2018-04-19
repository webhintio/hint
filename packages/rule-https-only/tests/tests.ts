import { generateHTMLPage } from 'sonarwhal/dist/tests/helpers/misc';
import { RuleTest } from 'sonarwhal/dist/tests/helpers/rule-test-type';
import { getRuleName } from 'sonarwhal/dist/src/lib/utils/rule-helpers';
import * as ruleRunner from 'sonarwhal/dist/tests/helpers/rule-runner';

const ruleName = getRuleName(__dirname);

const testsNoHTTPS: Array<RuleTest> = [
    {
        name: `HTML page serverd using HTTP`,
        reports: [{ message: 'The site should be HTTPS' }],
        serverConfig: generateHTMLPage()
    }
];

ruleRunner.testRule(ruleName, testsNoHTTPS);
