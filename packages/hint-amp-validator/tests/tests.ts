/* eslint sort-keys: 0 */

import { HintTest } from '@hint/utils-tests-helpers/dist/src/hint-test-type';
import readFile from 'hint/dist/src/lib/utils/fs/read-file';
import { getHintPath } from 'hint/dist/src/lib/utils/hint-helpers';
import * as hintRunner from '@hint/utils-tests-helpers/dist/src/hint-runner';

const hintPath = getHintPath(__filename);

const validAMPHTML = readFile(`${__dirname}/fixtures/valid-amp.html`);
const invalidAMPHTML = readFile(`${__dirname}/fixtures/invalid-amp.html`);

const defaultTests: HintTest[] = [
    {
        name: 'Valid AMP HTML passes',
        serverConfig: validAMPHTML
    },
    {
        name: `Resource is not an HTML document`,
        serverConfig: { '/': { headers: { 'Content-Type': 'image/png' } } }
    },
    {
        name: 'Invalid AMP HTML fails',
        serverConfig: invalidAMPHTML,
        reports: [
            {
                message: `The mandatory attribute '⚡' is missing in tag 'html'. (https://www.ampproject.org/docs/reference/spec#required-markup)`,
                position: {
                    column: 0,
                    line: 2
                }
            }
        ]
    },
    {
        name: `Error downloading HTML doesn't fail`,
        serverConfig: null
    }
];

hintRunner.testHint(hintPath, defaultTests);
