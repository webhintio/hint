import { test } from '@hint/utils';
import { HintTest, testHint } from '@hint/utils-tests-helpers';

const { generateHTMLPage, getHintPath } = test;
const hintPath = getHintPath(__filename);

/*
 * You should test for cases where the hint passes and doesn't.
 * More information about how `hintRunner` can be configured is
 * available in:
 * https://webhint.io/docs/contributor-guide/how-to/test-hints/
 */
const tests: HintTest[] = [
    {
        name: 'This test should pass',
        serverConfig: generateHTMLPage()
    },
    {
        name: `This test should fail`,
        reports: [{ message: `This should be your error message` }],
        serverConfig: generateHTMLPage()
    }
];

testHint(hintPath, tests);
