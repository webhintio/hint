import generateHTMLPage from 'hint/dist/src/lib/utils/misc/generate-html-page';
import { getHintPath } from 'hint/dist/src/lib/utils/hint-helpers';
import { HintTest } from '@hint/utils-tests-helpers/dist/src/hint-test-type';
import * as hintRunner from '@hint/utils-tests-helpers/dist/src/hint-runner';

const hintPath = getHintPath(__filename);

const generateMegaViewport = (content: string = 'WiDTh = deVicE-Width, IniTial-Scale= 1.0') => {
    return `<mEtA   NaMe="ViEwPort" cOnTenT="${content}">`;
};

const testsForDefaults: Array<HintTest> = [
    {
        name: `Resource is not an HTML document`,
        serverConfig: { '/': { headers: { 'Content-Type': 'image/png' } } }
    },
    {
        name: `'viewport' meta tag is not specified`,
        reports: [{ message: `No viewport meta tag was specified` }],
        serverConfig: generateHTMLPage()
    },
    {
        name: `'viewport' meta tag has no 'content' attribute`,
        reports: [{ message: `Meta tag should have non-empty 'content' attribute` }],
        serverConfig: generateHTMLPage('<meta name="viewport">')
    },
    {
        name: `'viewport' meta tag has 'content' attribute with no value`,
        reports: [{ message: `Meta tag should have non-empty 'content' attribute` }],
        serverConfig: generateHTMLPage('<meta name="viewport" content>')
    },
    {
        name: `'viewport' meta tag has 'content' attribute with the value of empty string`,
        reports: [{ message: `Meta tag should have non-empty 'content' attribute` }],
        serverConfig: generateHTMLPage('<meta name="viewport" content="">')
    },
    {
        name: `'viewport' meta tag has unknown property`,
        reports: [{ message: `Meta tag has unknown property: 'x'` }],
        serverConfig: generateHTMLPage(generateMegaViewport('width=device-width, initial-scale=1, x=y'))
    },
    {
        name: `'viewport' meta tag has invalid value`,
        reports: [{ message: `Meta tag has invalid value 'x' for property 'height'` }],
        serverConfig: generateHTMLPage(generateMegaViewport('width=device-width, initial-scale=1, height=x'))
    },
    {
        name: `'viewport' meta tag has disallowed property`,
        reports: [{ message: `Meta tag has disallowed property: 'user-scalable'` }],
        serverConfig: generateHTMLPage(generateMegaViewport('width=device-width, initial-scale=1, user-scalable=no'))
    },
    {
        name: `'viewport' meta tag has wrong 'width' value`,
        reports: [{ message: `Meta tag should have 'width=device-width'` }],
        serverConfig: generateHTMLPage(generateMegaViewport('width=500, initial-scale=1'))
    },
    {
        name: `'viewport' meta tag has wrong 'initial-scale' value`,
        reports: [{ message: `Meta tag should have 'initial-scale=1'` }],
        serverConfig: generateHTMLPage(generateMegaViewport('width=device-width, initial-scale=2'))
    },
    {
        name: `'viewport' meta tag has correct value`,
        serverConfig: generateHTMLPage(generateMegaViewport())
    },
    {
        name: `'viewport' meta tag has correct value with additional valid and allowed properties`,
        serverConfig: generateHTMLPage('<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover"')
    },
    {
        name: `Multiple meta 'viewport' tags are specified`,
        reports: [{ message: 'A viewport meta tag was already specified' }],
        serverConfig: generateHTMLPage(`${generateMegaViewport()}${generateMegaViewport()}`)
    },
    {
        name: `'viewport' meta tag is specified in the '<body>'`,
        reports: [{ message: `Meta tag should not be specified in the '<body>'` }],
        serverConfig: generateHTMLPage(null, generateMegaViewport())
    }
];

const testsForBrowsersWithOrientationChangeBug: Array<HintTest> = [
    {
        name: `'viewport' meta tag does not have 'initial-scale' required by the targeted browsers`,
        reports: [{ message: `Meta tag should have 'initial-scale=1'` }],
        serverConfig: generateHTMLPage(generateMegaViewport('width=device-width'))
    }
];

const testsForBrowsersWithoutOrientationChangeBug: Array<HintTest> = [
    {
        name: `'viewport' meta tag does not have 'initial-scale', but it's not required by the targeted browsers`,
        serverConfig: generateHTMLPage(generateMegaViewport('width=device-width'))
    }
];

hintRunner.testHint(hintPath, testsForDefaults);
hintRunner.testHint(hintPath, testsForBrowsersWithOrientationChangeBug, {
    browserslist: [
        'ios_saf 8', // Safari for iOS version that contains the orientation change bug.
        'ios_saf 9'
    ]
});
hintRunner.testHint(hintPath, testsForBrowsersWithoutOrientationChangeBug, {
    browserslist: [
        'edge 15',
        'ios_saf 9',
        'ios_saf 10'
    ]
});
