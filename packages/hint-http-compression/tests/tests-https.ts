import { getHintPath } from 'hint/dist/src/lib/utils/hint-helpers';
import * as hintRunner from '@hint/utils-tests-helpers/dist/src/hint-runner';

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

const hintPath = getHintPath(__filename);

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

hintRunner.testHint(hintPath, testsForDefaults(true), testConfigs);
hintRunner.testHint(hintPath, testsForSpecialCases(true), testConfigs);
hintRunner.testHint(hintPath, testsForDisallowedCompressionMethods(true), testConfigs);
hintRunner.testHint(hintPath, testsForNoCompression(true), testConfigsSerial);
hintRunner.testHint(hintPath, testsForGzipZopfli(true), testConfigsSerial);
hintRunner.testHint(hintPath, testsForGzipZopfliCaching(true), testConfigs);
hintRunner.testHint(hintPath, testsForGzipZopfliSmallSize(true), testConfigs);
hintRunner.testHint(hintPath, testsForGzipZopfliUASniffing(true), testConfigs);

hintRunner.testHint(hintPath, testsForBrotli, testConfigsSerial);
hintRunner.testHint(hintPath, testsForBrotliSmallSize, testConfigs);
hintRunner.testHint(hintPath, testsForBrotliUASniffing(), testConfigs);

// Tests for the user options.
[true, false].forEach((isHTML) => {
    ['gzip', 'zopfli', 'brotli'].forEach((encoding) => {
        hintRunner.testHint(
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
