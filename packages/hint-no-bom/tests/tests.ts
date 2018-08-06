import * as fs from 'fs';

import * as mock from 'mock-require';

import { getHintPath } from 'hint/dist/src/lib/utils/hint-helpers';
import { HintTest } from '@hint/utils-tests-helpers/dist/src/hint-test-type';
import * as hintRunner from '@hint/utils-tests-helpers/dist/src/hint-runner';
import generateHTMLPage from 'hint/dist/src/lib/utils/misc/generate-html-page';

// We need to use `require` to be able to overwrite the method `asyncTry`.
const asyncWrapper = require('hint/dist/src/lib/utils/async-wrapper');
const originalAsyncTry = asyncWrapper.asyncTry;

const hintPath = getHintPath(__filename);
const bom = fs.readFileSync(`${__dirname}/fixtures/bom.html`); // eslint-disable-line no-sync
const noBom = fs.readFileSync(`${__dirname}/fixtures/no-bom.html`); // eslint-disable-line no-sync

const tests: Array<HintTest> = [
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
        reports: [{ message: `Text-based resource should not start with BOM character.` }],
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

            mock('hint/dist/src/lib/utils/async-wrapper', asyncWrapper);
        },
        name: `If a request throws and exception, it should be managed and report an error`,
        reports: [{ message: 'Content could not be fetched.' }],
        serverConfig: {
            '/': generateHTMLPage('<link rel="stylesheet" href="/styles.css">'),
            '/styles.css': { content: '' }
        }
    }
];

hintRunner.testHint(hintPath, tests, { serial: true });
