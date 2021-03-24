import * as fs from 'fs';

import { Severity } from '@hint/utils-types';
import { generateHTMLPage } from '@hint/utils-create-server';
import { getHintPath, HintTest, testHint } from '@hint/utils-tests-helpers';

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
        reports: [{
            message: `Text-based resource should not start with BOM character.`,
            severity: Severity.warning
        }],
        serverConfig: {
            '/': {
                content: bom,
                headers: { 'Content-Type': 'text/html' }
            }
        }
    },
    {
        name: `If a request throws and exception, it should be managed and report an error`,
        overrides: {
            '@hint/utils': {
                asyncTry(fetch: (target: string) => Promise<any>) {
                    return (target: string) => {
                        if (!target.includes('styles.css')) {
                            return fetch(target);
                        }

                        return null;
                    };
                }
            }
        },
        reports: [{
            message: 'Content could not be fetched.',
            severity: Severity.error
        }],
        serverConfig: {
            '/': generateHTMLPage('<link rel="stylesheet" href="/styles.css">'),
            '/styles.css': { content: '' }
        }
    }
];

testHint(hintPath, tests, { serial: true });
