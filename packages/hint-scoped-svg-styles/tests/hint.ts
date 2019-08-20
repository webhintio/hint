import { test, fs } from '@hint/utils';
import { HintTest, testHint } from '@hint/utils-tests-helpers';

const { readFile } = fs;
const { generateHTMLPage, getHintPath } = test;
const hintPath = getHintPath(__filename);

const generateConfig = (fileName: string) => {
    if (fileName.endsWith('.html')) {
        return readFile(`${__dirname}/fixtures/${fileName}`);
    }

    const styles = readFile(`${__dirname}/fixtures/${fileName}.css`);

    return {
        '/': generateHTMLPage(
            `<link rel="stylesheet" href="styles/${fileName}">`
        ),
        [`/styles/${fileName}`]: {
            content: styles,
            headers: { 'Content-Type': 'text/css' }
        }
    };
};

const defaultTests: HintTest[] = [
    {
        name: 'This test should pass for empty html page',
        serverConfig: generateHTMLPage()
    },
    {
        name: 'SVG with scoped styles and no leakage should pass',
        serverConfig: generateConfig('valid-page.html')
    },
    {
        name: 'SVG style affecting elements in dom outside the SVG should fail',
        reports: [
            {
                message: `A '<style>' inside '<svg>' should not affect elements outside of that subtree.`,
                position: { match: '.test-html-class' }
            },
            {
                message: `Styles from an unrelated SVG subtree matched this element using the following selector: '.test-html-class { }'`,
                position: { match: 'p class="test-html-class"' }
            },
            {
                message: `Styles from an unrelated SVG subtree matched this element using the following selector: '.test-html-class { }'`,
                position: { match: 'h1 class="test-html-class"' }
            }
        ],
        serverConfig: generateConfig('elements-outside-svg.html')
    },
    {
        name: 'SVG style affecting elements in another SVG',
        reports: [
            {
                message: `A '<style>' inside '<svg>' should not affect elements outside of that subtree.`,
                position: { match: '.test-another-svg-class' }
            },
            {
                message: `Styles from an unrelated SVG subtree matched this element using the following selector: '.test-another-svg-class { }'`,
                position: { match: 'g class="test-another-svg-class"' }
            }
        ],
        serverConfig: generateConfig('elements-inside-unrelated-svg.html')
    }
];

const testsWithMaxReportsConfig: HintTest[] = [
    {
        name: 'SVG style affecting elements in dom outside the SVG should fail with 1 html report only',
        reports: [
            {
                message: `A '<style>' inside '<svg>' should not affect elements outside of that subtree.`,
                position: { match: '.test-html-class' }
            },
            {
                message: `Styles from an unrelated SVG subtree matched this element using the following selector: '.test-html-class { }'`,
                position: { match: 'h1 class="test-html-class"' }
            }
        ],
        serverConfig: generateConfig('elements-outside-svg.html')
    }
];

testHint(hintPath, defaultTests, { parsers: ['css'] });
testHint(hintPath, testsWithMaxReportsConfig, { hintOptions: { maxReportsPerCSSRule: 1 }, parsers: ['css'] });
