/* eslint sort-keys: 0, no-undefined: 0 */

import { generateHTMLPage } from '../../../helpers/misc';
import { getRuleName } from '../../../../src/lib/utils/rule-helpers';
import { RuleTest } from '../../../helpers/rule-test-type'; // eslint-disable-line no-unused-vars
import * as ruleRunner from '../../../helpers/rule-runner';

const ruleName = getRuleName(__dirname);

const generateHTMLPageWithMetaTag = (metaTagValue: string = 'iE=eDgE') => {
    return generateHTMLPage(`<MEtA hTTp-EqUIv="X-Ua-CompATible" ConTenT="${metaTagValue}">`);
};

const metaTag = '<meta http-equiv="x-ua-compatible" content="ie=edge">';

const testsForDefaults: Array<RuleTest> = [
    {
        name: `Response does not include the 'X-UA-Compatible' header`,
        reports: [{ message: `Response does not include the 'X-UA-Compatible' header` }],
        serverConfig: generateHTMLPage()
    },
    {
        name: `Response includes the 'X-UA-Compatible' header with a value different than 'ie=edge'`,
        reports: [{ message: `The value of the 'X-UA-Compatible' HTTP response header should be 'ie=edge'` }],
        serverConfig: { '/': { headers: { 'X-UA-Compatible': 'IE=7,9,10' } } }
    },
    {
        name: `Response includes the 'X-UA-Compatible' header with the value 'ie=edge'`,
        serverConfig: { '/': { headers: { 'X-ua-Compatible': 'iE=EdGe' } } }
    },
    {
        name: `Response includes the 'X-UA-Compatible' header and also the meta tag`,
        reports: [{ message: `Meta tag is not needed` }],
        serverConfig: {
            '/': {
                content: generateHTMLPageWithMetaTag(),
                headers: { 'X-UA-Compatible': 'ie=edge' }
            }
        }
    }
];

const testsForRequireMetaTagConfig: Array<RuleTest> = [
    {
        name: `'X-UA-Compatible' meta tag is not specified`,
        reports: [{ message: `No 'X-UA-Compatible' meta tag was specified` }],
        serverConfig: generateHTMLPage()
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
        name: `'X-UA-Compatible' meta tag is specified with no empty 'content' attribute`,
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
        reports: [{ message: `A 'X-UA-Compatible' meta tag was already specified` }],
        serverConfig: generateHTMLPage(`${metaTag}${metaTag}`)
    },
    {
        name: `'X-UA-Compatible' HTTP response header is specified and so is the meta tag`,
        serverConfig: {
            '/': {
                content: generateHTMLPageWithMetaTag(),
                headers: { 'X-UA-Compatible': 'ie=edge' }
            }
        }
    }
];

const testsForTargetBrowsersConfig: Array<RuleTest> = [
    {
        name: `'X-UA-Compatible' HTTP response header is specified and so is the meta tag but the targeted browsers don't support document modes`,
        reports: [
            { message: `'X-UA-Compatible' HTTP response header is not needed` },
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
ruleRunner.testRule(ruleName, testsForTargetBrowsersConfig, {
    browserslist: [
        'ie >= 6',
        'last 2 versions'
    ],
    ruleOptions: { requireMetaTag: true }
});
