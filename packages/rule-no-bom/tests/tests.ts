import * as fs from 'fs';

import * as mock from 'mock-require';

import { getRulePath } from 'sonarwhal/dist/src/lib/utils/rule-helpers';
import { RuleTest } from 'sonarwhal/dist/tests/helpers/rule-test-type';
import * as ruleRunner from 'sonarwhal/dist/tests/helpers/rule-runner';
import { generateHTMLPage } from 'sonarwhal/dist/tests/helpers/misc';

// We need to use `require` to be able to overwrite the method `asyncTry`.
const asyncWrapper = require('sonarwhal/dist/src/lib/utils/async-wrapper');
const originalAsyncTry = asyncWrapper.asyncTry;


const ruleName = getRulePath(__filename);
const bom = fs.readFileSync(`${__dirname}/fixtures/bom.html`); // eslint-disable-line no-sync
const noBom = fs.readFileSync(`${__dirname}/fixtures/no-bom.html`); // eslint-disable-line no-sync

const tests: Array<RuleTest> = [
    {
        name: 'HTML with no BOM should pass',
        serverConfig: {
            '/': {
                content: noBom,
                headers: { 'Content-Type': 'text/html' }
            }
        }
    },
    {
        name: `HTML with BOM should fail`,
        reports: [{ message: `Text based resources shouldn't start with the BOM character to force UTF-8 encoding` }],
        serverConfig: {
            '/': {
                content: bom,
                headers: { 'Content-Type': 'text/html' }
            }
        }
    },
    {
        after() {
            asyncWrapper.asyncTry = originalAsyncTry;
        },
        before() {
            asyncWrapper.asyncTry = function (fetch) {
                return (target) => {
                    if (!target.includes('styles.css')) {
                        return fetch(target);
                    }

                    return null;
                };
            };

            mock('sonarwhal/dist/src/lib/utils/async-wrapper', asyncWrapper);
        },
        name: `If a request throws and exception, it should be managed and report an error`,
        reports: [{ message: 'Error fetching the content' }],
        serverConfig: {
            '/': generateHTMLPage('<link rel="stylesheet" href="/styles.css">'),
            '/styles.css': { content: '' }
        }
    }
];

ruleRunner.testRule(ruleName, tests, { serial: true });
