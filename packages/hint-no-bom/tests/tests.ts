import * as fs from 'fs';

import * as mock from 'mock-require';

import * as utils from '@hint/utils';
import { HintTest, testHint } from '@hint/utils-tests-helpers';

const { generateHTMLPage, getHintPath } = utils.test;
const originalAsyncTry = utils.asyncTry;

const hintPath = getHintPath(__filename);
const bom = fs.readFileSync(`${__dirname}/fixtures/bom.html`); // eslint-disable-line no-sync
const noBom = fs.readFileSync(`${__dirname}/fixtures/no-bom.html`); // eslint-disable-line no-sync

const tests: HintTest[] = [
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
            // using `as any` because if not, asyncTry is read-only
            (utils as any).asyncTry = originalAsyncTry;
        },
        before() {
            (utils as any).asyncTry = function (fetch: (target: string) => Promise<any>) {
                return (target: string) => {
                    if (!target.includes('styles.css')) {
                        return fetch(target);
                    }

                    return null;
                };
            };

            mock('@hint/utils', utils);
        },
        name: `If a request throws and exception, it should be managed and report an error`,
        reports: [{ message: 'Content could not be fetched.' }],
        serverConfig: {
            '/': generateHTMLPage('<link rel="stylesheet" href="/styles.css">'),
            '/styles.css': { content: '' }
        }
    }
];

testHint(hintPath, tests, { serial: true });
