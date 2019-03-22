import { getHintPath } from 'hint/dist/src/lib/utils/hint-helpers';
import generateHTMLPage from 'hint/dist/src/lib/utils/misc/generate-html-page';
import readFile from 'hint/dist/src/lib/utils/fs/read-file';
import { HintTest } from '@hint/utils-tests-helpers/dist/src/hint-test-type';
import * as hintRunner from '@hint/utils-tests-helpers/dist/src/hint-runner';

import { ignoredConnectors } from './_ignored-connectors';

const hintPath = getHintPath(__filename, true);

const generateHTMLConfig = (fileName: string) => {
    const path = 'fixtures/html';
    const htmlFile = readFile(`${__dirname}/${path}/${fileName}.html`);

    return { '/': generateHTMLPage(undefined, htmlFile) };
};

/*
 * Tests for html features that were removed / deprecated.
 * More information about how `hintRunner` can be configured is
 * available in:
 * https://webhint.io/docs/contributor-guide/how-to/test-hints/
 */

const elementNeverRemoved: HintTest[] = [
    {
        name: 'Elements that were never removed should pass.',
        serverConfig: generateHTMLConfig('div')
    }
];

hintRunner.testHint(hintPath, elementNeverRemoved, { browserslist: ['> 1%'], ignoredConnectors });

const elementAttrNeverRemoved: HintTest[] = [
    {
        name: 'Element attributes that were never removed should pass.',
        serverConfig: generateHTMLConfig('form-method')
    }
];

hintRunner.testHint(hintPath, elementAttrNeverRemoved, { browserslist: ['> 1%'], ignoredConnectors });

const removedForFlags: HintTest[] = [
    {
        name: 'Elements removed from versions requiring flags should pass.',
        serverConfig: generateHTMLConfig('picture')
    }
];

hintRunner.testHint(hintPath, removedForFlags, { browserslist: ['firefox 34'], ignoredConnectors });

const onlySupportedByFlags: HintTest[] = [
    {
        name: 'Elements only supported by flags should fail.',
        reports: [{ message: 'shadow element is not supported by firefox 60.', position: { match: 'shadow' } }],
        serverConfig: generateHTMLConfig('shadow')
    }
];

hintRunner.testHint(hintPath, onlySupportedByFlags, { browserslist: ['firefox 60'], ignoredConnectors });

const elementRemovedVersionLaterThanTargetedBrowser: HintTest[] = [
    {
        name: 'Elements that were removed in a version later than the targeted browser should pass.',
        serverConfig: generateHTMLConfig('blink')
    }
];

hintRunner.testHint(hintPath, elementRemovedVersionLaterThanTargetedBrowser, { browserslist: ['firefox 20'], ignoredConnectors });

const elementRemovedVersionOfTargetedBrowser: HintTest[] = [
    {
        name: 'Elements that were removed the version of the targeted browser should fail.',
        reports: [{ message: 'blink element is not supported by firefox 22.' }],
        serverConfig: generateHTMLConfig('blink')
    }
];

hintRunner.testHint(hintPath, elementRemovedVersionOfTargetedBrowser, { browserslist: ['firefox 22'], ignoredConnectors });

const elementRemovedVersionEarlierThanMultipleTargetedBrowser: HintTest[] = [
    {
        name: 'Elements that were removed in a version before the targeted browser should fail.',
        reports: [{ message: 'blink element is not supported by firefox 24-26.' }],
        serverConfig: generateHTMLConfig('blink')
    }
];

hintRunner.testHint(hintPath, elementRemovedVersionEarlierThanMultipleTargetedBrowser, { browserslist: ['firefox 24 - 26'], ignoredConnectors });

const elementRemovedVersionEarlierThanTargetedBrowser: HintTest[] = [
    {
        name: 'Elements that were removed in a version before the targeted browsers should fail with one error.',
        reports: [{ message: 'blink element is not supported by any of your target browsers.' }],
        serverConfig: generateHTMLConfig('blink')
    }
];

hintRunner.testHint(hintPath, elementRemovedVersionEarlierThanTargetedBrowser, { browserslist: ['firefox 23', 'opera 16'], ignoredConnectors });

const elementVersionAddedFalse: HintTest[] = [
    {
        name: 'Elements that have version added as false should fail.',
        reports: [{ message: 'blink element is not supported by chrome.', position: { match: 'blink' } }],
        serverConfig: generateHTMLConfig('blink')
    }
];

hintRunner.testHint(hintPath, elementVersionAddedFalse, { browserslist: ['last 2 Chrome versions'], ignoredConnectors });

const featureVersionAddedFalseForAllTargetedBrowsers: HintTest[] = [
    {
        name: 'Features with no support (version added is false) for multiple targeted browsers should fail.',
        reports: [{ message: 'element element is not supported by any of your target browsers.', position: { match: 'element' } }],
        serverConfig: generateHTMLConfig('element')
    }
];

hintRunner.testHint(hintPath, featureVersionAddedFalseForAllTargetedBrowsers, { browserslist: ['firefox 62', 'and_ff 56', 'ie 11'], ignoredConnectors });

const elementVersionAddedFalseForMultipleBrowsers: HintTest[] = [
    {
        name: 'Elements that have version added as false for multiple browsers should fail with one error.',
        reports: [{ message: 'blink element is not supported by chrome, edge, ie.', position: { match: 'blink' } }],
        serverConfig: generateHTMLConfig('blink')
    }
];

