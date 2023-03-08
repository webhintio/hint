import { generateHTMLPage } from '@hint/utils-create-server';
import { getHintPath, HintTest, testHint } from '@hint/utils-tests-helpers';
import { readFile } from '@hint/utils-fs';
import { Severity } from '@hint/utils-types';

const hintPath = getHintPath(__filename, true);

const generateConfig = (fileName: string) => {
    const styles = readFile(`${__dirname}/fixtures/${fileName}.css`);

    return {
        '/': generateHTMLPage(`<link rel="stylesheet" href="styles/${fileName}">`),
        [`/styles/${fileName}`]: {
            content: styles,
            headers: { 'Content-Type': 'text/css' }
        }
    };
};

const tests: HintTest[] = [
    {
        name: 'Hints should  be reported for properties in the CSSReflow.json file',
        reports: [
            {
                message: `Changes to 'padding-left' will trigger: 'Layout'. Which can impact performance.`,
                position: { column: 3, endColumn: 15, endLine: 5, line: 5 },
                severity: Severity.hint
            }
        ],
        serverConfig: generateConfig('layout-triggers')
    }
];

testHint(hintPath, tests, { parsers: ['css', 'sass'] });
