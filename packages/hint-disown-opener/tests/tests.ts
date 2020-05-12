import { Severity } from '@hint/utils-types';
import { generateHTMLPage } from '@hint/utils-create-server';
import { getHintPath, HintTest, testHint } from '@hint/utils-tests-helpers';

const hintPath = getHintPath(__filename);

const generateMissingMessage = (linkType: string): string => {
    return `Link 'rel' attribute should include '${linkType}'.`;
};

const testsForOldBrowsers: HintTest[] = [

    // No 'target="_blank"'

    {
        name: `'a' with 'href="test.html"' does not have 'target="_blank"'`,
        serverConfig: { '/': generateHTMLPage(undefined, `<a href="test.html">test</a>`) }
    },
    {
        name: `'a' with 'href="https://example.com"' does not have 'target="_blank"'`,
        serverConfig: { '/': generateHTMLPage(undefined, `<a href="https://example.com">test</a>`) }
    },
    {
        name: `'map' with 'href="test.html" does not have 'target="_blank"'`,
        serverConfig: {
            '/': generateHTMLPage(undefined, `
                    <img src="test.png" width="10" height="10" usemap="#test">
                    <map name="test">
                        <area shape="rect" coords="0,0,100,100" href="test.html">
                    </map>`)
        }
    },
    {
        name: `'map' with 'href="https://example.com" does not have 'target="_blank"'`,
        serverConfig: {
            '/': generateHTMLPage(undefined, `
                    <img src="test.png" width="10" height="10" usemap="#test">
                    <map name="test">
                        <area shape="rect" coords="0,0,100,100" href="https://example.com">
                    </map>`)
        }
    },
    {
        name: `'a' has invalid "href"'`,
        serverConfig: { '/': generateHTMLPage(undefined, `<a href="http://">test</a>`) }
    },

    // 'target="_blank"' but no 'noopener' and 'noreferrer'.

    {
        name: `'a' has 'target="_blank"'`,
        serverConfig: { '/': generateHTMLPage(undefined, `<a target="_blank">test</a>`) }
    },
    {
        name: `'a' with 'href=""' has 'target="_blank"'`,
        serverConfig: { '/': generateHTMLPage(undefined, `<a href="" target="_blank">test</a>`) }
    },
    {
        name: `'a' with 'href="test.html"' has 'target="_blank"' and rel="nofollow"`,
        serverConfig: { '/': generateHTMLPage(undefined, `<a href="test.html" target="_blank" rel="nofollow">test</a>`) }
    },
    {
        name: `'a' with 'href="javascript:void(0)"' has 'target="_blank"'`,
        serverConfig: { '/': generateHTMLPage(undefined, `<a href="javascript:void(0)" target="_blank">test</a>`) }
    },
    {
        name: `'a' with 'href="https://example.com"' has 'target="_blank"'`,
        reports: [{
            message: generateMissingMessage('noopener'),
            severity: Severity.error
        },
        {
            message: generateMissingMessage('noreferrer'),
            severity: Severity.warning
        }
        ],
        serverConfig: { '/': generateHTMLPage(undefined, `<a href="https://example.com" id="test" class="test1 test2 test3 test4 test5 test5 test6" target="_blank">test</a>`) }
    },
    {
        name: `'a' with 'href="//example.com"' has 'target="_blank"'`,
        reports: [{
            message: generateMissingMessage('noopener'),
            severity: Severity.error
        },
        {
            message: generateMissingMessage('noreferrer'),
            severity: Severity.warning
        }],
        serverConfig: { '/': generateHTMLPage(undefined, `<a href="//example.com" target="_blank">test</a>`) }
    },
    {
        name: `'a' with 'href="//example.com"' has 'target="_blank"' and single quotes in some attribute`,
        reports: [{
            message: generateMissingMessage('noopener'),
            severity: Severity.error
        },
        {
            message: generateMissingMessage('noreferrer'),
            severity: Severity.warning
        }],
        serverConfig: { '/': generateHTMLPage(undefined, `<a href="//example.com" target="_blank" mouseover="return 'hello!';">test</a>`) }
    },
    {
        name: `'map' href="//example.com" has 'target="_blank"'`,
        reports: [{
            message: generateMissingMessage('noopener'),
            severity: Severity.error
        },
        {
            message: generateMissingMessage('noreferrer'),
            severity: Severity.warning
        }],
        serverConfig: {
            '/': generateHTMLPage(undefined, `
                    <img src="test.png" width="10" height="10" usemap="#test">
                    <map name="test">
                        <area shape="rect" coords="0,0,100,100" href="//example.com" target="_blank" rel="nofollow">
                    </map>`)
        }
    },

    // 'target="_blank"' but no 'noopener'

    {
        name: `'a' with 'href="https://example.com"' has 'target="_blank"' and 'noopener'`,
        reports: [{
            message: generateMissingMessage('noreferrer'),
            severity: Severity.warning
        }],
        serverConfig: { '/': generateHTMLPage(undefined, `<a href="https://example.com" target="_blank" rel="noopener">test</a>`) }
    },
    {
        name: `'map' with href="https://example.com" has 'target="_blank"' and 'noopener'`,
        reports: [{
            message: generateMissingMessage('noreferrer'),
            severity: Severity.warning
        }],
        serverConfig: {
            '/': generateHTMLPage(undefined, `
                    <img src="test.png" width="10" height="10" usemap="#test">
                    <map name="test">
                        <area shape="rect" coords="0,0,100,100" href="https://example.com" target="_blank" rel="noopener">
                    </map>`)
        }
    },

    // 'target="_blank"' but no 'noreferrer'

    {
        name: `'a' with 'href="https://example.com"' has 'target="_blank"' and 'noreferrer'`,
        reports: [{
            message: generateMissingMessage('noopener'),
            severity: Severity.error
        }],
        serverConfig: { '/': generateHTMLPage(undefined, `<a href="https://example.com" target="_blank" rel="noreferrer">test</a>`) }
    },
    {
        name: `'map' with href="https://example.com" has 'target="_blank"' and 'noreferrer'`,
        reports: [{
            message: generateMissingMessage('noopener'),
            severity: Severity.error
        }],
        serverConfig: {
            '/': generateHTMLPage(undefined, `
                    <img src="test.png" width="10" height="10" usemap="#test">
                    <map name="test">
                        <area shape="rect" coords="0,0,100,100" href="https://example.com" target="_blank" rel="noreferrer">
                    </map>`)
        }
    },

    // 'target="_blank"', 'noopener', and 'noreferrer'

    {
        name: `'a' with 'href="https://example.com"' has 'target="_blank"', 'noopener', and noreferrer'`,
        serverConfig: { '/': generateHTMLPage(undefined, `<a href="https://example.com" target="_blank" rel="noopener noreferrer">test</a>`) }
    },
    {
        name: `'map' with href="https://example.com" has 'target="_blank"', 'noopener', and noreferrer'`,
        serverConfig: {
            '/': generateHTMLPage(undefined, `
                    <img src="test.png" width="10" height="10" usemap="#test">
                    <map name="test">
                        <area shape="rect" coords="0,0,100,100" href="https://example.com" target="_blank" rel="noreferrer noopener">
                    </map>`)
        }
    },

    // Resource is not an HTML document

    {
        name: `Resource is not an HTML document`,
        serverConfig: { '/': { headers: { 'Content-Type': 'image/png' } } }
    }
];

