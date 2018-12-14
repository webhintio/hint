import { getHintPath } from 'hint/dist/src/lib/utils/hint-helpers';
import { HintTest } from '@hint/utils-tests-helpers/dist/src/hint-test-type';
import generateHTMLPage from 'hint/dist/src/lib/utils/misc/generate-html-page';
import readFile from 'hint/dist/src/lib/utils/fs/read-file';
import * as hintRunner from '@hint/utils-tests-helpers/dist/src/hint-runner';

const hintPath = getHintPath(__filename, true);

const generateHTMLConfig = (fileName: string) => {
    const path = 'fixtures/html';
    const htmlFile = readFile(`${__dirname}/${path}/${fileName}.html`);

    return { '/': generateHTMLPage(htmlFile) };
};

/*
 * Tests for html features that were removed / deprecated.
 * More information about how `hintRunner` can be configured is
 * available in:
 * https://webhint.io/docs/contributor-guide/how-to/test-hints/
 */

const elementAddedAlwaysTrue: HintTest[] = [
    {
        name: 'Elements that have added as true should pass.',
        serverConfig: generateHTMLConfig('div')
    }
];

hintRunner.testHint(hintPath, elementAddedAlwaysTrue, { browserslist: ['last 2 Edge versions'], parsers: ['html']});

const elementAttrAddedAlwaysTrue: HintTest[] = [
    {
        name: 'Element attributes that have added as true should pass.',
        serverConfig: generateHTMLConfig('img')
    }
];

hintRunner.testHint(hintPath, elementAttrAddedAlwaysTrue, { browserslist: ['> 1%'], parsers: ['html']});

const elementVersionAddedNull: HintTest[] = [
    {
        name: 'Elements that have version added as null should pass.',
        serverConfig: generateHTMLConfig('canvas')
    }
];

hintRunner.testHint(hintPath, elementVersionAddedNull, { browserslist: ['and_chr 69'], parsers: ['html']});

const elementVersionAddedFalse: HintTest[] = [
    {
        name: 'Elements that have version added as false should fail.',
        reports: [{ message: 'blink element is not supported on chrome browser.', position: { column: 9, line: 3 }}],
        serverConfig: generateHTMLConfig('blink')
    }
];

hintRunner.testHint(hintPath, elementVersionAddedFalse, { browserslist: ['last 2 Chrome versions'], parsers: ['html']});

const elementVersionAddedFalseForMultipleBrowsers: HintTest[] = [
    {
        name: 'Elements that have version added as false for multiple browsers should fail with one error.',
        reports: [{ message: 'blink element is not supported on chrome, edge, ie browsers.', position: { column: 9, line: 3 }}],
        serverConfig: generateHTMLConfig('blink')
    }
];

hintRunner.testHint(hintPath, elementVersionAddedFalseForMultipleBrowsers, { browserslist: ['chrome 43', 'last 2 Edge versions', 'last 2 ie versions', 'opera 12'], parsers: ['html']});

const elementAddedInVersionBeforeTargetedBrowserVersion: HintTest[] = [
    {
        name: 'Elements added in version before targeted browser should pass.',
        serverConfig: generateHTMLConfig('video')
    }
];

hintRunner.testHint(hintPath, elementAddedInVersionBeforeTargetedBrowserVersion, { browserslist: ['ie 10'], parsers: ['html']});

const elementAddedVersionOfTargetedBrowser: HintTest[] = [
    {
        name: 'Elements that were added the version of the targeted browser should pass.',
        serverConfig: generateHTMLConfig('video')
    }
];

hintRunner.testHint(hintPath, elementAddedVersionOfTargetedBrowser, { browserslist: ['ie 9'], parsers: ['html']});

const elementAddedInVersionAfterTargetedBrowserVersion: HintTest[] = [
    {
        name: 'Elements added in version after targeted browser should fail.',
        reports: [{ message: 'video element is not added on ie 8 browser.', position: { column: 9, line: 3 }}],
        serverConfig: generateHTMLConfig('video')
    }
];

hintRunner.testHint(hintPath, elementAddedInVersionAfterTargetedBrowserVersion, { browserslist: ['ie 8'], parsers: ['html']});

const featureVersionAddedMixedFalseAndNullForDifferentBrowsers: HintTest[] = [
    {
        name: 'Features with unknown support (version added is null) and no support (version added is false) for different browsers should fail for unsupported browsers.',
        reports: [{ message: 'element element is not supported on edge, firefox_android browsers.', position: { column: 9, line: 3 }}],
        serverConfig: generateHTMLConfig('element')
    }
];

hintRunner.testHint(hintPath, featureVersionAddedMixedFalseAndNullForDifferentBrowsers, { browserslist: ['edge 18', 'chrome 45', 'and_ff 56'], parsers: ['html']});

