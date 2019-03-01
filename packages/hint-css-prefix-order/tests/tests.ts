import generateHTMLPage from 'hint/dist/src/lib/utils/misc/generate-html-page';
import { getHintPath } from 'hint/dist/src/lib/utils/hint-helpers';
import readFile from 'hint/dist/src/lib/utils/fs/read-file';
import { HintTest } from '@hint/utils-tests-helpers/dist/src/hint-test-type';
import * as hintRunner from '@hint/utils-tests-helpers/dist/src/hint-runner';

const hintPath = getHintPath(__filename);

const generateConfig = (fileName: string) => {
    if (fileName.endsWith('.html')) {
        return readFile(`${__dirname}/fixtures/${fileName}`);
    }

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
        name: 'Prefixed properties in isolation across blocks pass',
        serverConfig: generateConfig('cross-block')
    },
    {
        name: `Some prefixed properties listed first, but others last fail`,
        reports: [{
            message: `'appearance' should be listed after '-webkit-appearance'.`,
            position: {
                column: 4,
                line: 2
            }
        }],
        serverConfig: generateConfig('interleaved-prefixes')
    },
    {
        name: `Prefixed properties listed first with other properties mixed in pass`,
        serverConfig: generateConfig('mixed-with-prefixes-first')
    },
    {
        name: 'Prefixed properties listed last with other properties mixed in pass',
        reports: [{
            message: `'appearance' should be listed after '-webkit-appearance'.`,
            position: {
                column: 4,
                line: 1
            }
        }],
        serverConfig: generateConfig('mixed-with-prefixes-last')
    },
    {
        name: 'Prefixed properties listed last in different blocks both fail',
        reports: [
            {
                message: `'appearance' should be listed after '-webkit-appearance'.`,
                position: {
                    column: 4,
                    line: 1
                }
            },
            {
                message: `'appearance' should be listed after '-webkit-appearance'.`,
                position: {
                    column: 4,
                    line: 7
                }
            }
        ],
        serverConfig: generateConfig('multi-block')
    },
    {
        name: 'Different prefixed properties listed last both fail',
        reports: [
            {
                message: `'appearance' should be listed after '-webkit-appearance'.`,
                position: {
                    column: 4,
                    line: 1
                }
            },
            {
                message: `'background-size' should be listed after '-moz-background-size'.`,
                position: {
                    column: 4,
                    line: 4
                }
            }
        ],
        serverConfig: generateConfig('multi-property')
    },
    {
        name: `Prefixed properties without any unprefixed property pass`,
        serverConfig: generateConfig('prefixed-only')
    },
    {
        name: `Prefixed values listed first pass`,
        serverConfig: generateConfig('prefixed-values-first')
    },
    {
        name: 'Prefixed values listed last fail',
        reports: [{
            message: `'display: grid' should be listed after 'display: -ms-grid'.`,
            position: {
                column: 4,
                line: 1
            }
        }],
        serverConfig: generateConfig('prefixed-values-last')
    },
    {
        name: `Prefixed properties listed first pass`,
        serverConfig: generateConfig('prefixes-first')
    },
    {
        name: `Prefixed properties listed first on same line pass`,
        serverConfig: generateConfig('prefixes-first-same-line')
    },
    {
        name: 'Prefixed properties listed last fail (moz)',
        reports: [{
            message: `'appearance' should be listed after '-moz-appearance'.`,
            position: {
                column: 4,
                line: 1
            }
        }],
        serverConfig: generateConfig('prefixes-last-moz')
    },
    {
        name: 'Prefixed properties listed last on same line fail',
        reports: [{
            message: `'appearance' should be listed after '-webkit-appearance'.`,
            position: {
                column: 11,
                line: 0
            }
        }],
        serverConfig: generateConfig('prefixes-last-same-line')
    },
    {
        name: 'Prefixed properties listed last on same line fail in HTML',
        reports: [{
            message: `'appearance' should be listed after '-webkit-appearance'.`,
            position: {
                column: 26,
                line: 3
            }
        }],
        serverConfig: generateConfig('prefixes-last-same-line.html')
    },
    {
        name: 'Prefixed properties listed last fail (webkit)',
        reports: [{
            message: `'appearance' should be listed after '-webkit-appearance'.`,
            position: {
                column: 4,
                line: 1
            }
        }],
        serverConfig: generateConfig('prefixes-last-webkit')
    },
    {
        name: 'Prefixed properties listed last fail in HTML (webkit)',
        reports: [{
            message: `'appearance' should be listed after '-webkit-appearance'.`,
            position: {
                column: 16,
                line: 5
            }
        }],
        serverConfig: generateConfig('prefixes-last-webkit.html')
    },
    {
        name: `Unprefixed property without any prefixed properties pass`,
        serverConfig: generateConfig('unprefixed-only')
    }
];

hintRunner.testHint(hintPath, tests, { parsers: ['css'] });
