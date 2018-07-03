import { getHintPath } from 'hint/dist/src/lib/utils/hint-helpers';
import * as hintRunner from '@hint/utils-tests-helpers/dist/src/hint-runner';

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

const hintPath = getHintPath(__filename);

/*
 * TODO: Remove `ignoredConnectors` part once headless
 *       Chrome on Travis CI doesn't fail miserably. :(
 */
const testConfigs = { ignoredConnectors: ['chrome'], serial: false };
const testConfigsSerial = Object.assign({}, testConfigs);

testConfigsSerial.serial = true;

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

hintRunner.testHint(hintPath, testsForDefaults(), testConfigs);
hintRunner.testHint(hintPath, testsForSpecialCases(), testConfigs);
hintRunner.testHint(hintPath, testsForDisallowedCompressionMethods(), testConfigs);
hintRunner.testHint(hintPath, testsForNoCompression(), testConfigsSerial);
hintRunner.testHint(hintPath, testsForGzipZopfli(), testConfigsSerial);
hintRunner.testHint(hintPath, testsForGzipZopfliCaching(), testConfigs);
hintRunner.testHint(hintPath, testsForGzipZopfliSmallSize(), testConfigs);
hintRunner.testHint(hintPath, testsForGzipZopfliUASniffing(), testConfigs);
hintRunner.testHint(hintPath, testsForBrotliOverHTTP, testConfigs);

// Tests for the user options.
[true, false].forEach((isTarget) => {
    ['gzip', 'zopfli', 'brotli'].forEach((encoding) => {
        hintRunner.testHint(
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
