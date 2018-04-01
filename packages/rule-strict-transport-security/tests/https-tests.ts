import { RuleTest } from 'sonarwhal/dist/tests/helpers/rule-test-type';
import * as ruleRunner from 'sonarwhal/dist/tests/helpers/rule-runner';

import { getRuleName } from 'sonarwhal/dist/src/lib/utils/rule-helpers';

import * as common from './_common';

const ruleName = getRuleName(__dirname);

const defaultTests: Array<RuleTest> = [
    {
        name: `HTML page is served over HTTPS without 'Strict-Transport-Security' header specified`,
        reports: [{ message: common.noHeaderError }],
        serverConfig: common.faviconHeaderMaxAgeOnly

    },
    {
        name: `Resource is served over HTTPS without 'Strict-Transport-Security' header specified`,
        reports: [{ message: common.noHeaderError }],
        serverConfig: Object.assign({}, common.faviconHeaderMaxAgeOnly, {
            '/': common.htmlPageWithScriptData,
            '/test.js': ''
        })
    },
    {
        name: `HTML pages is served over HTTPS and 'max-age' defined is too short`,
        reports: [{ message: common.tooShortErrorDefault }],
        serverConfig: Object.assign({}, common.faviconHeaderMaxAgeOnly, { '/': { headers: common.tooShortHeader } })
    },
    {
        name: `Resource is served over HTTPS and 'max-age' defined is too short`,
        reports: [{ message: common.tooShortErrorDefault }],
        serverConfig: Object.assign({}, common.faviconHeaderMaxAgeOnly, {
            '/': common.htmlPageWithScriptData,
            '/test.js': { headers: common.tooShortHeader }
        })
    },
    {
        name: `'Strict-Transport-Security' header with 'max-age' bigger than minimum`,
        serverConfig: Object.assign({}, common.faviconHeaderMaxAgeOnly, { '/': { headers: common.maxAgeOnlyHeader } })
    },
    {
        name: `'Strict-Transport-Security' header contains 'includeSubDomains'`,
        serverConfig: Object.assign({}, common.faviconHeaderMaxAgeOnly, { '/': { headers: common.includeSubDomainsHeader } })
    },
    {
        name: `'Strict-Transport-Security' header contains 'preload'`,
        serverConfig: Object.assign({}, common.faviconHeaderMaxAgeOnly, { '/': { headers: common.preloadHeader } })
    },
    {
        name: `'Strict-Transport-Security' header has no 'max-age' directive`,
        reports: [{ message: common.noMaxAgeError }],
        serverConfig: Object.assign({}, common.faviconHeaderMaxAgeOnly, { '/': { headers: common.noMaxAgeHeader } })
    },
    {
        name: `'Strict-Transport-Security' header has a 'max-age' directive in mix cases`,
        serverConfig: Object.assign({}, common.faviconHeaderMaxAgeOnly, { '/': { headers: common.mixCaseHeader } })
    },
    {
        name: `'Strict-Transport-Security' header has multiple 'max-age' directives`,
        reports: [{ message: common.multipleMaxAgeError }],
        serverConfig: Object.assign({}, common.faviconHeaderMaxAgeOnly, { '/': { headers: common.multipleMaxAgeHeader } })
    },
    {
        name: `'Strict-Transport-Security' header has multiple 'includeSubdomains' directives`,
        reports: [{ message: common.multipleincludeSubDomainsError }],
        serverConfig: Object.assign({}, common.faviconHeaderMaxAgeOnly, { '/': { headers: common.multipleincludeSubDomainsHeader } })
    },
    {
        name: `'Strict-Transport-Security' header has the wrong delimiter`,
        reports: [{ message: common.DelimiterwrongFormatError }],
        serverConfig: Object.assign({}, common.faviconHeaderMaxAgeOnly, { '/': { headers: common.wrongDelimiterHeader } })
    },
    {
        name: `'Strict-Transport-Security' header that includes letters in the 'max-age' value`,
        reports: [{ message: common.UnitwrongFormatError }],
        serverConfig: Object.assign({}, common.faviconHeaderMaxAgeOnly, { '/': { headers: common.includeUnitMaxAgeHeader } })
    },
    {
        name: `'Strict-Transport-Security' header that wraps 'max-age' value in quotes`,
        serverConfig: Object.assign({}, common.faviconHeaderMaxAgeOnly, { '/': { headers: common.quotedStringHeader } })
    }
];

const configMaxAgeTests: Array<RuleTest> = [{
    name: `Change the minimum max-age value`,
    // the max-age that passes before is now too short
    reports: [{ message: common.generateTooShortError(common.OkayMaxAge + 1) }],
    serverConfig: Object.assign({}, common.faviconHeaderMaxAgeOnly, { '/': { headers: common.maxAgeOnlyHeader } })
}];

const configPreloadTets: Array<RuleTest> = [
    {
        name: `The 'Strict-Transport-Security' header doesn't have 'preload' attribute`,
        serverConfig: Object.assign({}, common.faviconHeaderMaxAgeOnly, { '/': { headers: common.maxAgeOnlyHeader } })
    },
    {
        before() {
            common.requestJSONAsyncMock({ status: common.preloaded });
        },
        name: `The site is already on the preload list`,
        serverConfig: Object.assign({}, common.faviconHeaderMaxAgeOnly, { '/': { headers: common.preloadHeader } })
    },
    {
        before() {
            common.requestJSONAsyncMock({ preloadable: common.noErrors, status: common.unknown });
        },
        name: `The site is not on the preload list, and is qualified to be enrolled`,
        serverConfig: Object.assign({}, common.faviconHeaderMaxAgeOnly, { '/': { headers: common.preloadHeader } })
    },
    {
        before() {
            common.requestJSONAsyncMock({ preloadable: common.hasErrors, status: common.unknown });
        },
        name: `The site is not on the preload list, and it isn't qualified to be enrolled`,
        reports: [{ message: common.notPreloadableError }],
        serverConfig: Object.assign({}, common.faviconHeaderMaxAgeOnly, { '/': { headers: common.preloadHeader } })
    },
    {
        before() {
            common.requestJSONAsyncMock({ preloadable: common.hasErrors, status: null });
        },
        name: `Service error with the preload status endpoint`,
        reports: [{ message: common.statusServiceError }],
        serverConfig: Object.assign({}, common.faviconHeaderMaxAgeOnly, { '/': { headers: common.preloadHeader } })
    },
    {
        before() {
            common.requestJSONAsyncMock({ preloadable: null, status: common.unknown });
        },
        name: `Service error with the preload eligibility endpoint`,
        reports: [{ message: common.preloadableServiceError }],
        serverConfig: Object.assign({}, common.faviconHeaderMaxAgeOnly, { '/': { headers: common.preloadHeader } })
    },
    {
        before() {
            common.requestJSONAsyncMock({ status: { status: null } });
        },
        name: `There's a problem with the verification endpoint`,
        reports: [{ message: common.problemWithVerificationEndpoint }],
        serverConfig: Object.assign({}, common.faviconHeaderMaxAgeOnly, { '/': { headers: common.preloadHeader } })
    }
];

ruleRunner.testRule(ruleName, defaultTests, { https: true });
ruleRunner.testRule(ruleName, configMaxAgeTests, {
    https: true,
    ruleOptions: { minMaxAgeValue: common.OkayMaxAge + 1 }
});
ruleRunner.testRule(ruleName, configPreloadTets, {
    https: true,
    ruleOptions: { checkPreload: true }
});
