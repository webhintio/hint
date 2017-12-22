import { getRuleName } from '../../../../src/lib/utils/rule-helpers';
import * as ruleRunner from '../../../helpers/rule-runner';

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
const testConfigs = { ignoredConnectors: ['chrome'] };

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

ruleRunner.testRule(ruleName, testsForDefaults(), testConfigs);
ruleRunner.testRule(ruleName, testsForSpecialCases(), testConfigs);
ruleRunner.testRule(ruleName, testsForDisallowedCompressionMethods(), testConfigs);
ruleRunner.testRule(ruleName, testsForNoCompression(), testConfigs);
ruleRunner.testRule(ruleName, testsForGzipZopfli(), testConfigs);
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
