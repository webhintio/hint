import { Severity } from '@hint/utils-types';
import { generateHTMLPage } from '@hint/utils-create-server';
import { getHintPath, HintTest, testHint } from '@hint/utils-tests-helpers';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const hintPath = getHintPath(__filename);

const htmlPageWithScript = generateHTMLPage(undefined, '<script src="test.js"></script>');
const htmlPageWithManifest = generateHTMLPage('<link rel="manifest" href="test.webmanifest">');

const generateErrorMessage = (values: string[]): string => {
    return `Response should not include disallowed headers: ${values.join(', ')}`;
};

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const testsForDefaults: HintTest[] = [
    {
        name: `HTML page is served without any of the disallowed headers`,
        serverConfig: { '/': '' }
    },
    {
        name: `Manifest is served without any of the disallowed headers`,
        serverConfig: {
            '/': htmlPageWithManifest,
            'test.webmanifest': ''
        }
    },
    {
        name: `Resource is served without any of the disallowed headers`,
        serverConfig: {
            '/': htmlPageWithScript,
            'test.js': ''
        }
    },
    {
        name: `Resource is specified as a data URI`,
        serverConfig: { '/': generateHTMLPage(undefined, '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==">') }
    },
    {
        name: `HTML page is served with one disallowed header`,
        reports: [{ message: generateErrorMessage(['x-powered-by']), severity: Severity.warning }],
        serverConfig: { '/': { headers: { 'X-Powered-By': 'test' } } }
    },
    {
        name: `HTML page is served with multiple disallowed headers`,
        reports: [{ message: generateErrorMessage(['x-aspnetmvc-version', 'x-powered-by']), severity: Severity.warning }],
        serverConfig: {
            '/': {
                headers: {
                    Server: 'test',
                    'X-AspNetMvc-Version': 'test',
                    'X-Powered-By': 'test'
                }
            }
        }
    }
];

const testsForDifferentServerHeaderValues: HintTest[] = (() => {

    const allowedServerHeaderValues = [
        'amo-cookiemap',
        'aorta',
        'APACHE',
        'ecs',
        'jetty',
        'jino.ru',
        'lighttpd',
        'marrakesh',
        'microsoft-iis',
        'mt3',
        'nginx',
        'omniture',
        'pingmatch',
        'radiumone',
        'waf',
        'windows-azure-blo'
    ];

    const disallowedServerHeaderValues = [
        'Apache/2.2.24 (uNix) Mod_ssl/2.2.24 OpenSSl/1.0.1e-fips MOD_fastcgi/2.4.6',
        'jetty(9.4.6.v20170531)',
        'windows-azure-blob/1.0 microsoft-httpapi/2.0',
        'apache/2.4.6 (CENTOS) PHP/5.4.16',
        'apache/2.2.34 (amazon)',
        'omniture dc/2.0.0',
        'jino.ru/mod_pizza',
        'amo-cookiemap/1.1',
        'lighttpd/1.4.35',
        'radiumone/1.4.2',
        'mt3 1.15.20.1 33bcb65 release pao-pixel-x16',
        'aorta/2.4.13-20180105.e4d0482',
        'marrakesh 1.9.9',
        'waf/2.4-12.1',
        'ecs (sjc/4e6a)',
        'pingmatch/v2.0.30-165-g51bed16#rel-ec2-master i-077d449239c04b184@us-west-2b@dxedge-app_us-west-2_prod_asg',
        'microsoft-iis/8.5',
        'nginx/1.12.2',
        'NgiNx/1.4.6 (ubuntu)'
    ];

    const tests: HintTest[] = [];

    allowedServerHeaderValues.forEach((value) => {
        tests.push({
            name: `HTML page is served with allowed 'Server: ${value}'`,
            serverConfig: { '/': { headers: { Server: value } } }
        });
    });

    disallowedServerHeaderValues.forEach((value) => {
        tests.push({
            name: `HTML page is served with disallowed 'Server: ${value}'`,
            reports: [{
                message: `The 'server' header should only contain the server name.`,
                severity: Severity.warning
            }],
            serverConfig: { '/': { headers: { Server: value } } }
        });
    });

    return tests;

})();

const testsForIgnoreConfigs: HintTest[] = [
    {
        name: `HTML page is served with disallowed headers that are ignored because of configs`,
        serverConfig: {
            '/': {
                headers: {
                    Server: 'apache/2.2.24 (unix) mod_ssl/2.2.24 openssl/1.0.1e-fips mod_fastcgi/2.4.6',
                    'X-Test-1': 'test'
                }
            }
        }
    }
];

