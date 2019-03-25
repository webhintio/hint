import { fs, test } from '@hint/utils';
import { HintTest, testHint } from '@hint/utils-tests-helpers';

const { generateHTMLPage, getHintPath } = test;
const { readFile } = fs;
const hintPath = getHintPath(__filename);

const generateHTMLPageWithDivTag = (head: string, body: string) => {
    return generateHTMLPage(head, `<div id="container">${body}</div>`);
};
const generateScriptTag = (script: string) => {
    return `<script type="text/javascript">${script}</script>`;
};
const generatePageWithExternalScript = () => {
    const externalJS = readFile(`${__dirname}/fixtures/testjs.js`);

    return {
        '/': generateHTMLPage(`<script src="fixtures/testjs.js"></script>`),
        [`/fixtures/testjs.js`]: {
            content: externalJS,
            headers: { 'Content-Type': 'text/javascript' }
        }
    };
};

const htmlElementCreate = `document.getElementById('container').appendChild(document.createElement('a'));`;
const invalidCircleCreate = `const container = document.getElementById('container')
                             const circle = document.createElement('circle');
                             container.appendChild(circle);`;
const invalidSvgCreate = `document.getElementById('container').appendChild(document.createElement('svg'));`;
const validSvgCreate = `document.getElementById('container').appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'svg'));`;

const tests: HintTest[] = [
    {
        name: 'Can create HTML element using createElement',
        serverConfig: generateHTMLPageWithDivTag('', generateScriptTag(htmlElementCreate))
    },
    {
        name: 'Should not use createElement to create SVG element',
        reports: [{
            message: 'SVG elements cannot be created with createElement; use createElementNS instead',
            position: { match: `createElement('svg')` }
        }],
        serverConfig: generateHTMLPageWithDivTag('', generateScriptTag(invalidSvgCreate))
    },
    {
        name: 'Can use createElementNS to create SVG element',
        serverConfig: generateHTMLPageWithDivTag('', generateScriptTag(validSvgCreate))
    },
    {
        name: 'Should not use createElement to create Circle SVG element',
        reports: [{
            message: 'SVG elements cannot be created with createElement; use createElementNS instead',
            position: { match: `createElement('circle')` }
        }],
        serverConfig: generateHTMLPageWithDivTag('', generateScriptTag(invalidCircleCreate))
    },
    {
        name: 'External File: Should not use createElement to create Circle SVG element',
        reports: [{
            message: 'SVG elements cannot be created with createElement; use createElementNS instead',
            position: { match: `createElement('svg')` }
        }],
        serverConfig: generatePageWithExternalScript()
    }
];

testHint(hintPath, tests, { parsers: ['javascript'] });
