/* eslint sort-keys: 0 */

import * as mock from 'mock-require';

import { HintTest, testHint } from '@hint/utils-tests-helpers';
import { test } from '@hint/utils';

const { getHintPath } = test;
const hintPath = getHintPath(__filename);

const ssllabsMock = (response: any) => {
    const mockedModule = {
        // Original node-ssllabs uses callback and we promisify in the hint
        scan: (options: any, callback: Function) => {
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

const testsForDefaults: HintTest[] = [
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
        name: `Domain without HTTPS fails with default configuration`,
        reports: [{ message: `'http://example.com/' does not support HTTPS.` }],
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

const testsForConfigs: HintTest[] = [
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
            { message: `https://example.com/'s grade A does not meet the minimum A+ required.` },
            { message: `a-site.net's grade A does not meet the minimum A+ required.` }
        ],
        serverUrl: 'https://example.com',
        before() {
            ssllabsMock(results.asite);
        }
    },
    {
        name: `Domain without HTTPS fails with a custom configuration`,
        reports: [{ message: `'http://example.com/' does not support HTTPS.` }],
        serverUrl: 'http://example.com',
        before() {
            ssllabsMock(results.nohttps);
        }
    }
];

const testsForErrors: HintTest[] = [
    {
        name: 'Issue gettings results from SSL Labs reports error',
        reports: [{ message: `Could not get results from SSL Labs for 'https://example.com/'.` }],
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

testHint(hintPath, testsForDefaults, { serial: true });
testHint(hintPath, testsForConfigs, {
    hintOptions: { grade: 'A+' },
    serial: true
});
testHint(hintPath, testsForErrors, { serial: true });
