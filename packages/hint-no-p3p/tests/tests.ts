import generateHTMLPage from 'hint/dist/src/lib/utils/misc/generate-html-page';
import { HintTest } from '@hint/utils-tests-helpers/dist/src/hint-test-type';
import * as hintRunner from '@hint/utils-tests-helpers/dist/src/hint-runner';
import { getHintPath } from 'hint/dist/src/lib/utils/hint-helpers';

const hintPath = getHintPath(__filename);

const message = 'P3P is deprecated and should not be used';

const testsForDefaults: Array<HintTest> = [
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

hintRunner.testHint(hintPath, testsForDefaults);
