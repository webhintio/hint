import * as fs from 'fs';

import generateHTMLPage from 'hint/dist/src/lib/utils/misc/generate-html-page';
import { getHintPath } from 'hint/dist/src/lib/utils/hint-helpers';
import { HintTest } from '@hint/utils-tests-helpers/dist/src/hint-test-type';
import * as hintRunner from '@hint/utils-tests-helpers/dist/src/hint-runner';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const hintPath = getHintPath(__filename);

// Images

const appleTouchIconLinkTag = '<link rel="apple-touch-icon" href="/apple-touch-icon.png">';
const defaultImage = fs.readFileSync(`${__dirname}/fixtures/apple-touch-icon.png`); // eslint-disable-line no-sync
const imageThatIsNotSquare = fs.readFileSync(`${__dirname}/fixtures/not-square.png`); // eslint-disable-line no-sync
const imageWithIncorrectDimensions = fs.readFileSync(`${__dirname}/fixtures/incorrect-dimensions.png`); // eslint-disable-line no-sync
const imageWithIncorrectFileFormat = fs.readFileSync(`${__dirname}/fixtures/incorrect-file-format.png`); // eslint-disable-line no-sync

// Error messages

const elementAlreadySpecifiedErrorMessage = `'apple-touch-icon' link element is not needed as one was already specified.`;
const elementHasEmptyHrefAttributeErrorMessage = `'apple-touch-icon' link element should have non-empty 'href' attribute.`;
const elementHasIncorrectRelAttributeErrorMessage = `'apple-touch-icon' link element should have 'rel="apple-touch-icon".`;
const elementHasUnneededSizesAttributeErrorMessage = `'apple-touch-icon' link element should not have 'sizes' attribute.`;
const elementNotSpecifiedErrorMessage = `'apple-touch-icon' link element was not specified.`;
const elementNotSpecifiedInHeadErrorMessage = `'apple-touch-icon' link element should be specified in the '<head>'.`;
const fileCouldNotBeFetchedErrorMessage = `'/apple-touch-icon.png' could not be fetched (status code: 404).`;
const fileHasIncorrectSizeErrorMessage =`'/apple-touch-icon.png' should be 180x180px.`;
const fileIsInvalidPNGErrorMessage = `'/apple-touch-icon.png' should be a valid PNG image.`;
const fileIsNotPNGErrorMessage = `'/apple-touch-icon.png' should be a PNG image.`;
const fileRequestFailedErrorMessage = `'/apple-touch-icon.png' could not be fetched (request failed).`;

