import { generateHTMLPage } from 'sonarwhal/dist/tests/helpers/misc';
import { getRuleName } from 'sonarwhal/dist/src/lib/utils/rule-helpers';
import { readFile } from 'sonarwhal/dist/src/lib/utils/misc';
import { RuleTest } from 'sonarwhal/dist/tests/helpers/rule-test-type';
import * as ruleRunner from 'sonarwhal/dist/tests/helpers/rule-runner';

const ruleName = getRuleName(__dirname);

const styles = readFile(`${__dirname}/fixtures/styles.css`);

const defaultTestsHttp: Array<RuleTest> = [
    {
        name: `Page with a same-origin resource and SRI sha384 fails if content is delivered via http`,
        reports: [{ message: 'The resource is not delivered via a secure context' }],
        serverConfig: {
            '/': generateHTMLPage('<link rel="stylesheet" href="/styles.css" integrity="sha384-5YxmVGC5j04J1+MIPUDtqFa/SGXzua7jY1f563CdmtCQAESgM0+KazhGqzlOxNoQ">'),
            '/styles.css': styles
        }
    }
];

ruleRunner.testRule(ruleName, defaultTestsHttp);
