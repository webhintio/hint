import * as path from 'path';

import { generateHTMLPage } from '@hint/utils-create-server';
import { getHintPath, HintTest, testHint } from '@hint/utils-tests-helpers';
import { readFile } from '@hint/utils-fs';
import { Severity } from '@hint/utils-types';

const hintPath = getHintPath(__filename);

const generateConfig = (fileName: string) => {
    if (fileName.endsWith('.html')) {
        return readFile(`${__dirname}/fixtures/${fileName}`);
    }

    if (fileName.endsWith('.scss')) {
        const styles = readFile(`${__dirname}/fixtures/${fileName}`);

        return {
            '/': generateHTMLPage(`<link rel="stylesheet" href="styles/${fileName}">`),
            [`/styles/${fileName}`]: {
                content: styles,
                headers: { 'Content-Type': 'text/x-scss' }
            }
        };
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

const getFixedContent = (fileName: string): string => {
    const {name, ext} = path.parse(fileName);

    return readFile(`${__dirname}/fixtures/${name}.fixed${ext || '.css'}`);
};

const tests: HintTest[] = [
    {
        name: 'Prefixed properties in isolation across blocks pass',
        serverConfig: generateConfig('cross-block')
    },
    {
        name: `Some prefixed properties listed first, but others last fail`,
        reports: [{
            fixes: { match: getFixedContent('interleaved-prefixes') },
            message: `'appearance' should be listed after '-webkit-appearance'.`,
            position: { match: 'appearance: none; /* Report */', range: 'appearance' },
            severity: Severity.warning
        }],
        serverConfig: generateConfig('interleaved-prefixes')
    },
    {
        name: `Prefixes listed last with unrelated unprefixed properties after fail`,
        reports: [{
            fixes: { match: getFixedContent('different-property-at-end') },
            message: `'appearance' should be listed after '-webkit-appearance'.`,
            position: { match: 'appearance: none; /* Report */', range: 'appearance' },
            severity: Severity.warning
        }],
        serverConfig: generateConfig('different-property-at-end')
    },
    {
        name: `Prefixed properties listed first with other properties mixed in pass`,
        serverConfig: generateConfig('mixed-with-prefixes-first')
    },
    {
        name: 'Prefixed properties listed last with other properties mixed in fail',
        reports: [{
            fixes: { match: getFixedContent('mixed-with-prefixes-last') },
            message: `'appearance' should be listed after '-webkit-appearance'.`,
            position: { match: 'appearance: none; /* Report */', range: 'appearance' },
            severity: Severity.warning
        }],
        serverConfig: generateConfig('mixed-with-prefixes-last')
    },
    {
        name: 'Prefixed properties listed last in different blocks both fail',
        reports: [
            {
                message: `'appearance' should be listed after '-webkit-appearance'.`,
                position: { match: 'appearance: none; /* Report 1 */', range: 'appearance' },
                severity: Severity.warning
            },
            {
                message: `'appearance' should be listed after '-webkit-appearance'.`,
                position: { match: 'appearance: none; /* Report 2 */', range: 'appearance' },
                severity: Severity.warning
            }
        ],
        serverConfig: generateConfig('multi-block')
    },
    {
        name: 'Different prefixed properties listed last both fail',
        reports: [
            {
                message: `'appearance' should be listed after '-webkit-appearance'.`,
                position: { match: 'appearance: none; /* Report 1 */', range: 'appearance' },
                severity: Severity.warning
            },
            {
                message: `'background-size' should be listed after '-moz-background-size'.`,
                position: { match: 'background-size: cover; /* Report 2 */', range: 'background-size' },
                severity: Severity.warning
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
            fixes: { match: getFixedContent('prefixed-values-last') },
            message: `'display: grid' should be listed after 'display: -ms-grid'.`,
            position: { match: 'grid; /* Report */', range: 'grid' },
            severity: Severity.warning
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
            position: { match: 'appearance: none; /* Report */', range: 'appearance' },
            severity: Severity.warning
        }],
        serverConfig: generateConfig('prefixes-last-moz')
    },
    {
        name: 'Prefixed properties listed last on same line fail',
        reports: [{
            fixes: { match: getFixedContent('prefixes-last-same-line') },
            message: `'appearance' should be listed after '-webkit-appearance'.`,
            position: { match: 'appearance: none; /* Report */', range: 'appearance' },
            severity: Severity.warning
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
            },
            severity: Severity.warning
        }],
        serverConfig: generateConfig('prefixes-last-same-line.html')
    },
    {
        name: 'Prefixed properties listed last fail (webkit)',
        reports: [{
            message: `'appearance' should be listed after '-webkit-appearance'.`,
            position: { match: 'appearance: none; /* Report */', range: 'appearance' },
            severity: Severity.warning
        }],
        serverConfig: generateConfig('prefixes-last-webkit')
    },
    {
        name: 'Prefixed properties listed last fail in HTML (webkit)',
        reports: [{
            fixes: { match: getFixedContent('prefixes-last-webkit.html') },
            message: `'appearance' should be listed after '-webkit-appearance'.`,
            position: {
                column: 16,
                line: 5
            },
            severity: Severity.warning
        }],
        serverConfig: generateConfig('prefixes-last-webkit.html')
    },
    {
        name: `Unprefixed property without any prefixed properties pass`,
        serverConfig: generateConfig('unprefixed-only')
    },
    {
        name: 'Prefixed properties in nested blocks only report once',
        reports: [{
            message: `'appearance' should be listed after '-webkit-appearance'.`,
            position: { match: 'appearance: none', range: 'appearance' },
            severity: Severity.warning
        }],
        serverConfig: generateConfig('prefixes-nested-blocks.scss')
    }
];

testHint(hintPath, tests, { parsers: ['css', 'sass'] });
