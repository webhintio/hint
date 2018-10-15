import generateHTMLPage from 'hint/dist/src/lib/utils/misc/generate-html-page';
import { getHintPath } from 'hint/dist/src/lib/utils/hint-helpers';
import { HintTest } from '@hint/utils-tests-helpers/dist/src/hint-test-type';
import * as hintRunner from '@hint/utils-tests-helpers/dist/src/hint-runner';

const hintPath = getHintPath(__filename);

const generateMegaViewport = (content: string = 'WiDTh = deVicE-Width, IniTial-Scale= 1.0') => {
    return `<mEtA   NaMe="ViEwPort" cOnTenT="${content}">`;
};

const deviceWidthErrorMessage = `'viewport' meta element 'content' attribute value should contain 'width=device-width'.`;
const disallowedPropertyErrorMessage = `'viewport' meta element 'content' attribute value should not contain disallowed property 'user-scalable'.`;
const emptyContentErrorMessage = `'viewport' meta element should have non-empty 'content' attribute.`;
const initialScaleErrorMessage = `'viewport' meta element 'content' attribute value should contain 'initial-scale=1'.`;
const invalidPropertyErrorMessage = `'viewport' meta element 'content' attribute value should not contain invalid value 'x' for property 'height'.`;
const metaElementNotInHeadErrorMessage = `'viewport' meta element should be specified in the '<head>', not '<body>'.`;
const metaElementNotNeededErrorMessage = `'viewport' meta element is not needed as one was already specified.`;
const metaElementNotSpecifiedErrorMessage = `'viewport' meta element was not specified.`;
const unknownPropertyErrorMessage = `'viewport' meta element 'content' attribute value should not contain unknown property 'x'.`;

const testsForDefaults: Array<HintTest> = [
    {
        name: `Resource is not an HTML document`,
        serverConfig: { '/': { headers: { 'Content-Type': 'image/png' } } }
    },
    {
        name: `'viewport' meta element is not specified`,
        reports: [{ message: metaElementNotSpecifiedErrorMessage }],
        serverConfig: generateHTMLPage()
    },
    {
        name: `'viewport' meta element has no 'content' attribute`,
        reports: [{ message: emptyContentErrorMessage }],
        serverConfig: generateHTMLPage('<meta name="viewport">')
    },
    {
        name: `'viewport' meta element has 'content' attribute with no value`,
        reports: [{ message: emptyContentErrorMessage }],
        serverConfig: generateHTMLPage('<meta name="viewport" content>')
    },
    {
        name: `'viewport' meta element has 'content' attribute with the value of empty string`,
        reports: [{ message: emptyContentErrorMessage }],
        serverConfig: generateHTMLPage('<meta name="viewport" content="">')
    },
    {
        name: `'viewport' meta element has unknown property`,
        reports: [{ message: unknownPropertyErrorMessage }],
        serverConfig: generateHTMLPage(generateMegaViewport('width=device-width, initial-scale=1, x=y'))
    },
    {
        name: `'viewport' meta element has invalid value`,
        reports: [{ message: invalidPropertyErrorMessage }],
        serverConfig: generateHTMLPage(generateMegaViewport('width=device-width, initial-scale=1, height=x'))
    },
    {
        name: `'viewport' meta element has disallowed property`,
        reports: [{ message: disallowedPropertyErrorMessage }],
        serverConfig: generateHTMLPage(generateMegaViewport('width=device-width, initial-scale=1, user-scalable=no'))
    },
    {
        name: `'viewport' meta element has wrong 'width' value`,
        reports: [{ message: deviceWidthErrorMessage }],
        serverConfig: generateHTMLPage(generateMegaViewport('width=500, initial-scale=1'))
    },
    {
        name: `'viewport' meta element has wrong 'initial-scale' value`,
        reports: [{ message: initialScaleErrorMessage }],
        serverConfig: generateHTMLPage(generateMegaViewport('width=device-width, initial-scale=2'))
    },
    {
        name: `'viewport' meta element has correct value`,
        serverConfig: generateHTMLPage(generateMegaViewport())
    },
    {
        name: `'viewport' meta element has correct value with additional valid and allowed properties`,
        serverConfig: generateHTMLPage('<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover"')
    },
    {
        name: `Multiple meta 'viewport' elements are specified`,
        reports: [{ message: metaElementNotNeededErrorMessage }],
        serverConfig: generateHTMLPage(`${generateMegaViewport()}${generateMegaViewport()}`)
    },
    {
        name: `'viewport' meta element is specified in the '<body>'`,
        reports: [{ message: metaElementNotInHeadErrorMessage }],
        serverConfig: generateHTMLPage(undefined, generateMegaViewport())
    }
];

const testsForBrowsersWithOrientationChangeBug: Array<HintTest> = [
    {
        name: `'viewport' meta element does not have 'initial-scale' required by the targeted browsers`,
        reports: [{ message: initialScaleErrorMessage }],
        serverConfig: generateHTMLPage(generateMegaViewport('width=device-width'))
    }
];

const testsForBrowsersWithoutOrientationChangeBug: Array<HintTest> = [
    {
        name: `'viewport' meta element does not have 'initial-scale', but it's not required by the targeted browsers`,
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
