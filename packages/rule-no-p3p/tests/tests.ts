import { generateHTMLPage } from 'sonarwhal/dist/src/lib/utils/misc';
import { RuleTest } from '@sonarwhal/utils-tests-helpers/dist/src/rule-test-type';
import * as ruleRunner from '@sonarwhal/utils-tests-helpers/dist/src/rule-runner';
import { getRulePath } from 'sonarwhal/dist/src/lib/utils/rule-helpers';

const rulePath = getRulePath(__filename);

const message = 'P3P is deprecated and should not be used';

const testsForDefaults: Array<RuleTest> = [
    {
        name: `HTML and JS with P3P headers should fail`,
        reports: [{ message }, { message }],
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
        reports: [{ message }],
        serverConfig: { '/': generateHTMLPage('<link rel="P3Pv1">') }
    },
    {
        name: `Link with no rel="P3Pv1" should pass`,
        serverConfig: { '/': generateHTMLPage('<link rel="something else">') }
    },
    {
        name: `P3P well known location should fail`,
        reports: [{ message }],
        serverConfig: {
            '/': generateHTMLPage(''),
            '/w3c/p3p.xml': 'You should not have any p3p configuration'
        }
    }
];

ruleRunner.testRule(rulePath, testsForDefaults);
