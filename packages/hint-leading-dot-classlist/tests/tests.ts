import { generateHTMLPage } from '@hint/utils-create-server';
import { getHintPath, HintTest, testHint } from '@hint/utils-tests-helpers';
import { readFile } from '@hint/utils-fs';
import { Severity } from '@hint/utils-types';

const hintPath = getHintPath(__filename);

const generateHTMLPageWithDivTag = (head: string, body: string) => {
    return generateHTMLPage(head, `<div id="container">${body}</div>`);
};
const generateScriptTag = (script: string) => {
    return `<script type="text/javascript">${script}</script>`;
};
const generatePageWithExternalScript = (filename: string) => {
    const externalJS = readFile(`${__dirname}/fixtures/${filename}.js`);

    return {
        '/': generateHTMLPage(`<script src="fixtures/testjs.js"></script>`),
        [`/fixtures/testjs.js`]: {
            content: externalJS,
            headers: { 'Content-Type': 'text/javascript' }
        }
    };
};

const classListAdd = `document.getElementById('container').classList.add('foo');`;
const classListRemove = `document.getElementById('container').classList.remove('foo');`;

const classListAddWarning = `document.getElementById('container').classList.add('.foo');`;
const classListRemoveWarning = `document.getElementById('container').classList.remove('.foo');`;

const warningMessage = 'classList.add or classList.remove with leading \'.\' in the argument may lead to undesireable results';

const tests: HintTest[] = [
    {
        name: 'Can add element to classList',
        serverConfig: generateHTMLPageWithDivTag('', generateScriptTag(classListAdd))
    },
    {
        name: 'Can remove element from classList',
        serverConfig: generateHTMLPageWithDivTag('', generateScriptTag(classListRemove))
    },
    {
        name: 'Should not use leading "." in classList.add',
        reports: [{
            message: warningMessage,
            position: { match: `add('.foo')` },
            severity: Severity.warning
        }],
        serverConfig: generateHTMLPageWithDivTag('', generateScriptTag(classListAddWarning))
    },
    {
        name: 'Should not use leading "." in classList.remove',
        reports: [{
            message: warningMessage,
            position: { match: `remove('.foo')` },
            severity: Severity.warning
        }],
        serverConfig: generateHTMLPageWithDivTag('', generateScriptTag(classListRemoveWarning))
    },
    {
        name: 'External File: Can add element to classList',
        serverConfig: generatePageWithExternalScript('test-passing')
    },
    {
        name: 'External File: Should not use leading "." in classList.add',
        reports: [{
            message: warningMessage,
            position: { match: `add('.foo')` },
            severity: Severity.warning
        }],
        serverConfig: generatePageWithExternalScript('test-failing-add')
    },
    {
        name: 'External File: Should not use leading "." in classList.remove',
        reports: [{
            message: warningMessage,
            position: { match: `remove('.foo')` },
            severity: Severity.warning
        }],
        serverConfig: generatePageWithExternalScript('test-failing-remove')
    },
    {
        name: 'External File: Ignore snippet without classList',
        serverConfig: generatePageWithExternalScript('test-irrelevant')
    }
];

testHint(hintPath, tests, { parsers: ['javascript'] });
