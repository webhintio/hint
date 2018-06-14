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

const rulePath = getRulePath(__filename);

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

ruleRunner.testRule(rulePath, testsForDefaults(true), testConfigs);
ruleRunner.testRule(rulePath, testsForSpecialCases(true), testConfigs);
ruleRunner.testRule(rulePath, testsForDisallowedCompressionMethods(true), testConfigs);
ruleRunner.testRule(rulePath, testsForNoCompression(true), testConfigsSerial);
ruleRunner.testRule(rulePath, testsForGzipZopfli(true), testConfigsSerial);
ruleRunner.testRule(rulePath, testsForGzipZopfliCaching(true), testConfigs);
ruleRunner.testRule(rulePath, testsForGzipZopfliSmallSize(true), testConfigs);
ruleRunner.testRule(rulePath, testsForGzipZopfliUASniffing(true), testConfigs);

ruleRunner.testRule(rulePath, testsForBrotli, testConfigsSerial);
ruleRunner.testRule(rulePath, testsForBrotliSmallSize, testConfigs);
ruleRunner.testRule(rulePath, testsForBrotliUASniffing(), testConfigs);

// Tests for the user options.
[true, false].forEach((isHTML) => {
    ['gzip', 'zopfli', 'brotli'].forEach((encoding) => {
        ruleRunner.testRule(
            rulePath,
            testsForUserConfigs(`${encoding}`, isHTML, true),
            Object.assign(
                {},
                testConfigs,
                { ruleOptions: { [isHTML ? 'html' : 'resource']: { [encoding]: false } } }
            )
        );
    });
});
