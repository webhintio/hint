import { fs, test } from '@hint/utils';
import { testHint } from '@hint/utils-tests-helpers';

const { generateHTMLPage, getHintPath } = test;
const { readFile } = fs;

const hintPath = getHintPath(__filename, true);

const generateCSSConfig = (fileName: string) => {
    const path = 'fixtures/css';
    const styles = readFile(`${__dirname}/${path}/${fileName}.css`);

    return {
        '/': generateHTMLPage(`<link rel="stylesheet" href="styles/${fileName}">`),
        [`/styles/${fileName}`]: {
            content: styles,
            headers: { 'Content-Type': 'text/css' }
        }
    };
};

const targetBrowsers = ['chrome 73-74', 'edge 15-16', 'firefox 65-66', 'ie 9-11'];

testHint(hintPath,
    [
        {
            name: 'Reports unsupported CSS at-rules',
            reports: [
                {
                    message: `'@keyframes' is not supported by Internet Explorer < 10.`,
                    position: { match: '@keyframes' }
                }
            ],
            serverConfig: generateCSSConfig('atrules')
        },
        {
            name: 'Does not report ignored CSS features by default',
            serverConfig: generateCSSConfig('ignore')
        },
        {
            name: 'Reports unsupported properties, respecting prefixes and fallback',
            reports: [
                {
                    message: `'appearance' is not supported by Internet Explorer.`,
                    position: { match: 'appearance: button; /* Report 1 */', range: 'appearance' }
                },
                {
                    message: `'appearance' is not supported by Internet Explorer.`,
                    position: { match: 'appearance: button; /* Report 2 */', range: 'appearance' }
                },
                {
                    message: `'-webkit-appearance' is not supported by Internet Explorer.`,
                    position: { match: '-webkit-appearance: button; /* Report 3 */', range: '-webkit-appearance' }
                },
                {
                    message: `'-moz-appearance' is not supported by Internet Explorer.`,
                    position: { match: '-moz-appearance: button; /* Report 4 */', range: '-moz-appearance' }
                },
                {
                    message: `'-webkit-appearance' is not supported by Firefox, Internet Explorer. Add '-moz-appearance' to support Firefox.`,
                    position: { match: '-webkit-appearance: button; /* Report 5 */', range: '-webkit-appearance' }
                },
                {
                    message: `'appearance' is not supported by Chrome, Edge, Firefox, Internet Explorer. Add '-webkit-appearance' to support Chrome, Edge 12+. Add '-moz-appearance' to support Firefox.`,
                    position: { match: 'appearance: button; /* Report 6 */', range: 'appearance' }
                }
            ],
            serverConfig: generateCSSConfig('properties')
        },
        /*
         * TODO: Uncomment after re-enabling CSS selector support.
         *
         * {
         *     name: 'Reports unsupported CSS selectors',
         *     reports: [
         *         {
         *             message: ':valid is not supported by Internet Explorer < 10.',
         *             position: { match: ':valid' }
         *         }
         *     ],
         *     serverConfig: generateCSSConfig('selectors')
         * },
         */
        {
            name: 'Respects CSS @supports rules when generating reports',
            reports: [
                {
                    message: `'display: grid' is not supported by Edge < 16. Add 'display: -ms-grid' to support Edge 12+.`,
                    position: { match: 'grid; /* Report */', range: 'grid' }
                }
            ],
            serverConfig: generateCSSConfig('supports')
        },
        {
            name: 'Reports unsupported CSS property values, respecting prefixes and fallback',
            reports: [
                {
                    message: `'display: grid' is not supported by Internet Explorer.`,
                    position: { match: 'grid; /* Report 1 */', range: 'grid' }
                },
                {
                    message: `'display: grid' is not supported by Internet Explorer.`,
                    position: { match: 'grid; /* Report 2 */', range: 'grid' }
                },
                {
                    message: `'display: -ms-grid' is not supported by Chrome, Firefox, Internet Explorer < 10. Add 'display: grid' to support Chrome 57+, Firefox 52+.`,
                    position: { match: '-ms-grid; /* Report 3 */', range: '-ms-grid' }
                },
                {
                    message: `'display: grid' is not supported by Edge < 16, Internet Explorer. Add 'display: -ms-grid' to support Edge 12+, Internet Explorer 10+.`,
                    position: { match: 'grid; /* Report 4 */', range: 'grid' }
                }
            ],
            serverConfig: generateCSSConfig('values')
        }
    ],
    {
        browserslist: targetBrowsers,
        parsers: ['css']
    }
);

testHint(hintPath,
    [
        {
            name: 'Does not report prefixed CSS at-rules if unprefixed support exists',
            serverConfig: generateCSSConfig('atrules')
        }
    ],
    {
        browserslist: ['ie 11'],
        parsers: ['css']
    }
);

testHint(hintPath,
    [
        {
            name: 'Reports overridden ignored CSS features',
            reports: [
                {
                    message: `'appearance' is not supported by Internet Explorer.`,
                    position: { match: 'appearance: none; /* unprefixed */', range: 'appearance' }
                }
            ],
            serverConfig: generateCSSConfig('ignore')
        },
        {
            name: 'Does not report manually ignored CSS features',
            serverConfig: generateCSSConfig('values')
        }
    ],
    {
        browserslist: targetBrowsers,
        hintOptions: {
            enable: ['-moz-appearance: none', '-webkit-appearance: none', 'appearance: none'],
            ignore: ['display: grid', 'display: -ms-grid']
        },
        parsers: ['css']
    }
);
