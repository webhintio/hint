import { generateHTMLPage } from 'sonarwhal/dist/tests/helpers/misc';
import { getRuleName } from 'sonarwhal/dist/src/lib/utils/rule-helpers';
import { RuleTest } from 'sonarwhal/dist/tests/helpers/rule-test-type';
import * as ruleRunner from 'sonarwhal/dist/tests/helpers/rule-runner';

const invalidColorValues = [
    'currentcolor',
    'invalid'
];

const unsupportedColorValues = [
    '#f00a',
    '#ff0000aa',
    'hsl(5, 5%, 5%)',
    'hsla(5, 5%, 5%, 0.5)',
    'hwb(60, 3%, 60%)',
    'rgb(5, 5, 5)',
    'rgba(5, 5, 5, 0.5)'
];

const validColorValues = [
    '#f00',
    '#fF0000',
    'red',
    'transparent'
];

const generateThemeColorMetaTag = (contentValue: string = '#f00', nameValue: string = 'theme-color') => {
    return `<meta name="${nameValue}" content="${contentValue}">`;
};

const generateTest = (colorValues: Array<string>, valueType: string = 'valid') => {
    const tests = [];

    for (const colorValue of colorValues) {
        const test: RuleTest = {
            name: `'theme-color' meta tag is specified with ${valueType} 'content' value of '${colorValue}'`,
            serverConfig: generateHTMLPage(generateThemeColorMetaTag(colorValue))
        };

        if (valueType !== 'valid') {
            test.reports = [{ message: `'content' attribute value ('${colorValue}') is ${valueType === 'invalid' ? 'invalid' : 'not supported everywhere'}` }];
        }

        tests.push(test);
    }

    return tests;
};


// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const tests: Array<RuleTest> = [
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
    ...generateTest(validColorValues),
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

ruleRunner.testRule(getRuleName(__dirname), tests);
