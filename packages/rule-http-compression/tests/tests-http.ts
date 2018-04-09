import { getRuleName } from 'sonarwhal/dist/src/lib/utils/rule-helpers';
import * as ruleRunner from 'sonarwhal/dist/tests/helpers/rule-runner';

import {
    testsForBrotliOverHTTP,
    testsForDefaults,
    testsForDisallowedCompressionMethods,
    testsForGzipZopfli,
    testsForGzipZopfliCaching,
    testsForGzipZopfliSmallSize,
    testsForGzipZopfliUASniffing,
    testsForNoCompression,
    testsForSpecialCases,
    testsForUserConfigs
} from './_tests';

const ruleName = getRuleName(__dirname);

/*
 * TODO: Remove `ignoredConnectors` part once headless
 *       Chrome on Travis CI doesn't fail miserably. :(
 */
const testConfigs = { ignoredConnectors: ['chrome'], serial: false };
const testConfigsSerial = Object.assign({}, testConfigs);

testConfigsSerial.serial = true;

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

ruleRunner.testRule(ruleName, testsForDefaults(), testConfigs);
ruleRunner.testRule(ruleName, testsForSpecialCases(), testConfigs);
ruleRunner.testRule(ruleName, testsForDisallowedCompressionMethods(), testConfigs);
ruleRunner.testRule(ruleName, testsForNoCompression(), testConfigsSerial);
ruleRunner.testRule(ruleName, testsForGzipZopfli(), testConfigsSerial);
ruleRunner.testRule(ruleName, testsForGzipZopfliCaching(), testConfigs);
ruleRunner.testRule(ruleName, testsForGzipZopfliSmallSize(), testConfigs);
ruleRunner.testRule(ruleName, testsForGzipZopfliUASniffing(), testConfigs);
ruleRunner.testRule(ruleName, testsForBrotliOverHTTP, testConfigs);

// Tests for the user options.
[true, false].forEach((isTarget) => {
    ['gzip', 'zopfli', 'brotli'].forEach((encoding) => {
        ruleRunner.testRule(
            ruleName,
            testsForUserConfigs(`${encoding}`, isTarget),
            Object.assign(
                {},
                testConfigs,
                { ruleOptions: { [isTarget ? 'target' : 'resource']: { [encoding]: false } } }
            )
        );
    });
});
