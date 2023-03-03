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
        name: 'Hints should be reported for two css rules',
        reports: [{
            message: `'appearance' should be listed after '-webkit-appearance'.`,
            position: { match: 'appearance: none; /* Report */', range: 'appearance' },
            severity: Severity.hint
        }],
        serverConfig: generateConfig('layout-triggers')
    }
];

testHint(hintPath, tests, { parsers: ['css', 'sass'] });
