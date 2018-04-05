import { generateHTMLPage } from 'sonarwhal/dist/tests/helpers/misc';
import { getRuleName } from 'sonarwhal/dist/src/lib/utils/rule-helpers';
import { RuleTest } from 'sonarwhal/dist/tests/helpers/rule-test-type';
import * as ruleRunner from 'sonarwhal/dist/tests/helpers/rule-runner';

const ruleName = getRuleName(__dirname);

const validColorValues = [
    '#f00',
    '#fF0000',
    'red',
    'rgb(5, 5, 5)',
    'rgba(5, 5, 5, 0.5)',
    'hsl(5, 5%, 5%)',
    'hsla(5, 5%, 5%, 0.5)',
    'transparent'
];

const generateThemeColorMetaTag = (contentValue: string = '#f00', nameValue: string = 'theme-color') => {
    return `<meta name="${nameValue}" content="${contentValue}">`;
};

const defaultTests: Array<RuleTest> = [];

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

for (const colorValue of validColorValues) {
    defaultTests.push({
        name: `'theme-color' meta tag is specified with valid 'content' value of '${colorValue}'`,
        serverConfig: generateHTMLPage(generateThemeColorMetaTag(colorValue))
    });
}

defaultTests.push(
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
    {
        name: `'theme-color' meta tag is specified with invalid 'content' value of 'currentcolor'`,
        reports: [{ message: `'content' attribute value ('currentcolor') is invalid` }],
        serverConfig: generateHTMLPage(generateThemeColorMetaTag('currentcolor'))
    },
    {
        name: `'theme-color' meta tag is specified with invalid 'content' value of 'invalid'`,
        reports: [{ message: `'content' attribute value ('invalid') is invalid` }],
        serverConfig: generateHTMLPage(generateThemeColorMetaTag('invalid'))
    },
    {
        name: `'theme-color' meta tag is specified with unsupported 'content' value of '#f00a'`,
        reports: [{ message: `'content' attribute value ('#f00a') is not unsupported` }],
        serverConfig: generateHTMLPage(generateThemeColorMetaTag('#f00a'))
    },
    {
        name: `'theme-color' meta tag is specified with unsupported 'content' value of '#ff0000aa'`,
        reports: [{ message: `'content' attribute value ('#ff0000aa') is not unsupported` }],
        serverConfig: generateHTMLPage(generateThemeColorMetaTag('#ff0000aa'))
    },
    {
        name: `'theme-color' meta tag is specified with unsupported 'content' value of 'hwb(60, 3%, 60%)'`,
        reports: [{ message: `'content' attribute value ('hwb(60, 3%, 60%)') is not unsupported` }],
        serverConfig: generateHTMLPage(generateThemeColorMetaTag('hwb(60, 3%, 60%)'))
    },
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
);

const testsForHexWithAlphaSupport = [
    {
        name: `'theme-color' meta tag is specified with supported 'content' value of '#f00a' because of the targeted browsers`,
        serverConfig: generateHTMLPage(generateThemeColorMetaTag('#f00a'))
    },
    {
        name: `'theme-color' meta tag is specified with supported 'content' value of '#ff0000aa' because of the targeted browsers`,
        serverConfig: generateHTMLPage(generateThemeColorMetaTag('#ff0000aa'))
    }
];

ruleRunner.testRule(ruleName, defaultTests);
ruleRunner.testRule(ruleName, testsForHexWithAlphaSupport, {
    browserslist: [
        'chrome 65',
        'firefox 60'
    ]
});
