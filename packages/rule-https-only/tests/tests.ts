import generateHTMLPage from 'hint/dist/src/lib/utils/misc/generate-html-page';
import { RuleTest } from '@hint/utils-tests-helpers/dist/src/rule-test-type';
import { getRulePath } from 'hint/dist/src/lib/utils/rule-helpers';
import * as ruleRunner from '@hint/utils-tests-helpers/dist/src/rule-runner';

const rulePath = getRulePath(__filename);

const testsNoHTTPS: Array<RuleTest> = [
    {
        name: `HTML page serverd using HTTP`,
        reports: [{ message: 'The site should be HTTPS' }],
        serverConfig: generateHTMLPage()
    }
];

ruleRunner.testRule(rulePath, testsNoHTTPS);