hintRunner.testHint(hintPath, elementVersionAddedFalseForMultipleBrowsers, { browserslist: ['chrome 43', 'last 2 Edge versions', 'last 2 ie versions', 'opera 12'], ignoredConnectors });

const featureVersionAddedMixedFalseAndNullForDifferentBrowsers: HintTest[] = [
    {
        name: 'Features with unknown support (version added is null) and no support (version added is false) for different browsers should fail for unsupported browsers.',
        reports: [{ message: 'element element is not supported by edge, firefox_android.', position: { match: 'element' } }],
        serverConfig: generateHTMLConfig('element')
    }
];

hintRunner.testHint(hintPath, featureVersionAddedMixedFalseAndNullForDifferentBrowsers, { browserslist: ['edge 18', 'chrome 45', 'and_ff 56'], ignoredConnectors });

const elementAttrRemovedVersionLaterThanTargetedBrowser: HintTest[] = [
    {
        name: 'Element attributes that were removed in a version later than the targeted browser should pass.',
        serverConfig: generateHTMLConfig('style-scoped')
    }
];

hintRunner.testHint(hintPath, elementAttrRemovedVersionLaterThanTargetedBrowser, { browserslist: ['firefox 52'], ignoredConnectors });

const elementAttrRemovedVersionOfTargetedBrowser: HintTest[] = [
    {
        name: 'Element attributes that were removed the version of the targeted browser should fail.',
        reports: [{ message: 'scoped attribute of the style element is not supported by firefox 55.' }],
        serverConfig: generateHTMLConfig('style-scoped')
    }
];

hintRunner.testHint(hintPath, elementAttrRemovedVersionOfTargetedBrowser, { browserslist: ['firefox 55'], ignoredConnectors });

const elementAttrRemovedVersionEarlierThanTargetedBrowser: HintTest[] = [
    {
        name: 'Element attributes that were removed in a version before the targeted browser should fail.',
        reports: [{ message: 'scoped attribute of the style element is not supported by firefox 56.' }],
        serverConfig: generateHTMLConfig('style-scoped')
    }
];

hintRunner.testHint(hintPath, elementAttrRemovedVersionEarlierThanTargetedBrowser, { browserslist: ['firefox 56'], ignoredConnectors });

/*
 * GLOBAL ATTRIBUTES
 */
const globalAttributeNeverRemoved: HintTest[] = [
    {
        name: 'Global attributes that were never removed should pass.',
        serverConfig: generateHTMLConfig('div')
    }
];

hintRunner.testHint(hintPath, globalAttributeNeverRemoved, { browserslist: ['> 1%'], ignoredConnectors });

/*
 * FIXME: Browserlist doesn't have the whole list of browsers,
 * so for firefox android is always returning the 63th version.
 * This is a problem because the test only make sense for the
 * contextmenu attribute.
 * https://github.com/mdn/browser-compat-data/blob/master/html/global_attributes.json
 */

/*
 * const globalAttributeRemovedLaterThanTargetedBrowser: HintTest[] = [
 *     {
 *         name: 'Global attributes that were removed after the targeted browsers should pass',
 *         serverConfig: generateHTMLConfig('global-attr-contextmenu')
 *     }
 * ];
 *
 * hintRunner.testHint(hintPath, globalAttributeRemovedLaterThanTargetedBrowser, { browserslist: ['and_ff 55'] });
 *
 * const globalAttributeRemovedVersionOfTargetedBrowser: HintTest[] = [
 *     {
 *         name: 'Global attributes that were removed the version of the targeted browser should fail',
 *         reports: [{ message: 'global attribute contextmenu is not supported by firefox_android 56.'}],
 *         serverConfig: generateHTMLConfig('global-attr-contextmenu')
 *     }
 * ];
 *
 * hintRunner.testHint(hintPath, globalAttributeRemovedVersionOfTargetedBrowser, { browserslist: ['and_ff 56'] });
 *
 * const globalAttributeRemovedEarlierThanTargetedBrowser: HintTest[] = [
 *     {
 *         name: 'Global attributes that were removed before the targeted browsers should fail',
 *         reports: [{ message: 'global attribute contextmenu is not supported by firefox_android 57.'}],
 *         serverConfig: generateHTMLConfig('global-attr-contextmenu')
 *     }
 * ];
 *
 * hintRunner.testHint(hintPath, globalAttributeRemovedEarlierThanTargetedBrowser, { browserslist: ['and_ff 57'] });
 */

/*
 * INPUT TYPES
 * Presently there are no input types that have been removed.
 */
const inputTypeNeverRemoved: HintTest[] = [
    {
        name: 'Input types that were never removed should pass.',
        serverConfig: generateHTMLConfig('input-button')
    }
];

hintRunner.testHint(hintPath, inputTypeNeverRemoved, { browserslist: ['> 1%'], ignoredConnectors });

const mixedFeaturedCompatibility: HintTest[] = [
    {
        name: 'Features with mixed compatibility (version added null vs false) but deprecated should pass.',
        serverConfig: generateHTMLConfig('link-integrity')
    }
];

hintRunner.testHint(hintPath, mixedFeaturedCompatibility, { browserslist: ['edge 15', 'ie 10', 'safari 11', 'ios_saf 11', 'samsung 4', 'android 4'], ignoredConnectors });
