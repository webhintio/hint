import * as path from 'path';
import { generateHTMLPage } from '@hint/utils-create-server';
import { getHintPath, HintTest, HintLocalTest, testHint, testLocalHint } from '@hint/utils-tests-helpers';
import { Severity } from '@hint/utils-types';

import { axeCoreVersion } from './_utils';

const hintPath = getHintPath(__filename, true);

const html = {
    missingLang: `<!doctype html>
 <html>
    <head>
        <title>test</title>
    </head>
    <body>
        <div>
            <h1>test</h1>
        </div>
    </body>
</html>`,
    noProblems: generateHTMLPage(undefined, '<div role="main"><h1>test</h1></div>')
};

const tests: HintTest[] = [
    {
        name: `Page doesn't have any a11y problems and passes`,
        serverConfig: html.noProblems
    },
    {
        name: `Resource is not an HTML document`,
        serverConfig: { '/': { headers: { 'Content-Type': 'image/png' } } }
    },
    {
        name: `HTML is missing the lang attribute and fails`,
        reports: [{
            documentation: [{
                link: `https://dequeuniversity.com/rules/axe/${axeCoreVersion}/html-has-lang?application=axeAPI`,
                text: 'Learn more about this axe rule at Deque University'
            }],
            message: /^<html> element must have a lang attribute/,
            severity: Severity.warning
        }],
        serverConfig: html.missingLang
    }
];

const testsWithCustomConfiguration: HintTest[] = [
    {
        name: `Page doesn't have any a11y problems and passes with custom configuration`,
        serverConfig: html.noProblems
    },
    {
        name: `HTML is missing the lang attribute and passes because of custom config`,
        serverConfig: html.missingLang
    }
];

const localConnectorDefaultCspIframe: HintLocalTest[] = [
    {
        name: `A local html file with iframes should not throw exceptions`,
        path: path.join(__dirname, 'fixtures', 'local-default-iframe.html')
    }
];

testHint(hintPath, tests);
testHint(hintPath, testsWithCustomConfiguration, { hintOptions: { 'html-has-lang': 'off' } });
testLocalHint(hintPath, localConnectorDefaultCspIframe, { parsers: ['html'] });
