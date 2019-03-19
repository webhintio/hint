import generateHTMLPage from 'hint/dist/src/lib/utils/misc/generate-html-page';
import { getHintPath } from 'hint/dist/src/lib/utils/hint-helpers';
import readFile from 'hint/dist/src/lib/utils/fs/read-file';
import { HintTest } from '@hint/utils-tests-helpers/dist/src/hint-test-type';
import * as hintRunner from '@hint/utils-tests-helpers/dist/src/hint-runner';

const hintPath = getHintPath(__filename);

const generateHTMLPageWithDivTag = (head: string, body: string) => {
    return generateHTMLPage(head, `<div id="container">${body}</div>`);
};
const generateScriptTag = (script: string) => {
    return `<script type="text/javascript">${script}</script>`;
};
const generatePageWithExternalScript = () => {
    const externalJS = readFile(`${__dirname}/js/testjs.js`);

    return {
        '/': generateHTMLPage(`<script src="js/testjs.js"></script>`),
        [`/js/testjs.js`]: {
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

hintRunner.testHint(hintPath, tests, { parsers: ['javascript']});
