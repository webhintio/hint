import generateHTMLPage from 'hint/dist/src/lib/utils/misc/generate-html-page';
import { getHintPath } from 'hint/dist/src/lib/utils/hint-helpers';
import { HintTest } from '@hint/utils-tests-helpers/dist/src/hint-test-type';
import * as hintRunner from '@hint/utils-tests-helpers/dist/src/hint-runner';

const hintPath = getHintPath(__filename);

const generateHTMLPageWithDivTag = (head: string, body: string) => {
    return generateHTMLPage(head, `<div id="container">${body}</div>`);
};
const generateScriptTag = (script: string) => {
    return `<script type="text/javascript">${script}</script>`;
};

const htmlElementCreate = 'document.getElementById("container").appendChild(document.createElement("a"));';
const invalidCircleCreate = `const container = document.getElementById("container")
                             const circle = document.createElement("circle");
                             container.appendChild(circle);`;
const invalidSvgCreate = 'document.getElementById("container").appendChild(document.createElement("svg"));';
const validSvgCreate = 'document.getElementById("container").appendChild(document.createElementNS("http://www.w3.org/2000/svg", "svg"));';

const tests: HintTest[] = [
    {
        name: 'Can create HTML element using createElement',
        serverConfig: generateHTMLPageWithDivTag('', generateScriptTag(htmlElementCreate))
    },
    {
        name: 'Should not use createElement to create SVG element',
        reports: [{
            message: 'Avoid using createElement to create SVG elements; use createElementNS instead',
            position: { column: 59, line: 6}
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
            message: 'Avoid using createElement to create SVG elements; use createElementNS instead',
            position: { column: 54, line: 7}
        }],
        serverConfig: generateHTMLPageWithDivTag('', generateScriptTag(invalidCircleCreate))
    }
];

hintRunner.testHint(hintPath, tests, { parsers: ['javascript']});
