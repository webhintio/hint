/* eslint sort-keys: 0, no-undefined: 0 */

import * as mock from 'mock-require';

import { HintTest } from '@hint/utils-tests-helpers/dist/src/hint-test-type';
import * as hintRunner from '@hint/utils-tests-helpers/dist/src/hint-runner';
import { getHintPath } from 'hint/dist/src/lib/utils/hint-helpers';

const hintPath = getHintPath(__filename);
const exampleUrl = 'https://empty.webhint.io/';
const validatorError = 'error';
const defaultValidator = 'https://validator.w3.org/nu/';
const configValidator = 'https://html5.validator.nu';

// Html checker response that contains no errors
const noErrorMessages = {
    url: exampleUrl,
    messages: []
};

// Response from the default checker that contains errors/warnings
const defaultCheckerMessages = {
    url: exampleUrl,
    messages: [
        {
            type: 'info',
            lastLine: 1,
            lastColumn: 3114,
            firstColumn: 3046,
            subType: 'error',
            message: '“role="none"” is not yet supported in all browsers. Consider instead either using “role="presentation"” or “role="none presentation"”.',
            extract: 'stration"><img src="/images/iceberg-left.svg" id="iceberg1" alt="" role="none"> <img ',
            hiliteStart: 10,
            hiliteLength: 69
        },
        {
            type: 'info',
            lastLine: 1,
            lastColumn: 3462,
            firstColumn: 3459,
            subType: 'warning',
            message: 'Consider using the “h1” element as a top-level heading only (all “h1” elements are treated as top-level headings by many screen readers and other tools)',
            extract: '-section"><h1>example<',
            hiliteStart: 10,
            hiliteLength: 4
        },
        {
            type: 'info',
            lastLine: 1,
            lastColumn: 3000,
            firstColumn: 2000,
            subType: 'warning',
            message: 'Consider using the “h1” element as a top-level heading only (all “h1” elements are treated as top-level headings by many screen readers and other tools)',
            extract: '-section"><h1>example<',
            hiliteStart: 8,
            hiliteLength: 9
        }
    ]
};

// Response from configed validating service other than the default one
const configCheckerMessages = {
    url: exampleUrl,
    messages: [
        {
            type: 'info',
            lastLine: 1,
            lastColumn: 3462,
            firstColumn: 3459,
            subType: 'warning',
            message: 'Something is wrong here.',
            extract: '-section"><h1>example<',
            hiliteStart: 10,
            hiliteLength: 4
        }
    ]
};

const htmlCheckerMock = (response) => {
    const requestAsync = {
        default(scanOptions) {
            let responseMessages;

            if (response.pass) { // No errors/warnings are detected in the target html
                return Promise.resolve(JSON.stringify(noErrorMessages));
            }

            if (response.error) { // Errors/warnings are detected in the target html
                const isDefaultChecker = scanOptions.url === defaultValidator;

                responseMessages = isDefaultChecker ? defaultCheckerMessages : configCheckerMessages;

                return Promise.resolve(JSON.stringify(responseMessages));
            }

            return Promise.reject(validatorError); // Error with the validator
        }
    };

    mock('hint/dist/src/lib/utils/network/request-async', requestAsync);
};

const testsForDefaults: Array<HintTest> = [
    {
        name: 'No reports if HTML checker returns no messages',
        serverUrl: exampleUrl,
        before() {
            htmlCheckerMock({ pass: true });
        }
    },
    {
        name: `Resource is not an HTML document`,
        serverConfig: { '/': { headers: { 'Content-Type': 'image/png' } } }
    },
    {
        name: 'Reports warnings/errors if the HTML checker returns messages',
        serverUrl: exampleUrl,
        reports: [{
            message: defaultCheckerMessages.messages[0].message,
            position: {
                column: defaultCheckerMessages.messages[0].firstColumn,
                line: defaultCheckerMessages.messages[0].lastLine
            }
        }, {
            message: defaultCheckerMessages.messages[1].message,
            position: {
                column: defaultCheckerMessages.messages[1].firstColumn,
                line: defaultCheckerMessages.messages[1].lastLine
            }
        }],
        before() {
            htmlCheckerMock({ error: true });
        }
    }
];

const testsForIgnoreStringConfigs: Array<HintTest> = [
    {
        name: 'Ignore selected message(string) from the report',
        serverUrl: exampleUrl,
        reports: [{
            message: defaultCheckerMessages.messages[0].message,
            position: {
                column: defaultCheckerMessages.messages[0].firstColumn,
                line: defaultCheckerMessages.messages[0].lastLine
            }
        }],
        before() {
            htmlCheckerMock({ error: true });
        }
    }
];

const testsForIgnoreArrayConfigs: Array<HintTest> = [
    {
        name: 'Ignore selected messages(array) from the report',
        serverUrl: exampleUrl,
        before() {
            htmlCheckerMock({ error: true });
        }
    }
];

const testsForValidatorConfig: Array<HintTest> = [
    {
        name: 'Use configed validator service other than the default',
        serverUrl: exampleUrl,
        reports: [{
            message: configCheckerMessages.messages[0].message,
            position: {
                column: configCheckerMessages.messages[0].firstColumn,
                line: configCheckerMessages.messages[0].lastLine
            }
        }],
        before() {
            htmlCheckerMock({ error: true });
        }
    }
];

const testsForDetailsConfig: Array<HintTest> = [
    {
        name: 'Configure to show complete list of errors/warnings',
        serverUrl: exampleUrl,
        before() {
            htmlCheckerMock({ pass: true });
        }
    },
    {
        name: 'Reports warnings/errors if the HTML checker returns messages',
        serverUrl: exampleUrl,
        reports: [{
            message: defaultCheckerMessages.messages[0].message,
            position: {
                column: defaultCheckerMessages.messages[0].firstColumn,
                line: defaultCheckerMessages.messages[0].lastLine
            }
        }, {
            message: defaultCheckerMessages.messages[1].message,
            position: {
                column: defaultCheckerMessages.messages[1].firstColumn,
                line: defaultCheckerMessages.messages[1].lastLine
            }
        }, {
            message: defaultCheckerMessages.messages[2].message,
            position: {
                column: defaultCheckerMessages.messages[2].firstColumn,
                line: defaultCheckerMessages.messages[2].lastLine
            }
        }],
        before() {
            htmlCheckerMock({ error: true });
        }
    }
];

const testsForErrors: Array<HintTest> = [
    {
        name: 'Reports error when not able to get result from the HTML Checker',
        serverUrl: exampleUrl,
        reports: [{ message: `Couldn't get results from HTML checker for ${exampleUrl}. Error: ${validatorError}` }],
        before() {
            htmlCheckerMock({ reject: true });
        }
    }
];

hintRunner.testHint(hintPath, testsForDefaults, { serial: true });
hintRunner.testHint(hintPath, testsForIgnoreStringConfigs, {
    hintOptions: { ignore: defaultCheckerMessages.messages[1].message },
    serial: true
});
hintRunner.testHint(hintPath, testsForIgnoreArrayConfigs, {
    hintOptions: { ignore: [defaultCheckerMessages.messages[0].message, defaultCheckerMessages.messages[1].message] },
    serial: true
});
hintRunner.testHint(hintPath, testsForValidatorConfig, {
    hintOptions: { validator: configValidator },
    serial: true
});
hintRunner.testHint(hintPath, testsForDetailsConfig, {
    hintOptions: { details: true },
    serial: true
});

hintRunner.testHint(hintPath, testsForErrors);
