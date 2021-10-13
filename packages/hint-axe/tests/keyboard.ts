import { generateHTMLPage } from '@hint/utils-create-server';
import { getHintPath, HintTest, testHint } from '@hint/utils-tests-helpers';
import { Severity } from '@hint/utils-types';

import { axeCoreVersion } from './_utils';

const hintPath = getHintPath(__filename, true);

const html = {
    tabindex: generateHTMLPage(undefined, `
<div>
    <h1>test</h1>
    <a href="#skip" tabindex="4">Skip</a>
    <div id="skip">Introduction</div>
</div>`)
};

const tests: HintTest[] = [
    {
        name: `HTML passes a recommended hint (tabindex > 0) because it's not WCAG 2.1`,
        serverConfig: html.tabindex
    }
];

const testsWithCustomConfiguration: HintTest[] = [
    {
        name: `HTML has tabindex > 0 and fails with error because of custom config with object`,
        reports: [{
            documentation: [{
                link: `https://dequeuniversity.com/rules/axe/${axeCoreVersion}/tabindex?application=axeAPI`,
                text: 'Learn more about this axe rule at Deque University'
            }],
            message: 'Elements should not have tabindex greater than zero',
            position: { match: 'a href="#skip" tabindex="4"' },
            severity: Severity.error
        }],
        serverConfig: html.tabindex
    }
];

const testsWithCustomConfigurationArrayFormat: HintTest[] = [
    {
        name: `HTML has tabindex > 0 and fails with warning because of custom config with array`,
        reports: [{
            documentation: [{
                link: `https://dequeuniversity.com/rules/axe/${axeCoreVersion}/tabindex?application=axeAPI`,
                text: 'Learn more about this axe rule at Deque University'
            }],
            message: 'Elements should not have tabindex greater than zero',
            position: { match: 'a href="#skip" tabindex="4"' },
            severity: Severity.warning
        }],
        serverConfig: html.tabindex
    }
];

testHint(hintPath, tests);
testHint(hintPath, testsWithCustomConfiguration, { hintOptions: { tabindex: 'error' } });
testHint(hintPath, testsWithCustomConfigurationArrayFormat, { hintOptions: ['tabindex'] });
