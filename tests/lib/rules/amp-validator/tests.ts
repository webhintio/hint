/* eslint sort-keys: 0, no-undefined: 0 */

import { IRuleTest } from '../../../helpers/rule-test-type'; // eslint-disable-line no-unused-vars
import { readFile } from '../../../../src/lib/utils/misc';
import { getRuleName } from '../../../../src/lib/utils/rule-helpers';
import * as ruleRunner from '../../../helpers/rule-runner';

const ruleName = getRuleName(__dirname);

const validAMPHTML = readFile(`${__dirname}/fixtures/valid-amp.html`);
const invalidAMPHTML = readFile(`${__dirname}/fixtures/invalid-amp.html`);
const deprecateAMP = readFile(`${__dirname}/fixtures/deprecated-amp.html`);

const defaultTests: Array<IRuleTest> = [
    {
        name: 'Valid AMP HTML passes',
        serverConfig: validAMPHTML
    },
    {
        name: 'Invalid AMP HTML fails',
        serverConfig: invalidAMPHTML,
        reports: [
            { message: `The mandatory attribute '⚡' is missing in tag 'html ⚡ for top-level html'. (https://www.ampproject.org/docs/reference/spec#required-markup)` },
            { message: `The mandatory tag 'html ⚡ for top-level html' is missing or incorrect. (https://www.ampproject.org/docs/reference/spec#required-markup)` }
        ]
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

const configuredTests: Array<IRuleTest> = [{
    name: 'Deprecated AMP attribute passes if errorsOnly is true',
    serverConfig: deprecateAMP
}];

ruleRunner.testRule(ruleName, defaultTests);
ruleRunner.testRule(ruleName, configuredTests, { ruleOptions: { 'errors-only': true } });
