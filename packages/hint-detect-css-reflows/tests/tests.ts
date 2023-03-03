import { generateHTMLPage } from '@hint/utils-create-server';
import { getHintPath, HintTest, testHint } from '@hint/utils-tests-helpers';
import { readFile } from '@hint/utils-fs';
import { Severity } from '@hint/utils-types';

const hintPath = getHintPath(__filename);

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

/*
 * You should test for cases where the hint passes and doesn't.
 * More information about how `hintRunner` can be configured is
 * available in:
 * https://webhint.io/docs/contributor-guide/how-to/test-hints/
 */
const tests: HintTest[] = [
    {
        name: 'Hints should  be reported for properties in the CSSReflow.json file',
        reports: [
            {
                message: `Changes to 'accent-color' will trigger: 'Composite'. Which can impact performance.`,
                position: { column: 4, endColumn: 16, endLine: 1, line: 1 },
                severity: Severity.hint
            },
            {
                message: `Changes to 'align-content' will trigger: 'Composite, Layout, Paint'. Which can impact performance.`,
                position: { column: 4, endColumn: 16, endLine: 5, line: 5 },
                severity: Severity.hint
            }
        ],
        serverConfig: generateConfig('layout-triggers')
    },
    {
        name: 'Hints should not be reported for malformed properties in specific rules',
        reports: [
            {
                message: `Changes to 'accent-color' will trigger: 'Composite'. Which can impact performance.`,
                position: { column: 4, endColumn: 16, endLine: 1, line: 1 },
                severity: Severity.hint
            }
        ],
        serverConfig: generateConfig('malformed-layout-triggers')
    }
];

testHint(hintPath, tests, { parsers: ['css', 'sass'] });
