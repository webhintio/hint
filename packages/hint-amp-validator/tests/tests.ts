/* eslint sort-keys: 0 */

import { HintTest } from '@hint/utils-tests-helpers/dist/src/hint-test-type';
import readFile from 'hint/dist/src/lib/utils/fs/read-file';
import { getHintPath } from 'hint/dist/src/lib/utils/hint-helpers';
import * as hintRunner from '@hint/utils-tests-helpers/dist/src/hint-runner';

const hintPath = getHintPath(__filename);

const validAMPHTML = readFile(`${__dirname}/fixtures/valid-amp.html`);
const invalidAMPHTML = readFile(`${__dirname}/fixtures/invalid-amp.html`);
const deprecateAMP = readFile(`${__dirname}/fixtures/deprecated-amp.html`);

const defaultTests: Array<HintTest> = [
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
        reports: [{ message: `The mandatory attribute '⚡' is missing in tag 'html ⚡ for top-level html'. (https://www.ampproject.org/docs/reference/spec#required-markup)` }]
    },
    {
        name: 'Deprecated AMP attribute fails',
        serverConfig: deprecateAMP,
        reports: [
            { message: `The tag 'noscript > style[amp-boilerplate] - old variant' is deprecated - use 'noscript > style[amp-boilerplate]' instead. (https://github.com/ampproject/amphtml/blob/master/spec/amp-boilerplate.md)` }
        ]
    },
    {
        name: `Error downloading HTML doesn't fail`,
        serverConfig: null
    }
];

const configuredTests: Array<HintTest> = [{
    name: 'Deprecated AMP attribute passes if errorsOnly is true',
    serverConfig: deprecateAMP
}];

hintRunner.testHint(hintPath, defaultTests);
hintRunner.testHint(hintPath, configuredTests, { hintOptions: { 'errors-only': true } });
