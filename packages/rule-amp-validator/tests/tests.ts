/* eslint sort-keys: 0 */

import { RuleTest } from '@sonarwhal/utils-tests-helpers/dist/src/rule-test-type';
import readFile from 'sonarwhal/dist/src/lib/utils/fs/read-file';
import { getRulePath } from 'sonarwhal/dist/src/lib/utils/rule-helpers';
import * as ruleRunner from '@sonarwhal/utils-tests-helpers/dist/src/rule-runner';

const rulePath = getRulePath(__filename);

const validAMPHTML = readFile(`${__dirname}/fixtures/valid-amp.html`);
const invalidAMPHTML = readFile(`${__dirname}/fixtures/invalid-amp.html`);
const deprecateAMP = readFile(`${__dirname}/fixtures/deprecated-amp.html`);

const defaultTests: Array<RuleTest> = [
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
            { message: `The tag 'head > style[amp-boilerplate] - old variant' is deprecated - use 'head > style[amp-boilerplate]' instead. (https://github.com/ampproject/amphtml/blob/master/spec/amp-boilerplate.md)` },
            { message: `The tag 'noscript > style[amp-boilerplate] - old variant' is deprecated - use 'noscript > style[amp-boilerplate]' instead. (https://github.com/ampproject/amphtml/blob/master/spec/amp-boilerplate.md)` }
        ]
    },
    {
        name: `Error downloading HTML doesn't fail`,
        serverConfig: null
    }
];

const configuredTests: Array<RuleTest> = [{
    name: 'Deprecated AMP attribute passes if errorsOnly is true',
    serverConfig: deprecateAMP
}];

ruleRunner.testRule(rulePath, defaultTests);
ruleRunner.testRule(rulePath, configuredTests, { ruleOptions: { 'errors-only': true } });
