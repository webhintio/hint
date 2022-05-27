import { generateHTMLPage } from '@hint/utils-create-server';
import { getHintPath, HintTest, testHint } from '@hint/utils-tests-helpers';
import { Severity } from '@hint/utils-types';

import { axeCoreVersion } from './_utils';

const hintPath = getHintPath(__filename, true);

const tests: HintTest[] = [
    {
        name: `Text has insufficient color contrast and fails`,
        reports: [
            {
                documentation: [{
                    link: `https://dequeuniversity.com/rules/axe/${axeCoreVersion}/color-contrast?application=axeAPI`,
                    text: 'Learn more about this axe rule at Deque University'
                }],
                message: 'Elements must have sufficient color contrast: Element has insufficient color contrast of 1.16 (foreground color: #eeeeee, background color: #ffffff, font size: 12.0pt (16px), font weight: normal). Expected contrast ratio of 4.5:1',
                position: { match: 'div id="text"' },
                severity: Severity.warning
            },
            {
                documentation: [{
                    link: `https://dequeuniversity.com/rules/axe/${axeCoreVersion}/color-contrast-enhanced?application=axeAPI`,
                    text: 'Learn more about this axe rule at Deque University'
                }],
                message: 'Elements must have sufficient color contrast: Element has insufficient color contrast of 1.16 (foreground color: #eeeeee, background color: #ffffff, font size: 12.0pt (16px), font weight: normal). Expected contrast ratio of 7:1',
                position: { match: 'div id="text"' },
                severity: Severity.warning
            }
        ],
        serverConfig: generateHTMLPage(
            `<style>#text { background-color: #fff; color: #eee; }</style>`,
            `<div id="text">Text without sufficient contrast</div>`
        )
    }
];

const testsWithHintSeverity = tests.map((test) => {
    return {
        ...test,
        name: `${test.name} (hint-severity)`,
        reports: test.reports?.map((report) => {
            return {
                ...report,
                severity: Severity.error
            };
        })
    };
});

const testsWithRuleSeverity = tests.map((test) => {
    return {
        ...test,
        name: `${test.name} (rule-severity)`,
        reports: test.reports?.map((report) => {
            return {
                ...report,
                severity: Severity.hint
            };
        })
    };
});

testHint(hintPath, tests, { ignoredConnectors: ['jsdom'] });
testHint(hintPath, testsWithHintSeverity, { ignoredConnectors: ['jsdom'], severity: 'error' });
testHint(hintPath, testsWithRuleSeverity, { hintOptions: { 'color-contrast': 'hint', 'color-contrast-enhanced': 'hint' }, ignoredConnectors: ['jsdom'], severity: 'error' });