const featureVersionAddedFalseForAllTargetedBrowsers: HintTest[] = [
    {
        name: 'Features with no support (version added is false) for multiple targeted browsers should fail.',
        reports: [{ message: 'element element is not supported on any of your browsers to support.', position: { column: 9, line: 3 }}],
        serverConfig: generateHTMLConfig('element')
    }
];

hintRunner.testHint(hintPath, featureVersionAddedFalseForAllTargetedBrowsers, { browserslist: ['firefox 62', 'and_ff 56', 'ie 11'], parsers: ['html']});

/* const elementAttrVersionAddedNull: HintTest[] = [
    {
        name: 'Element attributes that have version added as null should pass.',
        serverConfig: generateHTMLConfig('img-onerror')
    }
];

hintRunner.testHint(hintPath, elementAttrVersionAddedNull, { browserslist: ['last 2 Edge versions'], parsers: ['html']});

const elementAttrVersionAddedFalse: HintTest[] = [
    {
        name: 'Element attributes that have version added as false should fail.',
        reports: [{ message: 'srcset attribute of the img element is not supported on ie browser.', position: { column: 6, line: 1 }}],
        serverConfig: generateHTMLConfig('img-srcset')
    }
];

hintRunner.testHint(hintPath, elementAttrVersionAddedFalse, { browserslist: ['ie 9'], parsers: ['html']});
 */
/*
 * GLOBAL ATTRIBUTES
 */
const globalAttrVersionAddedNull: HintTest[] = [
    {
        name: 'Global attributes that have version added as null should pass.',
        serverConfig: generateHTMLConfig('global-attr-autocapitalize')
    }
];

hintRunner.testHint(hintPath, globalAttrVersionAddedNull, { browserslist: ['last 2 chrome versions'], parsers: ['html']});

const globalAttrVersionAddedFalse: HintTest[] = [
    {
        name: 'Global attributes that have version added as false should fail.',
        reports: [{ message: 'global attribute dropzone is not supported on edge, firefox, ie browsers.', position: { column: 9, line: 3 }}],
        serverConfig: generateHTMLConfig('global-attr-dropzone')
    }
];

hintRunner.testHint(hintPath, globalAttrVersionAddedFalse, { browserslist: ['last 2 edge versions', 'last 2 firefox versions', 'last 2 ie versions', 'Chrome 60'], parsers: ['html']});

const globalAttrAddedInVersionBeforeTargetedBrowserVersion: HintTest[] = [
    {
        name: 'Global attributes added in version before targeted browser should pass.',
        serverConfig: generateHTMLConfig('div')
    }
];

hintRunner.testHint(hintPath, globalAttrAddedInVersionBeforeTargetedBrowserVersion, { browserslist: ['firefox 34'], parsers: ['html']});

const globalAttrAddedVersionOfTargetedBrowser: HintTest[] = [
    {
        name: 'Global attributes added in version of targeted browser should pass.',
        serverConfig: generateHTMLConfig('div')
    }
];

hintRunner.testHint(hintPath, globalAttrAddedVersionOfTargetedBrowser, { browserslist: ['firefox 34'], parsers: ['html']});

const globalAttrAddedInVersionAfterTargetedBrowserVersion: HintTest[] = [
    {
        name: 'Global attributes added in version after targeted browser should fail.',
        reports: [{ message: 'global attribute class is not added on firefox 31 browser.', position: { column: 9, line: 3 }}],
        serverConfig: generateHTMLConfig('div')
    }
];

hintRunner.testHint(hintPath, globalAttrAddedInVersionAfterTargetedBrowserVersion, { browserslist: ['firefox 31'], parsers: ['html']}); 

/*
 * INPUT TYPES
 * Presently there are no input types that have been removed.
 */
/* const inputTypeVersionAddedNull: HintTest[] = [
    {
        name: 'Input types that have version added as null should pass.',
        serverConfig: generateHTMLConfig('input-color')
    }
];

hintRunner.testHint(hintPath, inputTypeVersionAddedNull, { browserslist: ['last 2 and_chr versions'], parsers: ['html']});

const inputTypeVersionAddedFalse: HintTest[] = [
    {
        name: 'Input types that have version added as false should fail.',
        reports: [{ message: 'input type color is not supported on ie browser.', position: { column: 14, line: 1 }}],
        serverConfig: generateHTMLConfig('input-color')
    }
];

hintRunner.testHint(hintPath, inputTypeVersionAddedFalse, { browserslist: ['ie 9'], parsers: ['html']});

const inputTypeVersionAddedAfterTargetedBrowsers: HintTest[] = [
    {
        name: 'Input types added in a version after the targeted browsers should fail.',
        reports: [{ message: 'input type color is not supported on chrome 19, firefox 28 browsers.', position: { column: 14, line: 1 }}],
        serverConfig: generateHTMLConfig('input-color')
    }
];

hintRunner.testHint(hintPath, inputTypeVersionAddedAfterTargetedBrowsers, { browserslist: ['chrome 19', 'firefox 28'], parsers: ['html']});
 */