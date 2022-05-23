import { generateHTMLPage } from '@hint/utils-create-server';
import { getHintPath, HintTest, testHint } from '@hint/utils-tests-helpers';
import { Severity } from '@hint/utils-types';

const hintPath = getHintPath(__filename);

const button = {
    buttonWithButtonType: '<button type="button"></button>',
    buttonWithExpressionType: '<button type="{expression}"></button>',
    buttonWithInvalidButtonType: '<button type="random"></button>',
    buttonWithInvalidButtonTypeAndSpread: '<button type="random" {...spread}></button>',
    buttonWithoutType: '<button></button>',
    buttonWithoutTypeInForm: '<form><button></button></form',
    buttonWithSpreadType: '<button {...spread}></button>',
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
        name: 'Button with a type provided as an expression passes',
        serverConfig: generateHTMLPage('', button.buttonWithExpressionType)
    },
    {
        name: 'Button with type potentially provided via spread passes',
        serverConfig: generateHTMLPage('', button.buttonWithSpreadType)
    },
    {
        name: `Button without an attribute "type" fails with hint if not in a form`,
        reports: [{
            message: `Button type attribute has not been set.`,
            severity: Severity.hint
        }],
        serverConfig: generateHTMLPage('', button.buttonWithoutType)
    },
    {
        name: `Button without an attribute "type" fails with warning if in a form`,
        reports: [{
            message: `Button type attribute has not been set.`,
            severity: Severity.warning
        }],
        serverConfig: generateHTMLPage('', button.buttonWithoutTypeInForm)
    },
    {
        name: `Button with an invalid attribute "type" fails`,
        reports: [{
            message: `Button type should be 'button', 'reset', or 'submit'.`,
            severity: Severity.error
        }],
        serverConfig: generateHTMLPage('', button.buttonWithInvalidButtonType)
    },
    {
        name: `Button with an invalid attribute "type" fails even when {...spread} is present`,
        reports: [{
            message: `Button type should be 'button', 'reset', or 'submit'.`,
            severity: Severity.error
        }],
        serverConfig: generateHTMLPage('', button.buttonWithInvalidButtonTypeAndSpread)
    }
];

testHint(hintPath, tests);