const generateImageData = (content: Buffer = defaultImage): Object => {
    return {
        content,
        headers: { 'Content-Type': 'image/png' }
    };
};

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const tests: Array<HintTest> = [
    {
        name: `Resource is not an HTML document`,
        serverConfig: { '/': { headers: { 'Content-Type': 'image/png' } } }
    },
    {
        name: `'apple-touch-icon' is not specified`,
        reports: [{ message: elementNotSpecifiedErrorMessage }],
        serverConfig: generateHTMLPage('<link>')
    },
    {
        name: `'apple-touch-icon' has 'rel="apple-touch-icon-precomposed"`,
        reports: [{ message: elementHasIncorrectRelAttributeErrorMessage }],
        serverConfig: {
            '/': generateHTMLPage('<link rel="apple-touch-icon-precomposed" href="/apple-touch-icon-precomposed.png">'),
            '/apple-touch-icon-precomposed.png': generateImageData()
        }
    },
    {
        name: `'apple-touch-icon' has 'rel="apple-touch-icon-precomposed apple-touch-icon"`,
        reports: [{ message: elementHasIncorrectRelAttributeErrorMessage }],
        serverConfig: {
            '/': generateHTMLPage('<link rel="apple-touch-icon-precomposed apple-touch-icon" href="/apple-touch-icon-precomposed.png">'),
            '/apple-touch-icon-precomposed.png': generateImageData()
        }
    },
    {
        name: `'apple-touch-icon' has no 'href' attribute`,
        reports: [{ message: elementHasEmptyHrefAttributeErrorMessage }],
        serverConfig: generateHTMLPage('<link rel="apple-touch-icon">')
    },
    {
        name: `'apple-touch-icon' has 'href' attribute with no value`,
        reports: [{ message: elementHasEmptyHrefAttributeErrorMessage }],
        serverConfig: generateHTMLPage('<link rel="apple-touch-icon" href>')
    },
    {
        name: `'apple-touch-icon' has 'href' attribute with the value of empty string`,
        reports: [{ message: elementHasEmptyHrefAttributeErrorMessage }],
        serverConfig: generateHTMLPage('<link rel="apple-touch-icon" href="">')
    },
    {
        name: `'apple-touch-icon' is used correctly`,
        serverConfig: {
            '/': generateHTMLPage('<LINk ReL="  APPLE-touch-ICON" HrEf="/apple-touch-icon.png">'),
            '/apple-touch-icon.png': generateImageData()
        }
    },
    {
        name: `'apple-touch-icon' has 'sizes' attribute`,
        reports: [{ message: elementHasUnneededSizesAttributeErrorMessage }],
        serverConfig: {
            '/': generateHTMLPage('<link rel="  apple-touch-icon " Sizes="57x57" href="/apple-touch-icon.png">'),
            '/apple-touch-icon.png': generateImageData()
        }
    },
    {
        name: `'apple-touch-icon' is not PNG`,
        reports: [{ message: fileIsNotPNGErrorMessage }],
        serverConfig: {
            '/': generateHTMLPage(appleTouchIconLinkTag),
            '/apple-touch-icon.png': generateImageData(imageWithIncorrectFileFormat)
        }
    },
    {
        name: `'apple-touch-icon' is not an image`,
        reports: [{ message: fileIsInvalidPNGErrorMessage }],
        serverConfig: {
            '/': generateHTMLPage(appleTouchIconLinkTag),
            '/apple-touch-icon.png': generateHTMLPage()
        }
    },
    {
        name: `'apple-touch-icon' is not 180x180px`,
        reports: [{ message: fileHasIncorrectSizeErrorMessage }],
        serverConfig: {
            '/': generateHTMLPage(appleTouchIconLinkTag),
            '/apple-touch-icon.png': generateImageData(imageWithIncorrectDimensions)
        }
    },
    {
        name: `'apple-touch-icon' is not 180x180px and it's also not square`,
        reports: [{ message: fileHasIncorrectSizeErrorMessage }],
        serverConfig: {
            '/': generateHTMLPage(appleTouchIconLinkTag),
            '/apple-touch-icon.png': generateImageData(imageThatIsNotSquare)
        }
    },
    {
        name: `'apple-touch-icon' could not be fetched`,
        reports: [{ message: fileCouldNotBeFetchedErrorMessage }],
        serverConfig: {
            '/': generateHTMLPage(appleTouchIconLinkTag),
            '/apple-touch-icon.png': { status: 404 }
        }
    },
    {
        name: `'apple-touch-icon' file request failed`,
        reports: [{ message: fileRequestFailedErrorMessage }],
        serverConfig: {
            '/': generateHTMLPage(appleTouchIconLinkTag),
            '/apple-touch-icon.png': null
        }
    },
    {
        name: `'apple-touch-icon' is specified in the '<body>'`,
        reports: [{ message: elementNotSpecifiedInHeadErrorMessage }],
        serverConfig: {
            '/': generateHTMLPage(null, appleTouchIconLinkTag),
            '/apple-touch-icon.png': generateImageData()
        }
    },
    {
        name: `Multiple 'apple-touch-icon's are specified`,
        reports: [
            { message: elementHasUnneededSizesAttributeErrorMessage },
            { message: elementAlreadySpecifiedErrorMessage },
            { message: elementAlreadySpecifiedErrorMessage }
        ],
        serverConfig: {
            '/': generateHTMLPage(`
                <link rel="apple-touch-icon" sizes="152x152" href="/apple-touch-icon-152x152.png">
                <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon-180x180.png">
                <link rel="apple-touch-icon" href="/apple-touch-icon.png">
            `),
            '/apple-touch-icon-180x180.png': generateImageData()
        }
    },
    {
        name: `Multiple 'apple-touch-icon's are specified (different usage)`,
        reports: [{ message: elementAlreadySpecifiedErrorMessage }],
        serverConfig: {
            '/': generateHTMLPage(`
                <link rel="apple-touch-icon" sizes="152x152" href="/apple-touch-icon-152x152.png">
                <link rel="apple-touch-icon" href="/apple-touch-icon.png">
            `),
            '/apple-touch-icon.png': generateImageData()
        }
    }
];

hintRunner.testHint(hintPath, tests);
