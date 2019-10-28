import { HintTest, testHint } from '@hint/utils-tests-helpers';
import { test } from '@hint/utils';

const { generateHTMLPage, getHintPath } = test;
const hintPath = getHintPath(__filename, true);

const tests: HintTest[] = [
    {
        name: `Text has insufficient color contrast and fails`,
        reports: [
            {
                message: 'Elements must have sufficient color contrast: Element has insufficient color contrast of 1.16 (foreground color: #eeeeee, background color: #ffffff, font size: 12.0pt (16px), font weight: normal). Expected contrast ratio of 4.5:1',
                position: { match: 'div id="text"' }
            }
        ],
        serverConfig: generateHTMLPage(
            `<style>#text { background-color: #fff; color: #eee; }</style>`,
            `<div id="text">Text without sufficient contrast</div>`
        )
    }
];

testHint(hintPath, tests, { ignoredConnectors: ['jsdom'] });
