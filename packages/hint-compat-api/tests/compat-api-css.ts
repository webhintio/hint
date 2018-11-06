import { getHintPath } from 'hint/dist/src/lib/utils/hint-helpers';
import { HintTest } from '@hint/utils-tests-helpers/dist/src/hint-test-type';
import generateHTMLPage from 'hint/dist/src/lib/utils/misc/generate-html-page';
import readFile from 'hint/dist/src/lib/utils/fs/read-file';
import * as hintRunner from '@hint/utils-tests-helpers/dist/src/hint-runner';

const hintPath = getHintPath(__filename, true);

const generateCSSConfig = (fileName: string) => {
    const path = 'fixtures/css';
    const styles = readFile(`${__dirname}/${path}/${fileName}.css`);

    return {
        '/': generateHTMLPage('<link rel="stylesheet" href="styles">'),
        '/styles': {
            content: styles,
            headers: { 'Content-Type': 'text/css' }
        }
    };
};

/*
 * You should test for cases where the hint passes and doesn't.
 * More information about how `hintRunner` can be configured is
 * available in:
 * https://webhint.io/docs/contributor-guide/how-to/test-hints/
 */
const neverRemoved: Array<HintTest> = [
    {
        name: 'Features that were never removed should pass.',
        serverConfig: generateCSSConfig('charset')
    }
];

hintRunner.testHint(hintPath, neverRemoved, { browserslist: ['chrome 64-69'], parsers: ['css']});

const removedForLaterVersions: Array<HintTest> = [
    {
        name: 'Features that were removed in versions earlier than the targeted browsers should fail.',
        reports: [{ message: 'box-lines of CSS is not supported on chrome 67, chrome 68, chrome 69 browsers.' }],
        serverConfig: generateCSSConfig('box-line')
    }
];

hintRunner.testHint(hintPath, removedForLaterVersions, { browserslist: ['chrome 64-69'], parsers: ['css']});