const testsWithFullSupportBrowsers: HintTest[] = [
    {
        name: `'a' with 'href="https://example.com"' has 'target="_blank"', and 'noopener' is supported by all targeted browsers`,
        reports: [{
            message: generateMissingMessage('noopener'),
            severity: Severity.error
        }],
        serverConfig: { '/': generateHTMLPage(undefined, `<a href="https://example.com" id="test" class="test1 test2 test3 test4 test5 test5 test6" target="_blank">test</a>`) }
    },
    {
        name: `'a' with 'href="https://example.com"' has 'target="_blank"', 'noopener noreferrer' is supported by all targeted browsers`,
        serverConfig: { '/': generateHTMLPage(undefined, `<a href="https://example.com" target="_blank" rel="noopener noreferrer">test</a>`) }
    }
];

const testsForIncludeSameOriginURLsConfig: HintTest[] = [
    {
        name: `'a' with 'href=""' has 'target="_blank"' in when including same origin urls`,
        reports: [{
            message: generateMissingMessage('noopener'),
            severity: Severity.error
        },
        {
            message: generateMissingMessage('noreferrer'),
            severity: Severity.warning
        }],
        serverConfig: { '/': generateHTMLPage(undefined, `<a href="" target="_blank">test</a>`) }
    },
    {
        name: `'a' with 'href="/"' has 'target="_blank"'`,
        reports: [{
            message: generateMissingMessage('noopener'),
            severity: Severity.error
        },
        {
            message: generateMissingMessage('noreferrer'),
            severity: Severity.warning
        }],
        serverConfig: { '/': generateHTMLPage(undefined, `<a href="/" target="_blank">test</a>`) }
    },
    {
        name: `'a' with 'href="test.html"' has 'target="_blank"'`,
        reports: [{
            message: generateMissingMessage('noopener'),
            severity: Severity.error
        },
        {
            message: generateMissingMessage('noreferrer'),
            severity: Severity.warning
        }],
        serverConfig: { '/': generateHTMLPage(undefined, `<a href="test.html" target="_blank">test</a>`) }
    },
    {
        name: `'a' with 'href="http://localhost/test.html"' has 'target="_blank"'`,
        reports: [{
            message: generateMissingMessage('noopener'),
            severity: Severity.error
        },
        {
            message: generateMissingMessage('noreferrer'),
            severity: Severity.warning
        }],
        serverConfig: { '/': generateHTMLPage(undefined, `<a href="http://localhost/test.html" target="_blank">test</a>`) }
    },
    {
        name: `'map' href="test.html" has 'target="_blank"'`,
        reports: [{
            message: generateMissingMessage('noopener'),
            severity: Severity.error
        },
        {
            message: generateMissingMessage('noreferrer'),
            severity: Severity.warning
        }],
        serverConfig: {
            '/': generateHTMLPage(undefined, `
                    <img src="test.png" width="10" height="10" usemap="#test">
                    <map name="test">
                        <area shape="rect" coords="0,0,100,100" href="test.html" target="_blank" rel="nofollow">
                    </map>`)
        }
    }
];

testHint(hintPath, testsWithFullSupportBrowsers, { browserslist: ['chrome 60', 'firefox 55'] });
testHint(hintPath, testsForOldBrowsers, { browserslist: ['ie 8'] });
testHint(hintPath, testsForIncludeSameOriginURLsConfig, { hintOptions: { includeSameOriginURLs: true } });
