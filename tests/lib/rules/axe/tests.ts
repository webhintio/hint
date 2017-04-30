/* eslint sort-keys: 0, no-undefined: 0 */

import { RuleTest } from '../../../helpers/rule-test-type'; // eslint-disable-line no-unused-vars
import * as ruleRunner from '../../../helpers/rule-runner';
import { getRuleName } from '../../../../src/lib/utils/rule-helpers';
import { generateHTMLPage } from '../../../helpers/misc';

const ruleName = getRuleName(__dirname);

const html = {
    noProblems: generateHTMLPage('<title>test</title>', ''),
    missingLang: `<!doctype html>
 <html>
    <head>
        <title>test</title>
    </head>
    <body>
    </body>
</html>`,
    tabindex: generateHTMLPage('<title>test</title>', `<header>Header</header>
        <a href="#skip" tabindex="4">Skip</a>`)
};

const tests: Array<RuleTest> = [
    {
        name: `Page doesn't have any a11y problems and passes`,
        serverConfig: html.noProblems
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
    runOnly: {
        type: 'rule',
        values: ['color-contrast']
    }
});
