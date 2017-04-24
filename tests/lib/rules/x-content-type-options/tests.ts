import { RuleTest } from '../../../helpers/rule-test-type'; // eslint-disable-line no-unused-vars
import * as ruleRunner from '../../../helpers/rule-runner';
import { getRuleName } from '../../../../src/lib/utils/rule-helpers';

const ruleName = getRuleName(__dirname);

const htmlPage =
`<!doctype html>
 <html lang="en">
    <head>
        <title>test</title>
    </head>
    <body>
        <script src="test.js"></script>
    </body>
</html>`;

const tests: Array<RuleTest> = [
    {
        name: `Resources are served with the 'X-Content-Type-Options' HTTP response header`,
        serverConfig: {
            '/': {
                content: htmlPage,
                headers: { 'X-Content-Type-Options': 'nosniff' }
            },
            '/test.js': { headers: { 'X-Content-Type-Options': 'NoSniff' } }
        }
    },
    {
        name: `Resources are served without the 'X-Content-Type-Options' HTTP response header`,
        reports: [
            { message: `Resource served without the 'X-Content-Type-Options' HTTP response header` },
            { message: `Resource served without the 'X-Content-Type-Options' HTTP response header` }
        ],
        serverConfig: {
            '/': htmlPage,
            '/test.js': ''
        }
    },
    {
        name: `Resources are served with invalid value for the 'X-Content-Type-Options' HTTP response header`,
        reports: [
            { message: `Resource served with invalid value ('test1') for the 'X-Content-Type-Options' HTTP response header` },
            { message: `Resource served with invalid value ('test2') for the 'X-Content-Type-Options' HTTP response header` }
        ],
        serverConfig: {
            '/': {
                content: htmlPage,
                headers: { 'X-Content-Type-Options': 'test1' }
            },
            '/test.js': { headers: { 'X-Content-Type-Options': 'test2' } }
        }
    }
];

ruleRunner.testRule(ruleName, tests);
