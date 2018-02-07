/* eslint sort-keys: 0, no-undefined: 0 */
import * as mock from 'mock-require';

import { IRuleTest } from 'sonarwhal/dist/tests/helpers/rule-test-type';
import * as ruleRunner from 'sonarwhal/dist/tests/helpers/rule-runner';
import { generateHTMLPage } from 'sonarwhal/dist/tests/helpers/misc';
import { getRuleName } from 'sonarwhal/dist/src/lib/utils/rule-helpers';

const ruleName = getRuleName(__dirname);

const OkayMaxAge = 31536000; // a max-age value larger than the minimum
const smallMaxAge = 1; // a max-age value less than the minimum
const defaultMinimum = 10886400; // default value of minimum
const stsHeader = 'strict-transport-security';

const requestJSONAsyncMock = (responseObject) => {
    const mockedModule = {
        isRegularProtocol() {
            return true;
        },
        isHTTPS() {
            return true;
        },
        isDataURI() {
            return false;
        },
        normalizeString(str = '') {
            return str.toLowerCase();
        },
        requestJSONAsync: (uri) => {
            let response;

            if (uri.includes('/api/v2/preloadable')) {
                response = responseObject.preloadable;
            } else {
                response = responseObject.status;
            }

            if (!response) {
                return Promise.reject('Error with the verification service.');
            }

            return Promise.resolve(response);
        }
    };

    mock('../../../../src/lib/utils/misc', mockedModule);
};

// headers that will pass
const maxAgeOnlyHeader = { [stsHeader]: `max-age=${OkayMaxAge}` };
const includeSubDomainsHeader = { [stsHeader]: `max-age=${OkayMaxAge}; includeSubDomains` };
const preloadHeader = { [stsHeader]: `max-age=${OkayMaxAge}; includeSubDomains; preload` };
const mixCaseHeader = { [stsHeader]: `Max-Age=${OkayMaxAge}` };
const quotedStringHeader = { [stsHeader]: `max-age="${OkayMaxAge}"; includeSubDomains; preload` };

// headers that will fail
const tooShortHeader = { [stsHeader]: `max-age=${smallMaxAge}` };
const noMaxAgeHeader = { [stsHeader]: `maxage=${OkayMaxAge}; includeSubDomains; preload` };
const multipleMaxAgeHeader = { [stsHeader]: `max-age=${OkayMaxAge}; max-age=${OkayMaxAge + 1}` };
const multipleincludeSubDomainsHeader = { [stsHeader]: `includeSubDomains; max-age=${OkayMaxAge}; includeSubDomains` };
const wrongDelimiterHeader = { [stsHeader]: `max-age=${OkayMaxAge}, includeSubDomains; preload` };
const includeUnitMaxAgeHeader = { [stsHeader]: `max-age=${OkayMaxAge}s; includeSubDomains; preload` };

// api response
const notPreloadableError = `www subdomain does not support HTTPS`;
const preloaded = { status: 'preloaded' };
const unknown = { status: 'unknown' };
const noErrors = { errors: [] };
const hasErrors = { errors: [{ message: notPreloadableError }] };

// error messages
const generateTooShortError = (value) => {
    return `'${stsHeader}' header 'max-age' value should be more than ${value}`;
};
const noHeaderError = `'${stsHeader}' header was not specified`;
const noMaxAgeError = `'${stsHeader}' header requires 'max-age' directive`;
const multipleMaxAgeError = `'${stsHeader}' header contains more than one 'max-age'`;
const multipleincludeSubDomainsError = `'${stsHeader}' header contains more than one 'includesubdomains'`;
const tooShortErrorDefault = generateTooShortError(defaultMinimum);
const DelimiterwrongFormatError = `'${stsHeader}' header has the wrong format: max-age=31536000, includesubdomains`;
const UnitwrongFormatError = `'${stsHeader}' header has the wrong format: max-age=31536000s`;
const statusServiceError = `Error with getting preload status for https://localhost/.`;
const preloadableServiceError = `Error with getting preload eligibility for https://localhost/.`;

