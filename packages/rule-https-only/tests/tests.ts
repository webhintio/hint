import { generateHTMLPage } from 'sonarwhal/dist/src/lib/utils/misc';
import { RuleTest } from '@sonarwhal/utils-tests-helpers/dist/src/rule-test-type';
import { getRulePath } from 'sonarwhal/dist/src/lib/utils/rule-helpers';
import * as ruleRunner from '@sonarwhal/utils-tests-helpers/dist/src/rule-runner';

const rulePath = getRulePath(__filename);

const testsNoHTTPS: Array<RuleTest> = [
    {
        name: `HTML page serverd using HTTP`,
        reports: [{ message: 'The site should be HTTPS' }],
        serverConfig: generateHTMLPage()
    }
];

ruleRunner.testRule(rulePath, testsNoHTTPS);
