import generateHTMLPage from 'hint/dist/src/lib/utils/misc/generate-html-page';
import { getRulePath } from 'hint/dist/src/lib/utils/rule-helpers';
import { RuleTest } from '@hint/utils-tests-helpers/dist/src/rule-test-type';
import * as ruleRunner from '@hint/utils-tests-helpers/dist/src/rule-runner';

const rulePath = getRulePath(__filename);

const invalidColorValues = [
    'currentcolor',
    'invalid'
];

const unsupportedColorValues = [
    'hwb(60, 3%, 60%)'
];

const notAlwaysSupportedColorValues = [
    '#f00a',
    '#ff0000aa'
];

const validColorValues = [
    '#f00',
    '#fF0000',
    'hsl(5, 5%, 5%)',
    'hsla(5, 5%, 5%, 0.5)',
    'red',
    'rgb(5, 5, 5)',
    'rgba(5, 5, 5, 0.5)',
    'transparent'
];

const generateThemeColorMetaTag = (contentValue: string = '#f00', nameValue: string = 'theme-color') => {
    return `<meta name="${nameValue}" content="${contentValue}">`;
};

const generateTest = (colorValues: Array<string>, valueType: string = 'valid', reason?: string) => {
    const defaultTests = [];

    for (const colorValue of colorValues) {
        const test: RuleTest = {
            name: `'theme-color' meta tag is specified with ${valueType} 'content' value of '${colorValue}'${typeof reason === 'undefined' ? '' : ` ${reason}`}`,
            serverConfig: generateHTMLPage(generateThemeColorMetaTag(colorValue))
        };

        if (valueType !== 'valid') {
            test.reports = [{ message: `'content' attribute value ('${colorValue}') is ${valueType === 'invalid' ? 'invalid' : 'not supported everywhere'}` }];
        }

        defaultTests.push(test);
    }

    return defaultTests;
};


// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const defaultTests: Array<RuleTest> = [
    {
        name: `'theme-color' meta tag is not specified`,
        reports: [{ message: `No 'theme-color' meta tag was specified` }],
        serverConfig: generateHTMLPage('<meta name="viewport" content="width=device-width">')
    },
    {
        name: `'theme-color' meta tag is specified with invalid 'name' value`,
        reports: [{ message: `'name' attribute needs to be 'theme-color' (not ' theme-color ')` }],
        serverConfig: generateHTMLPage(generateThemeColorMetaTag('#f00', ' theme-color '))
    },
    ...generateTest([...validColorValues, ...notAlwaysSupportedColorValues]),
    ...generateTest(invalidColorValues, 'invalid'),
    ...generateTest(unsupportedColorValues, 'unsupported'),
    {
        name: `'theme-color' meta tag is specified in the '<body>'`,
        reports: [{ message: `Should not be specified in the '<body>'`}],
        serverConfig: generateHTMLPage(null, generateThemeColorMetaTag())
    },
    {
        name: `Multiple meta 'theme-color' tags are specified`,
        reports: [{ message: `A 'theme-color' meta tag was already specified` }],
        serverConfig: generateHTMLPage(`${generateThemeColorMetaTag()}${generateThemeColorMetaTag()}`)
    },
    {
        name: `Target is not served with a valid media type`,
        serverConfig: { '/': { headers: { 'Content-Type': 'invalid' } } }
    },
    {
        name: `Target is served with a non-HTML specific media type`,
        serverConfig: { '/': { headers: { 'Content-Type': 'application/javascript; charset=utf-8' } } }
    }
];

const testForNoSupportForHexWithAlpha: Array<RuleTest> = [...generateTest(notAlwaysSupportedColorValues, 'unsupported', 'because of the targeted browsers')];

ruleRunner.testRule(rulePath, defaultTests, {
    browserslist: [
        'chrome 65',
        'firefox 60'
    ]
});
ruleRunner.testRule(rulePath, testForNoSupportForHexWithAlpha, { browserslist: ['chrome 50'] });
