import { getRulePath } from 'sonarwhal/dist/src/lib/utils/rule-helpers';
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

const rulePath = getRulePath(__filename);

/*
 * TODO: Remove `ignoredConnectors` part once headless
 *       Chrome on Travis CI doesn't fail miserably. :(
 */
const testConfigs = { ignoredConnectors: ['chrome'], serial: false };
const testConfigsSerial = Object.assign({}, testConfigs);

testConfigsSerial.serial = true;

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

ruleRunner.testRule(rulePath, testsForDefaults(), testConfigs);
ruleRunner.testRule(rulePath, testsForSpecialCases(), testConfigs);
ruleRunner.testRule(rulePath, testsForDisallowedCompressionMethods(), testConfigs);
ruleRunner.testRule(rulePath, testsForNoCompression(), testConfigsSerial);
ruleRunner.testRule(rulePath, testsForGzipZopfli(), testConfigsSerial);
ruleRunner.testRule(rulePath, testsForGzipZopfliCaching(), testConfigs);
ruleRunner.testRule(rulePath, testsForGzipZopfliSmallSize(), testConfigs);
ruleRunner.testRule(rulePath, testsForGzipZopfliUASniffing(), testConfigs);
ruleRunner.testRule(rulePath, testsForBrotliOverHTTP, testConfigs);

// Tests for the user options.
[true, false].forEach((isTarget) => {
    ['gzip', 'zopfli', 'brotli'].forEach((encoding) => {
        ruleRunner.testRule(
            rulePath,
            testsForUserConfigs(`${encoding}`, isTarget),
            Object.assign(
                {},
                testConfigs,
                { ruleOptions: { [isTarget ? 'target' : 'resource']: { [encoding]: false } } }
            )
        );
    });
});
