import { getRulePath } from 'sonarwhal/dist/src/lib/utils/rule-helpers';
import * as ruleRunner from 'sonarwhal/dist/tests/helpers/rule-runner';

import {
    testsForBrotli,
    testsForBrotliSmallSize,
    testsForBrotliUASniffing,
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

const ruleName = getRulePath(__filename);

/*
 * TODO: Remove `ignoredConnectors` part once headless
 *       Chrome on Travis CI doesn't fail miserably. :(
 */
const testConfigs = {
    https: true,
    ignoredConnectors: ['chrome'],
    serial: false
};

const testConfigsSerial = Object.assign({}, testConfigs);

testConfigsSerial.serial = true;

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

ruleRunner.testRule(ruleName, testsForDefaults(true), testConfigs);
ruleRunner.testRule(ruleName, testsForSpecialCases(true), testConfigs);
ruleRunner.testRule(ruleName, testsForDisallowedCompressionMethods(true), testConfigs);
ruleRunner.testRule(ruleName, testsForNoCompression(true), testConfigsSerial);
ruleRunner.testRule(ruleName, testsForGzipZopfli(true), testConfigsSerial);
ruleRunner.testRule(ruleName, testsForGzipZopfliCaching(true), testConfigs);
ruleRunner.testRule(ruleName, testsForGzipZopfliSmallSize(true), testConfigs);
ruleRunner.testRule(ruleName, testsForGzipZopfliUASniffing(true), testConfigs);

ruleRunner.testRule(ruleName, testsForBrotli, testConfigsSerial);
ruleRunner.testRule(ruleName, testsForBrotliSmallSize, testConfigs);
ruleRunner.testRule(ruleName, testsForBrotliUASniffing(), testConfigs);

// Tests for the user options.
[true, false].forEach((isHTML) => {
    ['gzip', 'zopfli', 'brotli'].forEach((encoding) => {
        ruleRunner.testRule(
            ruleName,
            testsForUserConfigs(`${encoding}`, isHTML, true),
            Object.assign(
                {},
                testConfigs,
                { ruleOptions: { [isHTML ? 'html' : 'resource']: { [encoding]: false } } }
            )
        );
    });
});
