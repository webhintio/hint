import generateHTMLPage from 'hint/dist/src/lib/utils/misc/generate-html-page';
import { getHintPath } from 'hint/dist/src/lib/utils/hint-helpers';
import { HintTest } from '@hint/utils-tests-helpers/dist/src/hint-test-type';
import * as hintRunner from '@hint/utils-tests-helpers/dist/src/hint-runner';

const hintPath = getHintPath(__filename, true);

/*
 * You should test for cases where the hint passes and doesn't.
 * More information about how `hintRunner` can be configured is
 * available in:
 * https://webhint.io/docs/contributor-guide/how-to/test-hints/
 */
const tests: Array<HintTest> = [
    {
        name: 'This test should pass',
        serverConfig: generateHTMLPage()
    }
];

hintRunner.testHint(hintPath, tests, 
    {
        // browserslist: ['> 5% in alt-AS']
        // browserslist: ['and_uc 11.8'],
        browserslist: ['> 1%'],
    }
);
