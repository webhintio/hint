import { generateHTMLPage } from '@hint/utils-create-server';
import { getHintPath, HintTest, testHint } from '@hint/utils-tests-helpers';
import { Severity } from '@hint/utils-types';

const hintPath = getHintPath(__filename);

const generateMegaViewport = (content: string = 'WiDTh = deVicE-Width, IniTial-Scale= 1.0') => {
    return `<mEtA   NaMe="ViEwPort" cOnTenT="${content}">`;
};

const deviceWidthErrorMessage = `The 'viewport' meta element 'content' attribute value should contain 'width=device-width'.`;
const disallowedPropertyErrorMessage = `The 'viewport' meta element 'content' attribute value should not contain 'user-scalable'.`;
const emptyContentErrorMessage = `The 'viewport' meta element should have a non-empty 'content' attribute.`;
const initialScaleErrorMessage = `The 'viewport' meta element 'content' attribute value should contain 'initial-scale=1'.`;
const invalidPropertyErrorMessage = `The 'viewport' meta element 'content' attribute value should contain a valid value for 'height'.`;
const metaElementNotInHeadErrorMessage = `The 'viewport' meta element should be specified in the '<head>', not '<body>'.`;
const metaElementNotNeededErrorMessage = `A 'viewport' meta element is not needed as one was already specified.`;
const metaElementNotSpecifiedErrorMessage = `A 'viewport' meta element was not specified.`;
const unknownPropertyErrorMessage = `The 'viewport' meta element 'content' attribute value should not contain unknown property 'x'.`;

const testsForDefaults: HintTest[] = [
    {
        name: `Resource is not an HTML document`,
        serverConfig: { '/': { headers: { 'Content-Type': 'image/png' } } }
    },
    {
        name: `'viewport' meta element is not specified`,
        reports: [{
            message: metaElementNotSpecifiedErrorMessage,
            severity: Severity.error
        }],
        serverConfig: generateHTMLPage()
    },
    {
        name: `'viewport' meta element has no 'content' attribute`,
        reports: [{
            message: emptyContentErrorMessage,
            severity: Severity.error
        }],
        serverConfig: generateHTMLPage('<meta name="viewport">')
    },
    {
        name: `'viewport' meta element has 'content' attribute with no value`,
        reports: [{
            message: emptyContentErrorMessage,
            severity: Severity.error
        }],
        serverConfig: generateHTMLPage('<meta name="viewport" content>')
    },
    {
        name: `'viewport' meta element has 'content' attribute with the value of empty string`,
        reports: [{
            message: emptyContentErrorMessage,
            severity: Severity.error
        }],
        serverConfig: generateHTMLPage('<meta name="viewport" content="">')
    },
    {
        name: `'viewport' meta element has unknown property`,
        reports: [{
            message: unknownPropertyErrorMessage,
            severity: Severity.warning
        }],
        serverConfig: generateHTMLPage(generateMegaViewport('width=device-width, initial-scale=1, x=y'))
    },
    {
        name: `'viewport' meta element has invalid value`,
        reports: [{
            message: invalidPropertyErrorMessage,
            severity: Severity.error
        }],
        serverConfig: generateHTMLPage(generateMegaViewport('width=device-width, initial-scale=1, height=x'))
    },
    {
        name: `'viewport' meta element has disallowed property`,
        reports: [{
            message: disallowedPropertyErrorMessage,
            severity: Severity.error
        }],
        serverConfig: generateHTMLPage(generateMegaViewport('width=device-width, initial-scale=1, user-scalable=no'))
    },
    {
        name: `'viewport' meta element has wrong 'width' value`,
        reports: [{
            message: deviceWidthErrorMessage,
            severity: Severity.error
        }],
        serverConfig: generateHTMLPage(generateMegaViewport('width=500, initial-scale=1'))
    },
    {
        name: `'viewport' meta element has wrong 'initial-scale' value`,
        reports: [{
            message: initialScaleErrorMessage,
            severity: Severity.error
        }],
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
        reports: [{
            message: metaElementNotNeededErrorMessage,
            severity: Severity.warning
        }],
        serverConfig: generateHTMLPage(`${generateMegaViewport()}${generateMegaViewport()}`)
    },
    {
        name: `'viewport' meta element is specified in the '<body>'`,
        reports: [{
            message: metaElementNotInHeadErrorMessage,
            severity: Severity.error
        }],
        serverConfig: generateHTMLPage(undefined, generateMegaViewport())
    }
];

const testsForBrowsersWithOrientationChangeBug: HintTest[] = [
    {
        name: `'viewport' meta element does not have 'initial-scale' required by the targeted browsers`,
        reports: [{
            message: initialScaleErrorMessage,
            severity: Severity.error
        }],
        serverConfig: generateHTMLPage(generateMegaViewport('width=device-width'))
    }
];

const testsForBrowsersWithoutOrientationChangeBug: HintTest[] = [
    {
        name: `'viewport' meta element does not have 'initial-scale', but it's not required by the targeted browsers`,
        serverConfig: generateHTMLPage(generateMegaViewport('width=device-width'))
    }
];

testHint(hintPath, testsForDefaults);
testHint(hintPath, testsForBrowsersWithOrientationChangeBug, {
    browserslist: [
        'ios_saf 8', // Safari for iOS version that contains the orientation change bug.
        'ios_saf 9'
    ]
});
testHint(hintPath, testsForBrowsersWithoutOrientationChangeBug, {
    browserslist: [
        'edge 15',
        'ios_saf 9',
        'ios_saf 10'
    ]
});
