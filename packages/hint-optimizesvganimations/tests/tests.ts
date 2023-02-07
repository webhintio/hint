import { generateHTMLPage } from '@hint/utils-create-server';
import { getHintPath, HintTest, testHint } from '@hint/utils-tests-helpers';
import { Severity } from '@hint/utils-types';

const hintPath = getHintPath(__filename);

const svgCode = `<svg viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg">
<rect width="10" height="10">
</rect>
</svg>`;

const svgCodeWithAnimation = `<svg viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg">
<rect width="10" height="10">
  <animate
    attributeName="rx"
    values="0;5;0"
    dur="10s"
    repeatCount="indefinite" />
</rect>
</svg>`;

const svgCodeWithNestedAnimation = `<svg viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg">
<rect width="10" height="10">
  <animate
    attributeName="rx"
    values="0;5;0"
    dur="10s"
    repeatCount="indefinite" />
</rect>
</svg>`;



/*
 * You should test for cases where the hint passes and doesn't.
 * More information about how `hintRunner` can be configured is
 * available in:
 * https://webhint.io/docs/contributor-guide/how-to/test-hints/
 */
const tests: HintTest[] = [
    {
        name: 'Testing SVG without animated element',
        serverConfig: generateHTMLPage(undefined, svgCode)
    },
    {
        name: `Testing SVG with animated element`,
        reports: [{ message: `Using CSS to animate SVGs can be more performant than using 'animate' element.`,
                    severity: Severity.hint }],
        serverConfig: generateHTMLPage(undefined, svgCodeWithAnimation)
    },
    {
        name: `Testing SVG with nested animated element`,
        reports: [{ message: `Using CSS to animate SVGs can be more performant than using 'animate' element.`,
                    severity: Severity.hint }],
        serverConfig: generateHTMLPage(undefined, svgCodeWithNestedAnimation)
    }
];

testHint(hintPath, tests, { ignoredConnectors: ['jsdom'] });
