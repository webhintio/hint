/* eslint sort-keys: 0, no-undefined: 0 */

import * as pluralize from 'pluralize';

import { cutString } from '../../../../src/lib/utils/misc';
import { generateHTMLPage } from '../../../helpers/misc';
import { getRuleName } from '../../../../src/lib/utils/rule-helpers';
import { RuleTest } from '../../../helpers/rule-test-type'; // eslint-disable-line no-unused-vars
import * as ruleRunner from '../../../helpers/rule-runner';

const ruleName = getRuleName(__dirname);

const generateMissingMessage = (value: string, linkTypes: Array<string>): string => {
    return `'${cutString(value, 100)}' is missing 'rel' ${pluralize('value', linkTypes.length)} '${linkTypes.join('\', \'')}'`;
};

const testsForDefaults: Array<RuleTest> = [

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
        name: `'a' with 'href="/"' has 'target="_blank"'`,
        serverConfig: { '/': generateHTMLPage(undefined, `<a href="/" target="_blank">test</a>`) }
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
        reports: [{ message: generateMissingMessage('<a href="https://example.com" id="test" class="t … test4 test5 test5 test6" target="_blank">test</a>', ['noopener', 'noreferrer']) }],
        serverConfig: { '/': generateHTMLPage(undefined, `<a href="https://example.com" id="test" class="test1 test2 test3 test4 test5 test5 test6" target="_blank">test</a>`) }
    },
    {
        name: `'a' with 'href="//example.com"' has 'target="_blank"'`,
        reports: [{ message: generateMissingMessage('<a href="//example.com" target="_blank">test</a>', ['noopener', 'noreferrer']) }],
        serverConfig: { '/': generateHTMLPage(undefined, `<a href="//example.com" target="_blank">test</a>`) }
    },
    {
        name: `'a' with 'href="//example.com"' has 'target="_blank"' and single quotes in some attribute`,
        reports: [{ message: generateMissingMessage(`<a href="//example.com" target="_blank" mouseover="return 'hello!';">test</a>`, ['noopener', 'noreferrer']) }],
        serverConfig: { '/': generateHTMLPage(undefined, `<a href="//example.com" target="_blank" mouseover="return 'hello!';">test</a>`) }
    },
    {
        name: `'map' href="//example.com" has 'target="_blank"'`,
        reports: [{ message: generateMissingMessage('<area shape="rect" coords="0,0,100,100" href="//example.com" target="_blank" rel="nofollow">', ['noopener', 'noreferrer']) }],
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
        reports: [{ message: generateMissingMessage('<a href="https://example.com" target="_blank" rel="noopener">test</a>', ['noreferrer']) }],
        serverConfig: { '/': generateHTMLPage(undefined, `<a href="https://example.com" target="_blank" rel="noopener">test</a>`) }
    },
    {
        name: `'map' with href="https://example.com" has 'target="_blank"' and 'noopener'`,
        reports: [{ message: generateMissingMessage('<area shape="rect" coords="0,0,100,100" href="https://example.com" target="_blank" rel="noopener">', ['noreferrer']) }],
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
        reports: [{ message: generateMissingMessage('<a href="https://example.com" target="_blank" rel="noreferrer">test</a>', ['noopener']) }],
        serverConfig: { '/': generateHTMLPage(undefined, `<a href="https://example.com" target="_blank" rel="noreferrer">test</a>`) }
    },
    {
        name: `'map' with href="https://example.com" has 'target="_blank"' and 'noreferrer'`,
        reports: [{ message: generateMissingMessage('<area shape="rect" coords="0,0,100,100" href="https://example.com" target="_blank" rel="noreferrer">', ['noopener']) }],
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
    }
];

const testsForBrowsersListConfig: Array<RuleTest> = [
    {
        name: `'a' with 'href="https://example.com"' has 'target="_blank"', and 'noopener' is supported by all targeted browsers`,
        reports: [{ message: generateMissingMessage('<a href="https://example.com" id="test" class="t … test4 test5 test5 test6" target="_blank">test</a>', ['noopener']) }],
        serverConfig: { '/': generateHTMLPage(undefined, `<a href="https://example.com" id="test" class="test1 test2 test3 test4 test5 test5 test6" target="_blank">test</a>`) }
    },
    {
        name: `'a' with 'href="https://example.com"' has 'target="_blank"', 'noopener', and 'noreferrer', and 'noopener' is supported by all targeted browsers`,
        serverConfig: { '/': generateHTMLPage(undefined, `<a href="https://example.com" target="_blank" rel="noopener noreferrer">test</a>`) }
    }
];

const testsForIncludeSameOriginURLsConfig: Array<RuleTest> = [
    {
        name: `'a' with 'href=""' has 'target="_blank"'`,
        reports: [{ message: generateMissingMessage('<a href="" target="_blank">test</a>', ['noopener', 'noreferrer']) }],
        serverConfig: { '/': generateHTMLPage(undefined, `<a href="" target="_blank">test</a>`) }
    },
    {
        name: `'a' with 'href="/"' has 'target="_blank"'`,
        reports: [{ message: generateMissingMessage('<a href="/" target="_blank">test</a>', ['noopener', 'noreferrer']) }],
        serverConfig: { '/': generateHTMLPage(undefined, `<a href="/" target="_blank">test</a>`) }
    },
    {
        name: `'a' with 'href="test.html"' has 'target="_blank"'`,
        reports: [{ message: generateMissingMessage('<a href="test.html" target="_blank">test</a>', ['noopener', 'noreferrer']) }],
        serverConfig: { '/': generateHTMLPage(undefined, `<a href="test.html" target="_blank">test</a>`) }
    },
    {
        name: `'a' with 'href="http://localhost/test.html"' has 'target="_blank"'`,
        reports: [{ message: generateMissingMessage('<a href="http://localhost/test.html" target="_blank">test</a>', ['noopener', 'noreferrer']) }],
        serverConfig: { '/': generateHTMLPage(undefined, `<a href="http://localhost/test.html" target="_blank">test</a>`) }
    },
    {
        name: `'map' href="test.html" has 'target="_blank"'`,
        reports: [{ message: generateMissingMessage('<area shape="rect" coords="0,0,100,100" href="test.html" target="_blank" rel="nofollow">', ['noopener', 'noreferrer']) }],
        serverConfig: {
            '/': generateHTMLPage(undefined, `
                    <img src="test.png" width="10" height="10" usemap="#test">
                    <map name="test">
                        <area shape="rect" coords="0,0,100,100" href="test.html" target="_blank" rel="nofollow">
                    </map>`)
        }
    }
];

ruleRunner.testRule(ruleName, testsForDefaults);
ruleRunner.testRule(ruleName, testsForBrowsersListConfig, { browserslist: ['Firefox >= 52'] });
ruleRunner.testRule(ruleName, testsForIncludeSameOriginURLsConfig, { ruleOptions: { includeSameOriginURLs: true } });
