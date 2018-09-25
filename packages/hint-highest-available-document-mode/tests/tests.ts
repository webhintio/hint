/* eslint sort-keys: 0 */

import generateHTMLPage from 'hint/dist/src/lib/utils/misc/generate-html-page';
import { getHintPath } from 'hint/dist/src/lib/utils/hint-helpers';
import { HintTest } from '@hint/utils-tests-helpers/dist/src/hint-test-type';
import * as hintRunner from '@hint/utils-tests-helpers/dist/src/hint-runner';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const hintPath = getHintPath(__filename);

const metaElement = '<meta http-equiv="x-ua-compatible" content="ie=edge">';

const generateHTMLPageWithMetaElement = (metaElementValue: string = 'iE=eDgE') => {
    return generateHTMLPage(`<MEtA hTTp-EqUIv="X-Ua-CompATible" ConTenT="${metaElementValue}">`);
};

// Error messages.

const incorrectHeaderValueErrorMessage = `'x-ua-compatible' header value should be 'ie=edge', not 'IE=7,9,10'.`;
const metaElementAlreadySpecifiedErrorMessage = `'x-ua-compatible' meta element is not needed as one was already specified.`;
const metaElementIsNotInHeadErrorMessage = `'x-ua-compatible' meta element should be specified in the '<head>', not '<body>'.`;
const metaElementIsNotNeededErrorMessage = `'x-ua-compatible' meta element should not be specified as it is not needed.`;
const metaElementIsNotSpecifiedErrorMessage = `'x-ua-compatible' meta element should be specified.`;
const metaElementSpecifiedAfterOtherElementsErrorMessage = `'x-ua-compatible' meta element should be specified before all other elements except for '<title>' and other '<meta>' elements.`;
const metaElementUsageDiscouragedErrorMessage = `'x-ua-compatible' meta element should not be specified, and instead, equivalent HTTP header should be used.`;
const noHeaderErrorMessage = `Response should include 'x-ua-compatible' header.`;
const unneededHeaderErrorMessage = `Response should not include unneeded 'x-ua-compatible' header.`;

const generateIncorrectContentAttributeValueErrorMessage = (contentAttributeValue: string) => {
    return `'x-ua-compatible' meta element 'content' attribute value should be 'ie=edge', not '${contentAttributeValue}'.`;
};

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const testsForNonDocumentModeBrowsers: Array<HintTest> = [
    {
        name: `HTML page is served with 'X-UA-Compatible' header but the targeted browsers don't support document modes`,
        reports: [{ message: unneededHeaderErrorMessage }],
        serverConfig: { '/': { headers: { 'X-UA-Compatible': 'ie=edge' } } }
    },
    {
        name: `'X-UA-Compatible' meta element is not specified but the targeted browsers don't support document modes`,
        reports: [{ message: metaElementIsNotNeededErrorMessage }],
        serverConfig: { '/': { content: generateHTMLPageWithMetaElement() } }
    },
    {
        name: `Resource is not an HTML document`,
        serverConfig: { '/': { headers: { 'Content-Type': 'image/png' } } }
    }
];

const testsForHeaders: Array<HintTest> = [
    {
        name: `HTML page is served without 'X-UA-Compatible' header`,
        reports: [{ message: noHeaderErrorMessage }],
        serverConfig: { '/': '' }
    },
    {
        name: `HTML page is served with 'X-UA-Compatible' header with a value different than 'ie=edge'`,
        reports: [{ message: incorrectHeaderValueErrorMessage }],
        serverConfig: { '/': { headers: { 'X-UA-Compatible': 'IE=7,9,10' } } }
    },
    {
        name: `HTML page is served with 'X-UA-Compatible' header with the value 'ie=edge'`,
        serverConfig: { '/': { headers: { 'X-ua-Compatible': 'iE=EdGe' } } }
    },
    {
        name: `HTML page is served with 'X-UA-Compatible' header and the meta element`,
        reports: [{ message: metaElementUsageDiscouragedErrorMessage }],
        serverConfig: {
            '/': {
                content: generateHTMLPageWithMetaElement(),
                headers: { 'X-UA-Compatible': 'ie=edge' }
            }
        }
    }
];

const testsForRequireMetaElementConfig: Array<HintTest> = [
    {
        name: `'X-UA-Compatible' meta element is not specified`,
        reports: [{ message: metaElementIsNotSpecifiedErrorMessage }],
        serverConfig: { '/': '' }
    },
    {
        name: `'X-UA-Compatible' meta element is specified with the value of 'ie=edge'`,
        serverConfig: generateHTMLPageWithMetaElement()
    },
    {
        name: `'X-UA-Compatible' meta element is specified with no 'content' attribute`,
        reports: [{ message: generateIncorrectContentAttributeValueErrorMessage('') }],
        serverConfig: generateHTMLPage('<meta http-equiv="x-ua-compatible">')
    },
    {
        name: `'X-UA-Compatible' meta element is specified with an empty 'content' attribute`,
        reports: [{ message: generateIncorrectContentAttributeValueErrorMessage('') }],
        serverConfig: generateHTMLPage('<meta http-equiv="x-ua-compatible" content>')
    },
    {
        name: `'X-UA-Compatible' meta element is specified with a value different than 'ie=edge'`,
        reports: [{ message: generateIncorrectContentAttributeValueErrorMessage('IE=7,8 ,9') }],
        serverConfig: generateHTMLPageWithMetaElement('IE=7,8 ,9')
    },
    {
        name: `'X-UA-Compatible' meta element is specified in the '<body>'`,
        reports: [{ message: metaElementIsNotInHeadErrorMessage }],
        serverConfig: generateHTMLPage(undefined, `${metaElement}`)
    },
    {
        name: `'X-UA-Compatible' meta element is specified in the '<head>' but is not included before all other elements except for the '<title>' and the other '<meta>' elements`,
        reports: [{ message: metaElementSpecifiedAfterOtherElementsErrorMessage }],
        serverConfig: generateHTMLPage(`<meta charset="utf-8"><title>test</title><script src="test.js"></script>${metaElement}`)
    },
    {
        name: `Multiple 'X-UA-Compatible' meta elements are specified`,
        reports: [{ message: metaElementAlreadySpecifiedErrorMessage }],
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

hintRunner.testHint(hintPath, testsForNonDocumentModeBrowsers, { browserslist: ['ie >= 11', 'chrome >= 50', 'edge >= 13', 'firefox >= 45'] });
hintRunner.testHint(hintPath, testsForRequireMetaElementConfig, {
    browserslist: ['ie 8'],
    hintOptions: { requireMetaElement: true }
});
hintRunner.testHint(hintPath, testsForHeaders, { browserslist: ['ie 8'] });
