import { generateHTMLPage } from 'sonarwhal/dist/tests/helpers/misc';
import { RuleTest } from 'sonarwhal/dist/tests/helpers/rule-test-type';
import * as ruleRunner from 'sonarwhal/dist/tests/helpers/rule-runner';
import { getRuleName } from 'sonarwhal/dist/src/lib/utils/rule-helpers';

const ruleName = getRuleName(__dirname);

const testsForDefaults: Array<RuleTest> = [
    {
        name: `HTML and JS with P3P headers should fail`,
        reports: [{ message: 'P3P is deprecated and should not be used' }, { message: 'P3P is deprecated and should not be used' }],
        serverConfig: {
            '/': {
                content: generateHTMLPage('<script src="test.js"></script>'),
                headers: { P3P: 'something' }
            },
            '/test.js': { headers: { p3p: 'something' } }
        }
    },
    {
        name: `No P3P headers should pass`,
        serverConfig: {
            '/': generateHTMLPage('<script src="test.js"></script>'),
            '/test.js': {}
        }
    },
    {
        name: `Link with rel="P3Pv1" should fail`,
        reports: [{ message: 'P3P is deprecated and should not be used' }],
        serverConfig: { '/': generateHTMLPage('<link rel="P3Pv1">') }
    },
    {
        name: `Link with no rel="P3Pv1" should pass`,
        serverConfig: { '/': generateHTMLPage('<link rel="something else">') }
    },
    {
        name: `P3P well known location should fail`,
        reports: [{ message: 'P3P is deprecated and should not be used' }],
        serverConfig: {
            '/': generateHTMLPage(''),
            '/w3c/p3p.xml': 'You should not have any p3p configuration'
        }
    }
];

ruleRunner.testRule(ruleName, testsForDefaults);
