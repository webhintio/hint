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
                message: `'padding-left' changes to this property will trigger: 'Paint', which can impact performance when used inside @keyframes.`,
                position: { column: 8, endColumn: 20, endLine: 15, line: 15 },
                severity: Severity.hint
            },
            {
                message: `'appearance' changes to this property will trigger: 'Paint', which can impact performance when used inside @keyframes.`,
                position: { column: 8, endColumn: 18, endLine: 23, line: 23 },
                severity: Severity.hint
            }
        ],
        serverConfig: generateConfig('paint-triggers')
    }
];

testHint(hintPath, tests, { parsers: ['css', 'sass'] });