// override favicon headers so that it doesn't report in chrome
const faviconHeaderMaxAgeOnly = {
    '/': { content: generateHTMLPage() },
    '/favicon.ico': { headers: { [stsHeader]: `max-age=${OkayMaxAge + 100}` } }
};

const generateHTMLPageData = (content: string) => {
    return {
        content,
        headers: maxAgeOnlyHeader // the page itself should pass
    };
};

const htmlPageWithScriptData = generateHTMLPageData(generateHTMLPage(undefined, '<script src="test.js"></script>'));
const htmlPageWithManifestData = generateHTMLPageData(generateHTMLPage('<link rel="manifest" href="test.webmanifest">'));

const defaultTests: Array<IRuleTest> = [
    {
        name: `HTML page is served over HTTPS without 'Strict-Transport-Security' header specified`,
        serverConfig: faviconHeaderMaxAgeOnly,
        reports: [{ message: noHeaderError }]
    },
    {
        name: `Resource is served over HTTPS without 'Strict-Transport-Security' header specified`,
        serverConfig: Object.assign({}, faviconHeaderMaxAgeOnly, {
            '/': htmlPageWithScriptData,
            '/test.js': ''
        }),
        reports: [{ message: noHeaderError }]
    },
    {
        name: `Manifest is served over HTTPS without 'Strict-Transport-Security' header specified`,
        serverConfig: Object.assign({}, faviconHeaderMaxAgeOnly, {
            '/': htmlPageWithManifestData,
            '/test.webmanifest': ''
        }),
        reports: [{ message: noHeaderError }]
    },
    {
        name: `HTML pages is served over HTTPS and 'max-age' defined is too short`,
        serverConfig: Object.assign({}, faviconHeaderMaxAgeOnly, { '/': { headers: tooShortHeader } }),
        reports: [{ message: tooShortErrorDefault }]
    },
    {
        name: `Resource is served over HTTPS and 'max-age' defined is too short`,
        serverConfig: Object.assign({}, faviconHeaderMaxAgeOnly, {
            '/': htmlPageWithScriptData,
            '/test.js': { headers: tooShortHeader }
        }),
        reports: [{ message: tooShortErrorDefault }]
    },
    {
        name: `Manifest is served over HTTPS and 'max-age' defined is too short`,
        serverConfig: Object.assign({}, faviconHeaderMaxAgeOnly, {
            '/': htmlPageWithManifestData,
            '/test.webmanifest': { headers: tooShortHeader }
        }),
        reports: [{ message: tooShortErrorDefault }]
    },
    {
        name: `'Strict-Transport-Security' header with 'max-age' bigger than minimum`,
        serverConfig: Object.assign({}, faviconHeaderMaxAgeOnly, { '/': { headers: maxAgeOnlyHeader } })
    },
    {
        name: `'Strict-Transport-Security' header contains 'includeSubDomains'`,
        serverConfig: Object.assign({}, faviconHeaderMaxAgeOnly, { '/': { headers: includeSubDomainsHeader } })
    },
    {
        name: `'Strict-Transport-Security' header contains 'preload'`,
        serverConfig: Object.assign({}, faviconHeaderMaxAgeOnly, { '/': { headers: preloadHeader } })
    },
    {
        name: `'Strict-Transport-Security' header has no 'max-age' directive`,
        serverConfig: Object.assign({}, faviconHeaderMaxAgeOnly, { '/': { headers: noMaxAgeHeader } }),
        reports: [{ message: noMaxAgeError }]
    },
    {
        name: `'Strict-Transport-Security' header has a 'max-age' directive in mix cases`,
        serverConfig: Object.assign({}, faviconHeaderMaxAgeOnly, { '/': { headers: mixCaseHeader } })
    },
    {
        name: `'Strict-Transport-Security' header has multiple 'max-age' directives`,
        serverConfig: Object.assign({}, faviconHeaderMaxAgeOnly, { '/': { headers: multipleMaxAgeHeader } }),
        reports: [{ message: multipleMaxAgeError }]
    },
    {
        name: `'Strict-Transport-Security' header has multiple 'includeSubdomains' directives`,
        serverConfig: Object.assign({}, faviconHeaderMaxAgeOnly, { '/': { headers: multipleincludeSubDomainsHeader } }),
        reports: [{ message: multipleincludeSubDomainsError }]
    },
    {
        name: `'Strict-Transport-Security' header has the wrong delimiter`,
        serverConfig: Object.assign({}, faviconHeaderMaxAgeOnly, { '/': { headers: wrongDelimiterHeader } }),
        reports: [{ message: DelimiterwrongFormatError }]
    },
    {
        name: `'Strict-Transport-Security' header that includes letters in the 'max-age' value`,
        serverConfig: Object.assign({}, faviconHeaderMaxAgeOnly, { '/': { headers: includeUnitMaxAgeHeader } }),
        reports: [{ message: UnitwrongFormatError }]
    },
    {
        name: `'Strict-Transport-Security' header that wraps 'max-age' value in quotes`,
        serverConfig: Object.assign({}, faviconHeaderMaxAgeOnly, { '/': { headers: quotedStringHeader } })
    }
];

