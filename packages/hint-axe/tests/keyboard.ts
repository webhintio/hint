import { HintTest, testHint } from '@hint/utils-tests-helpers';
import { test } from '@hint/utils';

const { generateHTMLPage, getHintPath } = test;
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
        name: `HTML has tabindex > 0 and fails because of custom config`,
        reports: [{
            message: 'Elements should not have tabindex greater than zero',
            position: { match: 'a href="#skip" tabindex="4"' }
        }],
        serverConfig: html.tabindex
    }
];

testHint(hintPath, tests);
testHint(hintPath, testsWithCustomConfiguration, { hintOptions: { tabindex: 'error' } });
