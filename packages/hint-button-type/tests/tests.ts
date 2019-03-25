import { test } from '@hint/utils';
import { HintTest, testHint } from '@hint/utils-tests-helpers';

const { generateHTMLPage, getHintPath } = test;
const hintPath = getHintPath(__filename);

const button = {
    buttonWithButtonType: '<button type="button"></button>',
    buttonWithInvalidButtonType: '<button type="random"></button>',
    buttonWithoutType: '<button></button>',
    buttonWithSubmitType: '<button type="submit"></button>'
};

const tests: HintTest[] = [
    {
        name: 'Button with "submit" as attribute "type" passes',
        serverConfig: generateHTMLPage('', button.buttonWithSubmitType)
    },
    {
        name: 'Button with a valid attribute "type" passes',
        serverConfig: generateHTMLPage('', button.buttonWithButtonType)
    },
    {
        name: `Button without an attribute "type" fails`,
        reports: [{ message: `Button type attribute has not been set` }],
        serverConfig: generateHTMLPage('', button.buttonWithoutType)
    },
    {
        name: `Button with an invalid attribute "type" fails`,
        reports: [{ message: `Invalid button type: random` }],
        serverConfig: generateHTMLPage('', button.buttonWithInvalidButtonType)
    }
];

testHint(hintPath, tests);
