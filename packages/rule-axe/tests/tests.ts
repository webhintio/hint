/* eslint sort-keys: 0, no-undefined: 0 */

import { RuleTest } from 'sonarwhal/dist/tests/helpers/rule-test-type';
import * as ruleRunner from 'sonarwhal/dist/tests/helpers/rule-runner';
import { getRuleName } from 'sonarwhal/dist/src/lib/utils/rule-helpers';
import { generateHTMLPage } from 'sonarwhal/dist/tests/helpers/misc';

const ruleName = getRuleName(__dirname);

const html = {
    noProblems: generateHTMLPage(undefined, '<div role="main"><h1>test</h1></div>'),
    missingLang: `<!doctype html>
 <html>
    <head>
        <title>test</title>
    </head>
    <body>
        <div role="main">
            <h1>test</h1>
        </div>
    </body>
</html>`,
    tabindex: generateHTMLPage(undefined, `
<div role="main">
    <h1>test</h1>
    <a href="#skip" tabindex="4">Skip</a>
    <div id="skip">Introduction</div>
</div>`)
};

const tests: Array<RuleTest> = [
    {
        name: `Page doesn't have any a11y problems and passes`,
        serverConfig: html.noProblems
    },
    {
        name: `Resource is not an HTML document`,
        serverConfig: { '/': { headers: { 'Content-Type': 'image/png' } } }
    },
    {
        name: `HTML is missing the lang attribute and fails`,
        reports: [{ message: '<html> element must have a lang attribute' }],
        serverConfig: html.missingLang
    },
    {
        name: `HTML has tabindex > 0 and fails`,
        reports: [{ message: 'Elements should not have tabindex greater than zero' }],
        serverConfig: html.tabindex
    }
];

const testsWithCustomConfiguration: Array<RuleTest> = [
    {
        name: `Page doesn't have any a11y problems and passes`,
        serverConfig: html.noProblems
    },
    {
        name: `HTML is missing the lang attribute and passes because of custom config`,
        serverConfig: html.missingLang
    },
    {
        name: `HTML has tabindex > 0 and passes because of custom config`,
        serverConfig: html.tabindex
    }
];

ruleRunner.testRule(ruleName, tests);
ruleRunner.testRule(ruleName, testsWithCustomConfiguration, {
    ruleOptions: {
        runOnly: {
            type: 'rule',
            values: ['color-contrast']
        }
    }
});
