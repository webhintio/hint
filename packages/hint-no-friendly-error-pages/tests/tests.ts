/* eslint sort-keys: 0 */

import generateHTMLPage from 'hint/dist/src/lib/utils/misc/generate-html-page';
import { getHintPath } from 'hint/dist/src/lib/utils/hint-helpers';
import { HintTest } from '@hint/utils-tests-helpers/dist/src/hint-test-type';
import * as hintRunner from '@hint/utils-tests-helpers/dist/src/hint-runner';

const hintPath = getHintPath(__filename);

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

const generateErrorMessage = (statusCode: number, threshold: number) => {
    return `Response with status code ${statusCode} should have more than ${threshold} bytes.`;
};

const addTests = (t, statusCodes, threshold) => {
    statusCodes.forEach((statusCode) => {
        t.push({
            name: `Response has status code ${statusCode} and less than ${threshold} bytes`,
            reports: [{ message: generateErrorMessage(statusCode, threshold) }],
            serverConfig: {
                '/': {
                    content: (threshold === 512 ? htmlPageWithLessThan512bytes : htmlPageWithLessThan256bytes),
                    status: statusCode
                },
                '*': ''
            }
        });

        t.push({
            name: `Response has status code ${statusCode} and more than ${threshold} bytes`,
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

const testsForWhenHintDoesNotApply = [{
    name: `Response has status code 404 and less than 512 bytes, but targeted browsers don't include affected browsers`,
    serverConfig: {
        '/': {
            content: htmlPageWithLessThan512bytes,
            status: 400
        },
        '*': ''
    }
}];

const tests: Array<HintTest> = [];

addTests(tests, statusCodesWith256Threshold, 256);
addTests(tests, statusCodesWith512Threshold, 512);

tests.push(
    {
        name: `Response has status code 200 and 404 page was generated and has less than 512 bytes`,
        reports: [{ message: generateErrorMessage(404, 512) }],
        serverConfig: {
            '/': '',
            '*': {
                content: htmlPageWithLessThan512bytes,
                status: 404
            }
        }
    },
    {
        name: `Response has status code 200 and error page cannot be generated`,
        serverConfig: {
            '/': '',
            '/favicon.ico': {
                status: 200,
                headers: {
                    'Content-Length': '0',
                    'Content-Type': 'image/x-icon',
                    'X-Content-Type-Options': 'nosniff'
                }
            },
            '*': { status: 200 }
        }
    },
    {
        name: `Response has status code 200 and error page cannot be generated (request fails)`,
        serverConfig: {
            '/': '',
            '/favicon.ico': {
                status: 200,
                headers: {
                    'Content-Length': '0',
                    'Content-Type': 'image/x-icon',
                    'X-Content-Type-Options': 'nosniff'
                }
            },
            '*': null
        }
    },
    {
        name: `Response has status code 200, contains resource specified as a data URI, and error page cannot be generated`,
        serverConfig: {
            '/': generateHTMLPage(undefined, '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==">'),
            '*': { status: 200 }
        }
    }
);

hintRunner.testHint(hintPath, tests, {
    browserslist: [
        'ie 6-11',
        'last 2 versions'
    ]
});
hintRunner.testHint(hintPath, testsForWhenHintDoesNotApply, { browserslist: ['Edge 15'] });
