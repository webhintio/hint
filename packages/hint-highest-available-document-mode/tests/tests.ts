import { Severity } from '@hint/utils-types';
import { generateHTMLPage } from '@hint/utils-create-server';
import { getHintPath, HintTest, testHint } from '@hint/utils-tests-helpers';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const hintPath = getHintPath(__filename);

const metaElement = '<meta http-equiv="x-ua-compatible" content="ie=edge">';

const generateHTMLPageWithMetaElement = (metaElementValue: string = 'iE=eDgE') => {
    return generateHTMLPage(`<MEtA hTTp-EqUIv="X-Ua-CompATible" ConTenT="${metaElementValue}">`);
};

const page = generateHTMLPage();

// Error messages.

const incorrectHeaderValueErrorMessage = `The 'x-ua-compatible' header value should be 'ie=edge'.`;
const incorrectContentAttributeValueErrorMessage = `The 'x-ua-compatible' meta element 'content' attribute value should be 'ie=edge'.`;
const metaElementAlreadySpecifiedErrorMessage = `The 'x-ua-compatible' meta element is not needed as one was already specified.`;
const metaElementIsNotInHeadErrorMessage = `The 'x-ua-compatible' meta element should be specified in the '<head>', not '<body>'.`;
const metaElementIsNotNeededErrorMessage = `The 'x-ua-compatible' meta element should not be specified as it is not needed.`;
const metaElementIsNotSpecifiedErrorMessage = `The 'x-ua-compatible' meta element should be specified.`;
const metaElementSpecifiedAfterOtherElementsErrorMessage = `The 'x-ua-compatible' meta element should be specified before all other elements except for '<title>' and other '<meta>' elements.`;
const metaElementUsageDiscouragedErrorMessage = `The 'x-ua-compatible' meta element should not be specified. An equivalent HTTP header should be used instead.`;
const noHeaderErrorMessage = `Response should include 'x-ua-compatible' header.`;
const unneededHeaderErrorMessage = `Response should not include unneeded 'x-ua-compatible' header.`;

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const testsForNonDocumentModeBrowsers: HintTest[] = [
    {
        name: `HTML page is served with 'X-UA-Compatible' header but the targeted browsers don't support document modes`,
        reports: [{
            message: unneededHeaderErrorMessage,
            severity: Severity.hint
        }],
        serverConfig: {
            '/': {
                content: page,
                headers: { 'X-UA-Compatible': 'ie=edge' }
            }
        }
    },
    {
        name: `'X-UA-Compatible' meta element is not specified but the targeted browsers don't support document modes`,
        reports: [{
            message: metaElementIsNotNeededErrorMessage,
            severity: Severity.hint
        }],
        serverConfig: { '/': { content: generateHTMLPageWithMetaElement() } }
    },
    {
        name: `Resource is not an HTML document`,
        serverConfig: { '/': { headers: { 'Content-Type': 'image/png' } } }
    }
];

const testsForHeaders: HintTest[] = [
    {
        name: `HTML page is served without 'X-UA-Compatible' header`,
        reports: [{
            message: noHeaderErrorMessage,
            severity: Severity.hint
        }],
        serverConfig: { '/': page }
    },
    {
        name: `HTML page is served with 'X-UA-Compatible' header with a value different than 'ie=edge'`,
        reports: [{
            message: incorrectHeaderValueErrorMessage,
            severity: Severity.error

        }],
        serverConfig: {
            '/': {
                content: page,
                headers: { 'X-UA-Compatible': 'IE=7,9,10' }
            }
        }
    },
    {
        name: `HTML page is served with 'X-UA-Compatible' header with the value 'ie=edge'`,
        serverConfig: {
            '/': {
                content: page,
                headers: { 'X-ua-Compatible': 'iE=EdGe' }
            }
        }
    },
    {
        name: `HTML page is served with 'X-UA-Compatible' header and the meta element`,
        reports: [{
            message: metaElementUsageDiscouragedErrorMessage,
            severity: Severity.hint
        }],
        serverConfig: {
            '/': {
                content: generateHTMLPageWithMetaElement(),
                headers: { 'X-UA-Compatible': 'ie=edge' }
            }
        }
    }
];

const testsForRequireMetaElementConfig: HintTest[] = [
    {
        name: `'X-UA-Compatible' meta element is not specified`,
        reports: [{
            message: metaElementIsNotSpecifiedErrorMessage,
            severity: Severity.error

        }],
        serverConfig: { '/': page }
    },
    {
        name: `'X-UA-Compatible' meta element is specified with the value of 'ie=edge'`,
        serverConfig: generateHTMLPageWithMetaElement()
    },
    {
        name: `'X-UA-Compatible' meta element is specified with no 'content' attribute`,
        reports: [{
            message: incorrectContentAttributeValueErrorMessage,
            severity: Severity.error
        }],
        serverConfig: generateHTMLPage('<meta http-equiv="x-ua-compatible">')
    },
    {
        name: `'X-UA-Compatible' meta element is specified with an empty 'content' attribute`,
        reports: [{
            message: incorrectContentAttributeValueErrorMessage,
            severity: Severity.error
        }],
        serverConfig: generateHTMLPage('<meta http-equiv="x-ua-compatible" content>')
    },
    {
        name: `'X-UA-Compatible' meta element is specified with a value different than 'ie=edge'`,
        reports: [{
            message: incorrectContentAttributeValueErrorMessage,
            severity: Severity.error
        }],
        serverConfig: generateHTMLPageWithMetaElement('IE=7,8 ,9')
    },
    {
        name: `'X-UA-Compatible' meta element is specified in the '<body>'`,
        reports: [{
            message: metaElementIsNotInHeadErrorMessage,
            severity: Severity.error
        }],
        serverConfig: generateHTMLPage(undefined, `${metaElement}`)
    },
    {
        name: `'X-UA-Compatible' meta element is specified in the '<head>' but is not included before all other elements except for the '<title>' and the other '<meta>' elements`,
        reports: [{
            message: metaElementSpecifiedAfterOtherElementsErrorMessage,
            severity: Severity.error
        }],
        serverConfig: generateHTMLPage(`<meta charset="utf-8"><title>test</title><script src="test.js"></script>${metaElement}`)
    },
    {
        name: `Multiple 'X-UA-Compatible' meta elements are specified`,
        reports: [{
            message: metaElementAlreadySpecifiedErrorMessage,
            severity: Severity.warning
        }],
        serverConfig: generateHTMLPage(`${metaElement}${metaElement}`)
    },
    {
        name: `'X-UA-Compatible' meta element is specified and HTML page is served with 'X-UA-Compatible header'`,
        serverConfig: {
            '/': {
                content: generateHTMLPageWithMetaElement(),
                headers: { 'X-UA-Compatible': 'ie=edge' }
            }
        }
    }
];

testHint(hintPath, testsForNonDocumentModeBrowsers, { browserslist: ['ie >= 11', 'chrome >= 50', 'edge >= 13', 'firefox >= 45'] });
testHint(hintPath, testsForRequireMetaElementConfig, {
    browserslist: ['ie 8'],
    hintOptions: { requireMetaElement: true }
});
testHint(hintPath, testsForHeaders, { browserslist: ['ie 8'] });
