import { test } from '@hint/utils';
import { testHint } from '@hint/utils-tests-helpers';

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

const { getHintPath } = test;
const hintPath = getHintPath(__filename);

/*
 * TODO: Remove `ignoredConnectors` part once headless
 *       Chrome on CI doesn't fail. :(
 */
const testConfigs = {
    https: true,
    ignoredConnectors: ['chromium'],
    serial: false
};

const testConfigsSerial = Object.assign({}, testConfigs);

testConfigsSerial.serial = true;

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

testHint(hintPath, testsForDefaults(true), testConfigs);
testHint(hintPath, testsForSpecialCases(true), testConfigs);
testHint(hintPath, testsForDisallowedCompressionMethods(true), testConfigs);
testHint(hintPath, testsForNoCompression(true), testConfigsSerial);
testHint(hintPath, testsForGzipZopfli(true), testConfigsSerial);
testHint(hintPath, testsForGzipZopfliCaching(true), testConfigs);
testHint(hintPath, testsForGzipZopfliSmallSize(true), testConfigs);
testHint(hintPath, testsForGzipZopfliUASniffing(true), testConfigs);

testHint(hintPath, testsForBrotli, testConfigsSerial);
testHint(hintPath, testsForBrotliSmallSize, testConfigs);
testHint(hintPath, testsForBrotliUASniffing(), testConfigs);

// Tests for the user options.
[true, false].forEach((isHTML) => {
    ['gzip', 'zopfli', 'brotli'].forEach((encoding) => {
        testHint(
            hintPath,
            testsForUserConfigs(`${encoding}`, isHTML, true),
            Object.assign(
                {},
                testConfigs,
                { hintOptions: { [isHTML ? 'html' : 'resource']: { [encoding]: false } } }
            )
        );
    });
});
