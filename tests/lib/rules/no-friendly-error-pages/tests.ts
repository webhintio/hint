/* eslint sort-keys: 0, no-undefined: 0 */

import { RuleTest } from '../../../helpers/rule-test-type'; // eslint-disable-line no-unused-vars
import * as ruleRunner from '../../../helpers/rule-runner';
import { getRuleName } from '../../../../src/lib/util/rule-helpers';

const htmlPageWithLessThan256bytes =
`<!doctype html>
<html lang="en">
    <head>
        <title>title</title>
    </head>
    <body>
        &lt; 256 bytes
        สวัสดีค่ะ 你好 もしもし مرحبا 🐛
    </body>
</html>`;

const htmlPageWithLessThan512bytes =
`<!doctype html>
<html lang="en">
    <head>
        <title>test</title>
    </head>
    <body>
        <h1>This pages has over 256 bytes but less the 512 bytes</h1>
        <p>สวัสดีค่ะ 你好 もしもし مرحبا</p>
        <p>🐛🐛🐛🐛🐛</p>
    </body>
</html>`;

const htmlPageWithMoreThan512bytes =
`<!doctype html>
<html lang="en">
    <head>
        <title>test</title>
    </head>
    <body>
        <h1>This pages has more than 512 bytes</h1>
        <p>สวัสดีค่ะ 你好 もしもし مرحبا</p>
        <p>🐛🐛🐛🐛🐛🐛🐛🐛</p>
        <p>🐛🐛🐛🐛🐛🐛🐛🐛</p>
        <p>🐛🐛🐛🐛🐛🐛🐛🐛</p>
        <p>🐛🐛🐛🐛🐛🐛🐛🐛</p>
        <p>🐛🐛🐛🐛🐛🐛🐛🐛</p>
        <p>🐛🐛🐛🐛🐛🐛🐛🐛</p>
        <p>🐛🐛🐛🐛🐛🐛🐛🐛</p>
    </body>
</html>`;

const tests: Array<RuleTest> = [];

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

addTests(tests, statusCodesWith256Threshold, 256);
addTests(tests, statusCodesWith512Threshold, 512);

ruleRunner.testRule(getRuleName(__dirname), tests);
