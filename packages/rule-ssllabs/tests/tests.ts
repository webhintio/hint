/* eslint sort-keys: 0, no-undefined: 0 */

import * as mock from 'mock-require';

import { RuleTest } from 'sonarwhal/dist/tests/helpers/rule-test-type';
import * as ruleRunner from 'sonarwhal/dist/tests/helpers/rule-runner';
import { getRulePath } from 'sonarwhal/dist/src/lib/utils/rule-helpers';

const rulePath = getRulePath(__filename);

const ssllabsMock = (response) => {
    const mockedModule = {
        // Original node-ssllabs uses callback and we promisify in the rule
        scan: (options, callback) => {
            if (response === null) {
                return callback('Error');
            }

            return callback(null, response);
        }
    };

    mock('node-ssllabs', mockedModule);
};

const results = {
    aplussite: { endpoints: [{ grade: 'A+' }] },
    asite: {
        endpoints: [{ grade: 'A' }, {
            grade: 'A',
            serverName: 'a-site.net'
        }]
    },
    nohttps: { endpoints: [{ details: { protocols: [] } }] }
};

const testsForDefaults: Array<RuleTest> = [
    {
        name: `Site with with A+ grade passes`,
        serverUrl: 'https://example.com',
        before() {
            ssllabsMock(results.aplussite);
        }
    },
    {
        name: `Site A grade passes`,
        serverUrl: 'https://example.com',
        before() {
            ssllabsMock(results.asite);
        }
    },
    {
        name: `Domain without HTTPS fails`,
        reports: [{ message: `http://example.com/ doesn't support HTTPS.` }],
        serverUrl: 'http://example.com',
        before() {
            ssllabsMock(results.nohttps);
        }
    },
    {
        name: `Resource is not an HTML document`,
        serverConfig: { '/': { headers: { 'Content-Type': 'image/png' } } }
    }
];

const testsForConfigs: Array<RuleTest> = [
    {
        name: `Site with A+ grade passes with A+ minimum`,
        serverUrl: 'https://example.com',
        before() {
            ssllabsMock(results.aplussite);
        }
    },
    {
        name: `Site with A grade doesn't pass with A+ minimum`,
        reports: [
            { message: `https://example.com/'s grade A doesn't meet the minimum A+ required.` },
            { message: `a-site.net's grade A doesn't meet the minimum A+ required.` }
        ],
        serverUrl: 'https://example.com',
        before() {
            ssllabsMock(results.asite);
        }
    },
    {
        name: `Domain without HTTPS fails`,
        reports: [{ message: `http://example.com/ doesn't support HTTPS.` }],
        serverUrl: 'http://example.com',
        before() {
            ssllabsMock(results.nohttps);
        }
    }
];

const testsForErrors: Array<RuleTest> = [
    {
        name: 'Issue gettings results from SSL Labs reports error',
        reports: [{ message: `Couldn't get results from SSL Labs for https://example.com/.` }],
        serverUrl: 'https://example.com',
        before() {
            ssllabsMock(null);
        }
    },
    {
        name: 'Missing endpoints reports an error',
        reports: [{
            message: `Didn't get any result for https://example.com/.
There might be something wrong with SSL Labs servers.`
        }],
        serverUrl: 'https://example.com',
        before() {
            ssllabsMock({});
        }
    },
    {
        name: 'Empty endpoints array reports an error',
        reports: [{
            message: `Didn't get any result for https://example.com/.
There might be something wrong with SSL Labs servers.`
        }],
        serverUrl: 'https://example.com',
        before() {
            ssllabsMock({ endpoints: [] });
        }
    },
    {
        name: 'Response with right status code but nothing inside reports an error',
        reports: [{
            message: `Didn't get any result for https://example.com/.
There might be something wrong with SSL Labs servers.`
        }],
        serverUrl: 'https://example.com',
        before() {
            ssllabsMock(undefined);
        }
    }
];

ruleRunner.testRule(rulePath, testsForDefaults, { serial: true });
ruleRunner.testRule(rulePath, testsForConfigs, {
    ruleOptions: { grade: 'A+' },
    serial: true
});
ruleRunner.testRule(rulePath, testsForErrors, { serial: true });
