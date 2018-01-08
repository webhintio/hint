import { getRuleName } from '../../../../src/lib/utils/rule-helpers';
import * as ruleRunner from '../../../helpers/rule-runner';

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

const ruleName = getRuleName(__dirname);

/*
 * TODO: Remove `ignoredConnectors` part once headless
 *       Chrome on Travis CI doesn't fail miserably. :(
 */
const testConfigs = {
    https: true,
    ignoredConnectors: ['chrome']
};

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

ruleRunner.testRule(ruleName, testsForDefaults(true), testConfigs);
ruleRunner.testRule(ruleName, testsForSpecialCases(true), testConfigs);
ruleRunner.testRule(ruleName, testsForDisallowedCompressionMethods(true), testConfigs);
ruleRunner.testRule(ruleName, testsForNoCompression(true), testConfigs);
ruleRunner.testRule(ruleName, testsForGzipZopfli(true), testConfigs);
ruleRunner.testRule(ruleName, testsForGzipZopfliCaching(true), testConfigs);
ruleRunner.testRule(ruleName, testsForGzipZopfliSmallSize(true), testConfigs);
ruleRunner.testRule(ruleName, testsForGzipZopfliUASniffing(true), testConfigs);

ruleRunner.testRule(ruleName, testsForBrotli, testConfigs);
ruleRunner.testRule(ruleName, testsForBrotliSmallSize, testConfigs);
ruleRunner.testRule(ruleName, testsForBrotliUASniffing(), testConfigs);

// Tests for the user options.
[true, false].forEach((isTarget) => {
    ['gzip', 'zopfli', 'brotli'].forEach((encoding) => {
        ruleRunner.testRule(
            ruleName,
            testsForUserConfigs(`${encoding}`, isTarget, true),
            Object.assign(
                {},
                testConfigs,
                { ruleOptions: { [isTarget ? 'target' : 'resource']: { [encoding]: false } } }
            )
        );
    });
});