const configMaxAgeTests: Array<IRuleTest> = [{
    name: `Change the minimum max-age value`,
    // the max-age that passes before is now too short
    serverConfig: Object.assign({}, faviconHeaderMaxAgeOnly, { '/': { headers: maxAgeOnlyHeader } }),
    reports: [{ message: generateTooShortError(OkayMaxAge + 1) }]
}];

const configPreloadTets: Array<IRuleTest> = [
    {
        name: `The 'Strict-Transport-Security' header doesn't have 'preload' attribute`,
        serverConfig: Object.assign({}, faviconHeaderMaxAgeOnly, { '/': { headers: maxAgeOnlyHeader } })
    },
    {
        before() {
            requestJSONAsyncMock({ status: preloaded });
        },
        name: `The site is already on the preload list`,
        serverConfig: Object.assign({}, faviconHeaderMaxAgeOnly, { '/': { headers: preloadHeader } })
    },
    {
        before() {
            requestJSONAsyncMock({ status: unknown, preloadable: noErrors });
        },
        name: `The site is not on the preload list, and is qualified to be enrolled`,
        serverConfig: Object.assign({}, faviconHeaderMaxAgeOnly, { '/': { headers: preloadHeader } })
    },
    {
        before() {
            requestJSONAsyncMock({ status: unknown, preloadable: hasErrors });
        },
        name: `The site is not on the preload list, and it isn't qualified to be enrolled`,
        reports: [{ message: notPreloadableError }],
        serverConfig: Object.assign({}, faviconHeaderMaxAgeOnly, { '/': { headers: preloadHeader } })
    },
    {
        before() {
            requestJSONAsyncMock({ status: null, preloadable: hasErrors });
        },
        name: `Service error with the preload status endpoint`,
        reports: [{ message: statusServiceError }],
        serverConfig: Object.assign({}, faviconHeaderMaxAgeOnly, { '/': { headers: preloadHeader } })
    },
    {
        before() {
            requestJSONAsyncMock({ status: unknown, preloadable: null });
        },
        name: `Service error with the preload eligibility endpoint`,
        reports: [{ message: preloadableServiceError }],
        serverConfig: Object.assign({}, faviconHeaderMaxAgeOnly, { '/': { headers: preloadHeader } })
    }
];

ruleRunner.testRule(ruleName, defaultTests, { https: true });
ruleRunner.testRule(ruleName, configMaxAgeTests, {
    https: true,
    ruleOptions: { minMaxAgeValue: OkayMaxAge + 1 }
});
ruleRunner.testRule(ruleName, configPreloadTets, {
    https: true,
    ruleOptions: { checkPreload: true }
});
