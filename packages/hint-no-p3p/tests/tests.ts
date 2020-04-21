import { generateHTMLPage } from '@hint/utils-create-server';
import { getHintPath, HintTest, testHint } from '@hint/utils-tests-helpers';
import { Severity } from '@hint/utils-types';

const hintPath = getHintPath(__filename);

const message = 'P3P should not be used as it is deprecated.';

const testsForDefaults: HintTest[] = [
    {
        name: `HTML and JS with P3P headers should fail`,
        reports: [{ message, severity: Severity.error }, { message, severity: Severity.error }],
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
        reports: [{ message, severity: Severity.error }],
        serverConfig: { '/': generateHTMLPage('<link rel="P3Pv1">') }
    },
    {
        name: `Link with no rel="P3Pv1" should pass`,
        serverConfig: { '/': generateHTMLPage('<link rel="something else">') }
    },
    {
        name: `P3P well known location should fail`,
        reports: [{ message, severity: Severity.error }],
        serverConfig: {
            '/': generateHTMLPage(''),
            '/w3c/p3p.xml': 'You should not have any p3p configuration'
        }
    }
];

testHint(hintPath, testsForDefaults);
