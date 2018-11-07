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

const prefixedFeatureNeverRemoved: Array<HintTest> = [
    {
        name: 'Prefixed features that were never removed should pass.',
        serverConfig: generateCSSConfig('box-lines-prefix-current')
    }
];

hintRunner.testHint(hintPath, prefixedFeatureNeverRemoved, { browserslist: ['safari 3 -9'], parsers: ['css']});

// const prefixFeatureNeverRemoved: Array<HintTest> = [
//     {
//         name: 'Prefixed features that were removed in versions before the targeted browsers should fail.',
//         reports: [{ message: 'box-lines of CSS is not supported on chrome 67, chrome 68, chrome 69 browsers.' }],
//         serverConfig: generateCSSConfig('box-lines-prefix-current')
//     }
// ];

// hintRunner.testHint(hintPath, prefixFeatureNeverRemoved, { browserslist: ['chrome 65 - 69'], parsers: ['css']});

const removedLaterThanTargetedBrowsers: Array<HintTest> = [
    {
        name: 'Features that were removed in a version later to the targeted browsers should pass.',
        serverConfig: generateCSSConfig('viewport')
    }
];

hintRunner.testHint(hintPath, removedLaterThanTargetedBrowsers, { browserslist: ['opera 11-14'], parsers: ['css']})

const removedInEarlierVersionsAndAddedLater: Array<HintTest> = [
    {
        name: 'Features that were removed and re-added to versions earlier than the targeted browsers should pass.',
        serverConfig: generateCSSConfig('viewport')
    }
];

hintRunner.testHint(hintPath, removedInEarlierVersionsAndAddedLater, { browserslist: ['opera 17'], parsers: ['css']})

const removedForBrowser: Array<HintTest> = [
    {
        name: 'Features that were removed in a version equal to the targeted browser should fail.',
        reports: [{ message: 'keyframes of CSS is not supported on opera 15 browsers.' }],
        serverConfig: generateCSSConfig('keyframes-prefix-obsolete')
    }
];

hintRunner.testHint(hintPath, removedForBrowser, { browserslist: ['opera 15'], parsers: ['css']})

const removedForPrefix: Array<HintTest> = [
    {
        name: 'Prefixed features that were removed in a version equal to the targeted browser should fail.',
        reports: [{ message: 'keyframes of CSS is not supported on opera 15 browsers.' }],
        serverConfig: generateCSSConfig('keyframes-prefix-obsolete')
    }
];

hintRunner.testHint(hintPath, removedForPrefix, { browserslist: ['opera 15'], parsers: ['css']})

const addedForPrefix: Array<HintTest> = [
    {
        name: 'Prefixed features that were added in a version equal to the targeted browser should pass.',
        serverConfig: generateCSSConfig('keyframes-prefix-current')
    }
];

hintRunner.testHint(hintPath, addedForPrefix, { browserslist: ['opera 15'], parsers: ['css']})

const alwaysTrueForPrefix: Array<HintTest> = [
    {
        name: 'Prefixed features that are always true for versions added should pass.',
        serverConfig: generateCSSConfig('keyframes-prefix-current')
    }
];

hintRunner.testHint(hintPath, alwaysTrueForPrefix, { browserslist: ['chrome 16'], parsers: ['css']})

const alwaysTrueForPrefix: Array<HintTest> = [
    {
        name: 'Feature added before targeted browsers should pass.',
        serverConfig: generateCSSConfig('keyframes')
    }
];

hintRunner.testHint(hintPath, alwaysTrueForPrefix, { browserslist: ['safari 10'], parsers: ['css']})

const prefixFeatureNeverRemoved: Array<HintTest> = [
    {
        name: 'Features that were removed in unspecified versions should fail.',
        reports: [{ message: 'supports of CSS is not supported on firefox 18, firefox 19, firefox 20 browsers.' }],
        serverConfig: generateCSSConfig('supports')
    }
];

hintRunner.testHint(hintPath, prefixFeatureNeverRemoved, { browserslist: ['firefox 18 - 20'], parsers: ['css']});