/* eslint sort-keys: 0, no-undefined: 0 */

import { generateHTMLPage } from '../../../helpers/misc';
import { getRuleName } from '../../../../src/lib/utils/rule-helpers';
import { RuleTest } from '../../../helpers/rule-test-type'; // eslint-disable-line no-unused-vars
import * as ruleRunner from '../../../helpers/rule-runner';

const ruleName = getRuleName(__dirname);

const htmlPageWithLessThan256bytes = generateHTMLPage(undefined,
       `&lt; 256 bytes
        สวัสดีค่ะ 你好 もしもし مرحبا 🐛`);

const htmlPageWithLessThan512bytes = generateHTMLPage(undefined,
       `<h1>This pages has over 256 bytes but less the 512 bytes</h1>
        <p>สวัสดีค่ะ 你好 もしもし مرحبا</p>
        <p>🐛🐛🐛🐛🐛</p>`);

const htmlPageWithMoreThan512bytes = generateHTMLPage(undefined,
       `<h1>This pages has more than 512 bytes</h1>
        <p>สวัสดีค่ะ 你好 もしもし مرحبا</p>
        <p>🐛🐛🐛🐛🐛🐛🐛🐛</p>
        <p>🐛🐛🐛🐛🐛🐛🐛🐛</p>
        <p>🐛🐛🐛🐛🐛🐛🐛🐛</p>
        <p>🐛🐛🐛🐛🐛🐛🐛🐛</p>
        <p>🐛🐛🐛🐛🐛🐛🐛🐛</p>
        <p>🐛🐛🐛🐛🐛🐛🐛🐛</p>
        <p>🐛🐛🐛🐛🐛🐛🐛🐛</p>`);

const statusCodesWith256Threshold = [403, 405, 410];
const statusCodesWith512Threshold = [400, 404, 406, 408, 409, 500, 501, 505];

const addTests = (t, statusCodes, threshold) => {
    statusCodes.forEach((statusCode) => {
        t.push({
            name: `Response has statusCode ${statusCode} and less than ${threshold} bytes`,
            reports: [{ message: `Response with statusCode ${statusCode} had less than ${threshold} bytes` }],
            serverConfig: {
                '/': {
                    content: (threshold === 512 ? htmlPageWithLessThan512bytes : htmlPageWithLessThan256bytes),
                    status: statusCode
                },
                '*': ''
            }
        });

        t.push({
            name: `Response has statusCode ${statusCode} and more than ${threshold} bytes`,
            serverConfig: {
                '/': {
                    content: htmlPageWithMoreThan512bytes,
                    statusCode
                },
                '*': ''
            }
        });
    });
};

const testsForWhenRuleDoesNotApply = [{
    name: `Response has statusCode 404 and less than 512 bytes, but targeted browsers don't include affected browsers`,
    serverConfig: {
        '/': {
            content: htmlPageWithLessThan512bytes,
            status: 400
        },
        '*': ''
    }
}];

const tests: Array<RuleTest> = [];

addTests(tests, statusCodesWith256Threshold, 256);
addTests(tests, statusCodesWith512Threshold, 512);

tests.push({
    name: `Response has statusCode 200 but 404 page has less than 512 bytes`,
    reports: [{ message: `Response with statusCode 404 had less than 512 bytes` }],
    serverConfig: {
        '/': '',
        '*': {
            content: htmlPageWithLessThan512bytes,
            status: 404
        }
    }
});

ruleRunner.testRule(ruleName, tests, {
    browserslist: [
        'ie 6-11',
        'last 2 versions'
    ]
});
ruleRunner.testRule(ruleName, testsForWhenRuleDoesNotApply, { browserslist: ['Edge 15'] });
