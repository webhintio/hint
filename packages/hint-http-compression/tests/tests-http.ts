import { test } from '@hint/utils';
import { testHint } from '@hint/utils-tests-helpers';

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

const { getHintPath } = test;
const hintPath = getHintPath(__filename);

/*
 * TODO: Remove `ignoredConnectors` part once headless
 *       Chrome on CI doesn't fail. :(
 */
const testConfigs = { ignoredConnectors: ['chrome'], serial: false };
const testConfigsSerial = Object.assign({}, testConfigs);

testConfigsSerial.serial = true;

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

testHint(hintPath, testsForDefaults(), testConfigs);
testHint(hintPath, testsForSpecialCases(), testConfigs);
testHint(hintPath, testsForDisallowedCompressionMethods(), testConfigs);
testHint(hintPath, testsForNoCompression(), testConfigsSerial);
testHint(hintPath, testsForGzipZopfli(), testConfigsSerial);
testHint(hintPath, testsForGzipZopfliCaching(), testConfigs);
testHint(hintPath, testsForGzipZopfliSmallSize(), testConfigs);
testHint(hintPath, testsForGzipZopfliUASniffing(), testConfigs);
testHint(hintPath, testsForBrotliOverHTTP, testConfigs);

// Tests for the user options.
[true, false].forEach((isTarget) => {
    ['gzip', 'zopfli', 'brotli'].forEach((encoding) => {
        testHint(
            hintPath,
            testsForUserConfigs(`${encoding}`, isTarget),
            Object.assign(
                {},
                testConfigs,
                { hintOptions: { [isTarget ? 'target' : 'resource']: { [encoding]: false } } }
            )
        );
    });
});
