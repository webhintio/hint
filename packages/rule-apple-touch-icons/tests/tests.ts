import * as fs from 'fs';

import generateHTMLPage from 'sonarwhal/dist/src/lib/utils/misc/generate-html-page';
import { getRulePath } from 'sonarwhal/dist/src/lib/utils/rule-helpers';
import { RuleTest } from '@sonarwhal/utils-tests-helpers/dist/src/rule-test-type';
import * as ruleRunner from '@sonarwhal/utils-tests-helpers/dist/src/rule-runner';

const rulePath = getRulePath(__filename);

const defaultImage = fs.readFileSync(`${__dirname}/fixtures/apple-touch-icon.png`); // eslint-disable-line no-sync
const imageWithIncorrectDimensions = fs.readFileSync(`${__dirname}/fixtures/incorrect-dimensions.png`); // eslint-disable-line no-sync
const imageThatIsNotSquare = fs.readFileSync(`${__dirname}/fixtures/not-square.png`); // eslint-disable-line no-sync
const imageWithIncorrectFileFormat = fs.readFileSync(`${__dirname}/fixtures/incorrect-file-format.png`); // eslint-disable-line no-sync
// const imageWithTransparentBackground = fs.readFileSync(`${__dirname}/fixtures/transparent-background.png`); // eslint-disable-line no-sync
const appleTouchIconLinkTag = '<link rel="apple-touch-icon" href="/apple-touch-icon.png">';

const generateImageData = (content: Buffer = defaultImage): Object => {
    return {
        content,
        headers: { 'Content-Type': 'image/png' }
    };
};

const tests: Array<RuleTest> = [
    {
        name: `Resource is not an HTML document`,
        serverConfig: { '/': { headers: { 'Content-Type': 'image/png' } } }
    },
    {
        name: `'apple-touch-icon' is not specified`,
        reports: [{ message: `No 'apple-touch-icon' was specified` }],
        serverConfig: generateHTMLPage('<link>')
    },
    {
        name: `'apple-touch-icon' has 'rel="apple-touch-icon-precomposed"`,
        reports: [{ message: `'rel' attribute value should be 'apple-touch-icon'` }],
        serverConfig: {
            '/': generateHTMLPage('<link rel="apple-touch-icon-precomposed" href="/apple-touch-icon-precomposed.png">'),
            '/apple-touch-icon-precomposed.png': generateImageData()
        }
    },
    {
        name: `'apple-touch-icon' has 'rel="apple-touch-icon-precomposed apple-touch-icon"`,
        reports: [{ message: `'rel' attribute value should be 'apple-touch-icon'` }],
        serverConfig: {
            '/': generateHTMLPage('<link rel="apple-touch-icon-precomposed apple-touch-icon" href="/apple-touch-icon-precomposed.png">'),
            '/apple-touch-icon-precomposed.png': generateImageData()
        }
    },
    {
        name: `'apple-touch-icon' has no 'href' attribute`,
        reports: [{ message: `'apple-touch-icon' should have non-empty 'href' attribute` }],
        serverConfig: generateHTMLPage('<link rel="apple-touch-icon">')
    },
    {
        name: `'apple-touch-icon' has 'href' attribute with no value`,
        reports: [{ message: `'apple-touch-icon' should have non-empty 'href' attribute` }],
        serverConfig: generateHTMLPage('<link rel="apple-touch-icon" href>')
    },
    {
        name: `'apple-touch-icon' has 'href' attribute with the value of empty string`,
        reports: [{ message: `'apple-touch-icon' should have non-empty 'href' attribute` }],
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
        reports: [{ message: `'sizes' attribute is not needed` }],
        serverConfig: {
            '/': generateHTMLPage('<link rel="  apple-touch-icon " Sizes="57x57" href="/apple-touch-icon.png">'),
            '/apple-touch-icon.png': generateImageData()
        }
    },
    {
        name: `'apple-touch-icon' is not PNG`,
        reports: [{ message: `'/apple-touch-icon.png' is not a PNG` }],
        serverConfig: {
            '/': generateHTMLPage(appleTouchIconLinkTag),
            '/apple-touch-icon.png': generateImageData(imageWithIncorrectFileFormat)
        }
    },
    {
        name: `'apple-touch-icon' is not an image`,
        reports: [{ message: `'/apple-touch-icon.png' is not a valid PNG` }],
        serverConfig: {
            '/': generateHTMLPage(appleTouchIconLinkTag),
            '/apple-touch-icon.png': generateHTMLPage()
        }
    },
    {
        name: `'apple-touch-icon' is not 180x180px`,
        reports: [{ message: `'/apple-touch-icon.png' is not 180x180px` }],
        serverConfig: {
            '/': generateHTMLPage(appleTouchIconLinkTag),
            '/apple-touch-icon.png': generateImageData(imageWithIncorrectDimensions)
        }
    },
    {
        name: `'apple-touch-icon' is not 180x180px and it's also not square`,
        reports: [{ message: `'/apple-touch-icon.png' is not 180x180px` }],
        serverConfig: {
            '/': generateHTMLPage(appleTouchIconLinkTag),
            '/apple-touch-icon.png': generateImageData(imageThatIsNotSquare)
        }
    },
    {
        name: `'apple-touch-icon' could not be fetched`,
        reports: [{ message: `'/apple-touch-icon.png' could not be fetched (status code: 404)` }],
        serverConfig: {
            '/': generateHTMLPage(appleTouchIconLinkTag),
            '/apple-touch-icon.png': { status: 404 }
        }
    },
    {
        name: `'apple-touch-icon' file request failed`,
        reports: [{ message: `'/apple-touch-icon.png' file request failed` }],
        serverConfig: {
            '/': generateHTMLPage(appleTouchIconLinkTag),
            '/apple-touch-icon.png': null
        }
    },
    {
        name: `'apple-touch-icon' is specified in the '<body>'`,
        reports: [{ message: `'apple-touch-icon' should be specified in the '<head>'` }],
        serverConfig: {
            '/': generateHTMLPage(null, appleTouchIconLinkTag),
            '/apple-touch-icon.png': generateImageData()
        }
    },
    {
        name: `Multiple 'apple-touch-icon's are specified`,
        reports: [
            { message: `'sizes' attribute is not needed` },
            { message: `A 'apple-touch-icon' was already specified` },
            { message: `A 'apple-touch-icon' was already specified` }
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
        reports: [{ message: `A 'apple-touch-icon' was already specified` }],
        serverConfig: {
            '/': generateHTMLPage(`
                <link rel="apple-touch-icon" sizes="152x152" href="/apple-touch-icon-152x152.png">
                <link rel="apple-touch-icon" href="/apple-touch-icon.png">
            `),
            '/apple-touch-icon.png': generateImageData()
        }
    }
];

ruleRunner.testRule(rulePath, tests);
