import { getHintPath, HintTest, testHint } from '@hint/utils-tests-helpers';
import { Severity } from '@hint/utils-types';

const hintPath = getHintPath(__filename);

const ssllabsMock = (response: any) => {
    return {
        'node-ssllabs': {
            // Original node-ssllabs uses callback and we promisify in the hint
            scan: (options: any, callback: Function) => {
                if (response === null) {
                    return callback('Error');
                }

                return callback(null, response);
            }
        }
    };
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
        overrides: ssllabsMock(results.aplussite),
        serverUrl: 'https://example.com'
    },
    {
        name: `Site A grade passes`,
        overrides: ssllabsMock(results.asite),
        serverUrl: 'https://example.com'
    },
    {
        name: `Domain without HTTPS fails with default configuration`,
        overrides: ssllabsMock(results.nohttps),
        reports: [{
            message: `'http://example.com/' does not support HTTPS.`,
            severity: Severity.error
        }],
        serverUrl: 'http://example.com'
    },
    {
        name: `Resource is not an HTML document`,
        serverConfig: { '/': { headers: { 'Content-Type': 'image/png' } } }
    }
];

const testsForConfigs: HintTest[] = [
    {
        name: `Site with A+ grade passes with A+ minimum`,
        overrides: ssllabsMock(results.aplussite),
        serverUrl: 'https://example.com'
    },
    {
        name: `Site with A grade doesn't pass with A+ minimum`,
        overrides: ssllabsMock(results.asite),
        reports: [
            {
                message: `https://example.com/'s grade A does not meet the minimum A+ required.`,
                severity: Severity.error
            },
            {
                message: `a-site.net's grade A does not meet the minimum A+ required.`,
                severity: Severity.error
            }
        ],
        serverUrl: 'https://example.com'
    },
    {
        name: `Domain without HTTPS fails with a custom configuration`,
        overrides: ssllabsMock(results.nohttps),
        reports: [{
            message: `'http://example.com/' does not support HTTPS.`,
            severity: Severity.error
        }],
        serverUrl: 'http://example.com'
    }
];

const testsForErrors: HintTest[] = [
    {
        name: 'Issue gettings results from SSL Labs reports error',
        overrides: ssllabsMock(null),
        reports: [{
            message: `Could not get results from SSL Labs for 'https://example.com/'.`,
            severity: Severity.warning
        }],
        serverUrl: 'https://example.com'
    },
    {
        name: 'Missing endpoints reports an error',
        overrides: ssllabsMock({}),
        reports: [{
            message: `Didn't get any result for https://example.com/.
There might be something wrong with SSL Labs servers.`,
            severity: Severity.warning
        }],
        serverUrl: 'https://example.com'
    },
    {
        name: 'Empty endpoints array reports an error',
        overrides: ssllabsMock({ endpoints: [] }),
        reports: [{
            message: `Didn't get any result for https://example.com/.
There might be something wrong with SSL Labs servers.`,
            severity: Severity.warning
        }],
        serverUrl: 'https://example.com'
    },
    {
        name: 'Response with right status code but nothing inside reports an error',
        overrides: ssllabsMock(undefined),
        reports: [{
            message: `Didn't get any result for https://example.com/.
There might be something wrong with SSL Labs servers.`,
            severity: Severity.warning
        }],
        serverUrl: 'https://example.com'
    }
];

testHint(hintPath, testsForDefaults, { serial: true });
testHint(hintPath, testsForConfigs, {
    hintOptions: { grade: 'A+' },
    serial: true
});
testHint(hintPath, testsForErrors, { serial: true });