const testsForIncludeConfigs: HintTest[] = [
    {
        name: `HTML page is served with disallowed headers that are enforced because of configs`,
        reports: [{ message: generateErrorMessage(['server', 'x-test-2']), severity: Severity.warning }],
        serverConfig: {
            '/': htmlPageWithScript,
            '/test.js': {
                headers: {
                    Server: 'apache/2.2.24 (unix) mod_ssl/2.2.24 openssl/1.0.1e-fips mod_fastcgi/2.4.6',
                    'X-Test-2': 'test'
                }
            }
        }
    }
];

const testsForConfigs: HintTest[] = [
    {
        name: `HTML page is served with disallowed headers that are both ignored and enforced because of configs`,
        reports: [{ message: generateErrorMessage(['x-powered-by', 'x-test-1']), severity: Severity.warning }],
        serverConfig: {
            '/': {
                headers: {
                    Server: 'apache/2.2.24 (unix) mod_ssl/2.2.24 openssl/1.0.1e-fips mod_fastcgi/2.4.6',
                    'X-Powered-By': 'test',
                    'X-Test-1': 'test',
                    'X-Test-2': 'test'
                }
            }
        }
    }
];

const testForSpecialHeaders: HintTest[] = [
    {
        name: `HTML page is served with disallowed Expires header`,
        reports: [{
            message: 'The \'Expires\' header should not be used, \'Cache-Control\' should be preferred.',
            severity: Severity.warning
        }],
        serverConfig: { '/': { headers: { Expires: 'Thu, 01 Dec 1994 16:00:00 GMT' } } }
    },
    {
        name: `HTML page is served with disallowed Host header`,
        reports: [{
            message: 'The \'Host\' header should not be used, it is a request header only.',
            severity: Severity.warning
        }],
        serverConfig: { '/': { headers: { Host: 'example.com' } } }
    },
    {
        name: `HTML page is served with disallowed P3P header`,
        reports: [{
            message: 'The \'P3P\' header should not be used, it is a non-standard header only implemented in Internet Explorer.',
            severity: Severity.warning
        }],
        serverConfig: { '/': { headers: { P3P: 'cp="this is not a p3p policy"' } } }
    },
    {
        name: `HTML page is served with disallowed Pragma header`,
        reports: [{
            message: 'The \'Pragma\' header should not be used, it is deprecated and is a request header only.',
            severity: Severity.warning
        }],
        serverConfig: { '/': { headers: { Pragma: 'no-cache' } } }
    },
    {
        name: `HTML page is served with disallowed Via header`,
        reports: [{
            message: 'The \'Via\' header should not be used, it is a request header only.',
            severity: Severity.warning
        }],
        serverConfig: { '/': { headers: { Via: '1.1 varnish, 1.1 squid' } } }
    },
    {
        name: `HTML page is served with disallowed X-Frame-Options header`,
        reports: [{
            message: 'The \'X-Frame-Options\' header should not be used. A similar effect, with more consistent support and stronger checks, can be achieved with the \'Content-Security-Policy\' header and \'frame-ancestors\' directive.',
            severity: Severity.warning
        }],
        serverConfig: { '/': { headers: { 'X-Frame-Options': 'SAMEORIGIN' } } }
    }
];

const testForIgnoredSpecialHeaders: HintTest[] = [
    {
        name: `HTML page served with disallowed, but ignored, special headers does not lead to warnings`,
        serverConfig: {
            '/': {
                headers: {
                    Expires: 'Thu, 01 Dec 1994 16:00:00 GMT',
                    Host: 'example.com',
                    P3P: 'cp="this is not a p3p policy"',
                    Pragma: 'no-cache',
                    Via: '1.1 varnish, 1.1 squid',
                    'X-Frame-Options': 'SAMEORIGIN'
                }
            }
        }
    }
];

testHint(hintPath, testsForDefaults);
testHint(hintPath, testsForDifferentServerHeaderValues);
testHint(hintPath, testsForIgnoreConfigs, { hintOptions: { ignore: ['Server', 'X-Powered-By', 'X-Test-1'] } });
testHint(hintPath, testsForIncludeConfigs, { hintOptions: { include: ['Server', 'X-Test-1', 'X-Test-2'] } });
testHint(hintPath, testsForConfigs, {
    hintOptions: {
        ignore: ['Server', 'X-Test-2', 'X-Test-3'],
        include: ['X-Powered-By', 'X-Test-1', 'X-Test-2']
    }
});
testHint(hintPath, testForSpecialHeaders);
testHint(hintPath, testForIgnoredSpecialHeaders, {
    hintOptions: {
        ignore: [
            'Expires',
            'Host',
            'P3P',
            'Pragma',
            'Via',
            'X-Frame-Options'
        ]
    }
});
