import generateHTMLPage from 'hint/dist/src/lib/utils/misc/generate-html-page';
import { getHintPath } from 'hint/dist/src/lib/utils/hint-helpers';
import { HintTest } from '@hint/utils-tests-helpers/dist/src/hint-test-type';
import * as hintRunner from '@hint/utils-tests-helpers/dist/src/hint-runner';

const hintPath = getHintPath(__filename);

const button = {
    buttonWithButtonType: '<button type="button"></button>',
    buttonWithInvalidButtonType: '<button type="random"></button>',
    buttonWithoutType: '<button></button>',
    buttonWithSubmitType: '<button type="submit"></button>'
};

const tests: HintTest[] = [
    {
        name: 'This test should pass',
        serverConfig: generateHTMLPage('', button.buttonWithSubmitType)
    },
    {
        name: 'This test should pass',
        serverConfig: generateHTMLPage('', button.buttonWithButtonType)
    },
    {
        name: `This test should fail`,
        reports: [{ message: `Button type attribute has not been set` }],
        serverConfig: generateHTMLPage('', button.buttonWithoutType)
    },
    {
        name: `This test should fail`,
        reports: [{ message: `Invalid button type: random` }],
        serverConfig: generateHTMLPage('', button.buttonWithInvalidButtonType)
    }
];

hintRunner.testHint(hintPath, tests);
