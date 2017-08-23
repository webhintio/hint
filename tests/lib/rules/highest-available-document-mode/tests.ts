/* eslint sort-keys: 0, no-undefined: 0 */

import { generateHTMLPage } from '../../../helpers/misc';
import { getRuleName } from '../../../../src/lib/utils/rule-helpers';
import { IRuleTest } from '../../../helpers/rule-test-type'; // eslint-disable-line no-unused-vars
import * as ruleRunner from '../../../helpers/rule-runner';

const ruleName = getRuleName(__dirname);

const metaTag = '<meta http-equiv="x-ua-compatible" content="ie=edge">';

const generateHTMLPageWithMetaTag = (metaTagValue: string = 'iE=eDgE') => {
    return generateHTMLPage(`<MEtA hTTp-EqUIv="X-Ua-CompATible" ConTenT="${metaTagValue}">`);
};

const testsForDefaults: Array<IRuleTest> = [
    {
        name: `HTML page is served without 'X-UA-Compatible' header`,
        reports: [{ message: `'x-ua-compatible' header was not specified` }],
        serverConfig: { '/': '' }
    },
    {
        name: `HTML page is served with 'X-UA-Compatible' header with a value different than 'ie=edge'`,
        reports: [{ message: `'x-ua-compatible' header value should be 'ie=edge'` }],
        serverConfig: { '/': { headers: { 'X-UA-Compatible': 'IE=7,9,10' } } }
    },
    {
        name: `HTML page is served with 'X-UA-Compatible' header with the value 'ie=edge'`,
        serverConfig: { '/': { headers: { 'X-ua-Compatible': 'iE=EdGe' } } }
    },
    {
        name: `HTML page is served with 'X-UA-Compatible' header and the meta tag`,
        reports: [{ message: `Meta tag is not needed` }],
        serverConfig: {
            '/': {
                content: generateHTMLPageWithMetaTag(),
                headers: { 'X-UA-Compatible': 'ie=edge' }
            }
        }
    }
];

const testsForRequireMetaTagConfig: Array<IRuleTest> = [
    {
        name: `'X-UA-Compatible' meta tag is not specified`,
        reports: [{ message: `No 'x-ua-compatible' meta tag was specified` }],
        serverConfig: { '/': '' }
    },
    {
        name: `'X-UA-Compatible' meta tag is specified with the value of 'ie=edge'`,
        serverConfig: generateHTMLPageWithMetaTag()
    },
    {
        name: `'X-UA-Compatible' meta tag is specified with no 'content' attribute`,
        reports: [{ message: `The value of 'content' should be 'ie=edge'` }],
        serverConfig: generateHTMLPage('<meta http-equiv="x-ua-compatible">')
    },
    {
        name: `'X-UA-Compatible' meta tag is specified with an empty 'content' attribute`,
        reports: [{ message: `The value of 'content' should be 'ie=edge'` }],
        serverConfig: generateHTMLPage('<meta http-equiv="x-ua-compatible" content>')
    },
    {
        name: `'X-UA-Compatible' meta tag is specified with a value different than 'ie=edge'`,
        reports: [{ message: `The value of 'content' should be 'ie=edge'` }],
        serverConfig: generateHTMLPageWithMetaTag('IE=7,8 ,9')
    },
    {
        name: `'X-UA-Compatible' meta tag is specified in the '<body>'`,
        reports: [{ message: `Meta tag should not be specified in the '<body>'` }],
        serverConfig: generateHTMLPage(undefined, `${metaTag}`)
    },
    {
        name: `'X-UA-Compatible' meta tag is specified in the '<head>' but is not included before all other tags except for the '<title>' and the other '<meta>' tags`,
        reports: [{ message: `Meta tag needs to be included before all other tags except for the '<title>' and the other '<meta>' tags` }],
        serverConfig: generateHTMLPage(`<meta charset="utf-8"><title>test</title><script src="test.js"></script>${metaTag}`)
    },
    {
        name: `Multiple 'X-UA-Compatible' meta tags are specified`,
        reports: [{ message: `A 'x-ua-compatible' meta tag was already specified` }],
        serverConfig: generateHTMLPage(`${metaTag}${metaTag}`)
    },
    {
        name: `'X-UA-Compatible' meta tag is specified and HTML page is served with 'X-UA-Compatible header'`,
        serverConfig: {
            '/': {
                content: generateHTMLPageWithMetaTag(),
                headers: { 'X-UA-Compatible': 'ie=edge' }
            }
        }
    }
];

const testsForHeaderWithBlankTargetBrowsersConfig: Array<IRuleTest> = [
    {
        name: `HTML page is served without the 'X-UA-Compatible' header, but it's required by the targeted browsers`,
        reports: [{ message: `'x-ua-compatible' header was not specified` }],
        serverConfig: { '/': '' }
    }
];

const testsForMetaTagWithBlankTargetBrowsersConfig: Array<IRuleTest> = [
    {
        name: `'X-UA-Compatible' meta tag is not specified, but it's required by the targeted browsers`,
        reports: [{ message: `No 'x-ua-compatible' meta tag was specified` }],
        serverConfig: { '/': { headers: { 'X-UA-Compatible': 'ie=edge' } } }
    }
];

const testsForTargetBrowsersConfig: Array<IRuleTest> = [
    {
        name: `HTML page is served with both 'X-UA-Compatible' header and meta tag, but they are not required by the targeted browsers`,
        reports: [
            { message: `'x-ua-compatible' header is not needed` },
            { message: `Meta tag is not needed` }
        ],
        serverConfig: {
            '/': {
                content: generateHTMLPageWithMetaTag(),
                headers: { 'X-UA-Compatible': 'ie=edge' }
            }
        }
    }
];

ruleRunner.testRule(ruleName, testsForDefaults);
ruleRunner.testRule(ruleName, testsForRequireMetaTagConfig, { ruleOptions: { requireMetaTag: true } });
ruleRunner.testRule(ruleName, testsForHeaderWithBlankTargetBrowsersConfig, { browserslist: [] });
ruleRunner.testRule(ruleName, testsForMetaTagWithBlankTargetBrowsersConfig, {
    browserslist: [],
    ruleOptions: { requireMetaTag: true }
});
ruleRunner.testRule(ruleName, testsForTargetBrowsersConfig, {
    browserslist: ['ie 11'],
    ruleOptions: { requireMetaTag: true }
});
