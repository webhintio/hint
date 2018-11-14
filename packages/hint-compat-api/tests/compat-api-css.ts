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
        '/': generateHTMLPage(`<link rel="stylesheet" href="styles/${fileName}">`),
        [`/styles/${fileName}`]: {
            content: styles,
            headers: { 'Content-Type': 'text/css' }
        }
    };
};

/*
 * Tests for css features that were removed / deprecated.
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

hintRunner.testHint(hintPath, neverRemoved, { browserslist: ['> 1%'], parsers: ['css']});

const prefixedFeatureNeverRemoved: Array<HintTest> = [
    {
        name: 'Prefixed features that were never removed should pass.',
        serverConfig: generateCSSConfig('box-lines-prefix-current')
    }
];

hintRunner.testHint(hintPath, prefixedFeatureNeverRemoved, { browserslist: ['safari 3 - 9'], parsers: ['css']});

const featureRemoved: Array<HintTest> = [
    {
        name: 'Features that were removed in versions before the targeted browsers should fail.',
        reports: [{ message: 'padding-box is not supported on firefox 52 browsers.' }],
        serverConfig: generateCSSConfig('box-sizing')
    }
];

hintRunner.testHint(hintPath, featureRemoved, { browserslist: ['firefox 52'], parsers: ['css']});

const prefixFeatureRemoved: Array<HintTest> = [
    {
        name: 'Prefixed features that were removed in versions before the targeted browsers should fail.',
        reports: [{ message: 'box-lines prefixed with -webkit- is not supported on chrome 67, chrome 68, chrome 69 browsers.' }],
        serverConfig: generateCSSConfig('box-lines-prefix-current')
    }
];

hintRunner.testHint(hintPath, prefixFeatureRemoved, { browserslist: ['chrome 65 - 69'], parsers: ['css']});

const removedLaterThanTargetedBrowsers: Array<HintTest> = [
    {
        name: 'Prefixed features that were removed in a version later to the targeted browsers should pass.',
        serverConfig: generateCSSConfig('keyframes')
    }
];

hintRunner.testHint(hintPath, removedLaterThanTargetedBrowsers, { browserslist: ['opera 13-14'], parsers: ['css']});

const removedInEarlierVersionsAndAddedLater: Array<HintTest> = [
    {
        name: 'Features removed and re-added to versions earlier than the targeted browsers should pass.',
        serverConfig: generateCSSConfig('animation-duration-prefix')
    }
];

hintRunner.testHint(hintPath, removedInEarlierVersionsAndAddedLater, { browserslist: ['opera 32'], parsers: ['css']});


const removedForBrowser: Array<HintTest> = [
    {
        name: 'Features that were removed in a version equal to the targeted browser should fail.',
        reports: [{ message: 'keyframes is not supported on opera 15 browsers.' }],
        serverConfig: generateCSSConfig('keyframes')
    }
];

hintRunner.testHint(hintPath, removedForBrowser, { browserslist: ['opera 15'], parsers: ['css']});

const removedForPrefixEqualToTargetedBrowsers: Array<HintTest> = [
    {
        name: 'Prefixed features that were removed in a version equal to the targeted browser should fail.',
        reports: [{ message: 'keyframes prefixed with -o- is not supported on opera 15 browsers.' }],
        serverConfig: generateCSSConfig('keyframes-prefix-obsolete')
    }
];

hintRunner.testHint(hintPath, removedForPrefixEqualToTargetedBrowsers, { browserslist: ['opera 15'], parsers: ['css']});

const removedForPrefixEarlierThanTargetedBrowsers: Array<HintTest> = [
    {
        name: 'Prefixed features that were removed in a version earlier than the targeted browser should fail.',
        reports: [{ message: 'keyframes prefixed with -o- is not supported on opera 16, opera 17, opera 18, opera 19 browsers.' }],
        serverConfig: generateCSSConfig('keyframes-prefix-obsolete')
    }
];

hintRunner.testHint(hintPath, removedForPrefixEarlierThanTargetedBrowsers, { browserslist: ['opera 16-19'], parsers: ['css']});

const addedForPrefixEqualToTargetedBrowsers: Array<HintTest> = [
    {
        name: 'Prefixed features that were added in a version equal to the targeted browser should pass.',
        serverConfig: generateCSSConfig('keyframes-prefix-current')
    }
];

hintRunner.testHint(hintPath, addedForPrefixEqualToTargetedBrowsers, { browserslist: ['opera 15'], parsers: ['css']});

const addedForPrefixEarlierThanTargetedBrowsers: Array<HintTest> = [
    {
        name: 'Prefixed features that were added in a version earlier to the targeted browser should pass.',
        serverConfig: generateCSSConfig('keyframes-prefix-current')
    }
];

hintRunner.testHint(hintPath, addedForPrefixEarlierThanTargetedBrowsers, { browserslist: ['opera 16-19'], parsers: ['css']});

const removedForFlags: Array<HintTest> = [
    {
        name: 'Features removed from versions requiring flags should pass.',
        serverConfig: generateCSSConfig('supports')
    }
];

hintRunner.testHint(hintPath, removedForFlags, { browserslist: ['firefox 18'], parsers: ['css']});
