import { generateHTMLPage } from '@hint/utils-create-server';
import { getHintPath, testHint } from '@hint/utils-tests-helpers';
import { readFile } from '@hint/utils-fs';
import { Severity } from '@hint/utils-types';

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

const targetBrowsers = ['chrome 73-74', 'edge 15-16', 'firefox 63-66', 'ie 9-11'];

testHint(hintPath,
    [
        {
            name: 'Reports unsupported CSS at-rules',
            reports: [
                {
                    documentation: [{
                        link: 'https://developer.mozilla.org/docs/Web/CSS/@keyframes',
                        text: 'Learn more about this CSS feature on MDN'
                    }],
                    message: `'@keyframes' is not supported by Internet Explorer < 10.`,
                    position: { match: '@keyframes' },
                    severity: Severity.warning
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
                    documentation: [{
                        link: 'https://developer.mozilla.org/docs/Web/CSS/appearance',
                        text: 'Learn more about this CSS feature on MDN'
                    }],
                    message: `'appearance' is not supported by Internet Explorer.`,
                    position: { match: 'appearance: button; /* Report 1 */', range: 'appearance' },
                    severity: Severity.warning
                },
                {
                    documentation: [{
                        link: 'https://developer.mozilla.org/docs/Web/CSS/appearance',
                        text: 'Learn more about this CSS feature on MDN'
                    }],
                    message: `'appearance' is not supported by Internet Explorer.`,
                    position: { match: 'appearance: button; /* Report 2 */', range: 'appearance' },
                    severity: Severity.warning
                },
                {
                    documentation: [{
                        link: 'https://developer.mozilla.org/docs/Web/CSS/appearance',
                        text: 'Learn more about this CSS feature on MDN'
                    }],
                    message: `'-webkit-appearance' is not supported by Internet Explorer.`,
                    position: { match: '-webkit-appearance: button; /* Report 3 */', range: '-webkit-appearance' },
                    severity: Severity.warning
                },
                {
                    documentation: [{
                        link: 'https://developer.mozilla.org/docs/Web/CSS/appearance',
                        text: 'Learn more about this CSS feature on MDN'
                    }],
                    message: `'-moz-appearance' is not supported by Internet Explorer.`,
                    position: { match: '-moz-appearance: button; /* Report 4 */', range: '-moz-appearance' },
                    severity: Severity.warning
                },
                {
                    documentation: [{
                        link: 'https://developer.mozilla.org/docs/Web/CSS/appearance',
                        text: 'Learn more about this CSS feature on MDN'
                    }],
                    message: `'-webkit-appearance' is not supported by Firefox < 64, Internet Explorer. Add '-moz-appearance' to support Firefox.`,
                    position: { match: '-webkit-appearance: button; /* Report 5 */', range: '-webkit-appearance' },
                    severity: Severity.error
                },
                {
                    documentation: [{
                        link: 'https://developer.mozilla.org/docs/Web/CSS/appearance',
                        text: 'Learn more about this CSS feature on MDN'
                    }],
                    message: `'appearance' is not supported by Chrome < 84, Edge < 84, Firefox < 80, Internet Explorer. Add '-webkit-appearance' to support Chrome, Edge 12+, Firefox 64+. Add '-moz-appearance' to support Firefox.`,
                    position: { match: 'appearance: button; /* Report 6 */', range: 'appearance' },
                    severity: Severity.error
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
                    documentation: [{
                        link: 'https://developer.mozilla.org/docs/Web/CSS/display',
                        text: 'Learn more about this CSS feature on MDN'
                    }],
                    message: `'display: grid' is not supported by Edge < 16. Add 'display: -ms-grid' to support Edge 12+.`,
                    position: { match: 'grid; /* Report */', range: 'grid' },
                    severity: Severity.error
                }
            ],
            serverConfig: generateCSSConfig('supports')
        },
        {
            name: 'Reports unsupported CSS property values, respecting prefixes and fallback',
            reports: [
                {
                    documentation: [{
                        link: 'https://developer.mozilla.org/docs/Web/CSS/display',
                        text: 'Learn more about this CSS feature on MDN'
                    }],
                    message: `'display: grid' is not supported by Internet Explorer.`,
                    position: { match: 'grid; /* Report 1 */', range: 'grid' },
                    severity: Severity.warning
                },
                {
                    documentation: [{
                        link: 'https://developer.mozilla.org/docs/Web/CSS/display',
                        text: 'Learn more about this CSS feature on MDN'
                    }],
                    message: `'display: grid' is not supported by Internet Explorer.`,
                    position: { match: 'grid; /* Report 2 */', range: 'grid' },
                    severity: Severity.warning
                },
                {
                    documentation: [{
                        link: 'https://developer.mozilla.org/docs/Web/CSS/display',
                        text: 'Learn more about this CSS feature on MDN'
                    }],
                    message: `'display: -ms-grid' is not supported by Chrome, Firefox, Internet Explorer < 10. Add 'display: grid' to support Chrome 57+, Firefox 52+.`,
                    position: { match: '-ms-grid; /* Report 3 */', range: '-ms-grid' },
                    severity: Severity.error
                },
                {
                    documentation: [{
                        link: 'https://developer.mozilla.org/docs/Web/CSS/display',
                        text: 'Learn more about this CSS feature on MDN'
                    }],
                    message: `'display: grid' is not supported by Edge < 16, Internet Explorer. Add 'display: -ms-grid' to support Edge 12+, Internet Explorer 10+.`,
                    position: { match: 'grid; /* Report 4 */', range: 'grid' },
                    severity: Severity.error
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
                    documentation: [{
                        link: 'https://developer.mozilla.org/docs/Web/CSS/appearance',
                        text: 'Learn more about this CSS feature on MDN'
                    }],
                    message: `'appearance' is not supported by Internet Explorer.`,
                    position: { match: 'appearance: none; /* unprefixed */', range: 'appearance' },
                    severity: Severity.warning
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

testHint(hintPath,
    [
        {
            name: 'Reports both unsupported property names and values on the same declarations for different browsers',
            reports: [
                {
                    documentation: [{
                        link: 'https://developer.mozilla.org/docs/Web/CSS/grid-template-rows',
                        text: 'Learn more about this CSS feature on MDN'
                    }],
                    message: `'grid-template-rows' is not supported by Internet Explorer. Add '-ms-grid-rows' to support Internet Explorer 10+.`,
                    position: { match: 'grid-template-rows: subgrid;', range: 'grid-template-rows' },
                    severity: Severity.error
                },
                {
                    documentation: [{
                        link: 'https://developer.mozilla.org/docs/Web/CSS/CSS_Grid_Layout/Subgrid',
                        text: 'Learn more about this CSS feature on MDN'
                    }],
                    message: `'grid-template-rows: subgrid' is not supported by Edge < 117.`,
                    position: { match: 'subgrid;', range: 'subgrid' },
                    severity: Severity.warning
                }
            ],
            serverConfig: generateCSSConfig('subgrid')
        }
    ],
    {
        browserslist: ['ie 11', 'firefox 71', 'edge 16'],
        parsers: ['css']
    }
);
