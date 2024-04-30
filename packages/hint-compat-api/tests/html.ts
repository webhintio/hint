import { generateHTMLPage } from '@hint/utils-create-server';
import { getHintPath, testHint } from '@hint/utils-tests-helpers';
import { readFile } from '@hint/utils-fs';
import { Severity } from '@hint/utils-types';

const hintPath = getHintPath(__filename, true);

const generateHTMLConfig = (fileName: string) => {
    const path = 'fixtures/html';
    const htmlFile = readFile(`${__dirname}/${path}/${fileName}.html`);

    return { '/': generateHTMLPage(undefined, htmlFile) };
};

const targetBrowsers = ['chrome 73-74', 'edge 17-18', 'firefox 65-66', 'ie 10-11'];

testHint(hintPath,
    [
        {
            name: 'Reports unsupported HTML attributes',
            reports: [
                {
                    documentation: [{
                        link: 'https://developer.mozilla.org/docs/Web/HTML/Element/img',
                        text: 'Learn more about this HTML feature on MDN'
                    }],
                    message: `'img[srcset]' is not supported by Internet Explorer.`,
                    position: { match: 'img srcset=' },
                    severity: Severity.warning
                },
                {
                    documentation: [{
                        link: 'https://developer.mozilla.org/docs/Web/HTML/Global_attributes/hidden',
                        text: 'Learn more about this HTML feature on MDN'
                    }],
                    message: `'div[hidden]' is not supported by Internet Explorer < 11.`,
                    position: { match: 'div hidden' },
                    severity: Severity.warning
                }
            ],
            serverConfig: generateHTMLConfig('attributes')
        },
        {
            name: 'Reports unsupported HTML elements',
            reports: [
                {
                    documentation: [{
                        link: 'https://developer.mozilla.org/docs/Web/HTML/Element/search',
                        text: 'Learn more about this HTML feature on MDN'
                    }],
                    message: `'search' is not supported by Chrome < 118, Edge < 118, Firefox < 118, Internet Explorer.`,
                    position: { match: 'search' },
                    severity: Severity.warning
                },
                {
                    documentation: [{
                        link: 'https://developer.mozilla.org/docs/Web/HTML/Element/details',
                        text: 'Learn more about this HTML feature on MDN'
                    }],
                    message: `'details' is not supported by Edge < 79, Internet Explorer.`,
                    position: { match: 'details' },
                    severity: Severity.warning
                }
            ],
            serverConfig: generateHTMLConfig('elements')
        },
        {
            name: 'Does not report ignored HTML features by default',
            serverConfig: generateHTMLConfig('ignore')
        },
        {
            name: 'Reports unsupported HTML attribute values',
            reports: [
                // TODO: Include <form method="dialog"> or similar once MDN data is available
                {
                    documentation: [{
                        link: 'https://developer.mozilla.org/docs/Web/HTML/Element/input/color',
                        text: 'Learn more about this HTML feature on MDN'
                    }],
                    message: `'input[type=color]' is not supported by Internet Explorer.`,
                    position: { match: 'input type="color"' },
                    severity: Severity.warning
                }
            ],
            serverConfig: generateHTMLConfig('values')
        }
    ],
    { browserslist: targetBrowsers }
);

testHint(hintPath,
    [
        {
            name: 'Reports overridden ignored HTML features',
            reports: [
                {
                    documentation: [{
                        link: 'https://developer.mozilla.org/docs/Web/HTML/Element/script',
                        text: 'Learn more about this HTML feature on MDN'
                    }],
                    message: `'script[integrity]' is not supported by Internet Explorer.`,
                    position: { match: 'script integrity' },
                    severity: Severity.warning
                },
                {
                    documentation: [{
                        link: 'https://developer.mozilla.org/docs/Web/HTML/Attributes/autocomplete',
                        text: 'Learn more about this HTML feature on MDN'
                    }],
                    message: `'input[autocomplete]' is not supported by Internet Explorer.`,
                    position: { match: 'input autocomplete' },
                    severity: Severity.warning
                }
            ],
            serverConfig: generateHTMLConfig('ignore')
        },
        {
            name: 'Does not report manually ignored HTML features',
            serverConfig: generateHTMLConfig('values')
        }
    ],
    {
        browserslist: targetBrowsers,
        hintOptions: { enable: ['autocomplete', 'integrity'], ignore: ['input[type=color]'] }
    }
);
