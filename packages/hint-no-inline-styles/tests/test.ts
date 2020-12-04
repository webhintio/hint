import { generateHTMLPage } from '@hint/utils-create-server';
import { getHintPath, HintTest, testHint } from '@hint/utils-tests-helpers';
import { Severity } from '@hint/utils-types';

const hintPath = getHintPath(__filename);

const style = {
    elementWithNoStyleAttribute: '<span></span>',
    elementWithNoStyleElement: '<div><span>style</span></div>',
    elementWithStyleAttribute: '<div style="color: blue"></div>',
    elementWithStyleAttributeCapitalised: '<span Style="color: blue"></span>',
    elementWithStyleAttributeUpperCase: '<span Style="color: blue"></span>',
    styleElement: '<style></style>',
    styleElementCapitalised: '<Style></Style>',
    styleElementUpperCase: '<STYLE></STYLE>'
};

const tests: HintTest[] = [
    {
        name: 'Element with no style attribute passes',
        serverConfig: generateHTMLPage('', style.elementWithNoStyleAttribute)
    },
    {
        name: 'Element with no style element passes',
        serverConfig: generateHTMLPage('', style.elementWithNoStyleElement)
    },
    {
        name: 'Element with style attribute fails',
        reports: [
            {
                message: `CSS inline styles should not be used, move styles to an external CSS file`,
                severity: Severity.error
            }
        ],
        serverConfig: generateHTMLPage('', style.elementWithStyleAttribute)
    },
    {
        name: 'Element with capitalised style attribute fails',
        reports: [
            {
                message: `CSS inline styles should not be used, move styles to an external CSS file`,
                severity: Severity.error
            }
        ],
        serverConfig: generateHTMLPage(
            '',
            style.elementWithStyleAttributeCapitalised
        )
    },
    {
        name: 'Element with upper case style attribute fails',
        reports: [
            {
                message: `CSS inline styles should not be used, move styles to an external CSS file`,
                severity: Severity.error
            }
        ],
        serverConfig: generateHTMLPage(
            '',
            style.elementWithStyleAttributeUpperCase
        )
    },
    {
        name: 'Element with style element fails',
        reports: [
            {
                message: `CSS inline styles should not be used, move styles to an external CSS file`,
                severity: Severity.error
            }
        ],
        serverConfig: generateHTMLPage('', style.styleElement)
    },
    {
        name: 'Element with capitalised style element fails',
        reports: [
            {
                message: `CSS inline styles should not be used, move styles to an external CSS file`,
                severity: Severity.error
            }
        ],
        serverConfig: generateHTMLPage(
            '',
            style.styleElementCapitalised
        )
    },
    {
        name: 'Element with upper case style element fails',
        reports: [
            {
                message: `CSS inline styles should not be used, move styles to an external CSS file`,
                severity: Severity.error
            }
        ],
        serverConfig: generateHTMLPage(
            '',
            style.styleElementUpperCase
        )
    }
];

testHint(hintPath, tests);
