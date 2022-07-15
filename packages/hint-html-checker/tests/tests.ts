/* eslint sort-keys: 0 */

import { getHintPath, HintTest, testHint } from '@hint/utils-tests-helpers';
import { Severity } from '@hint/utils-types';

const hintPath = getHintPath(__filename);
const exampleUrl = 'http://localhost/';
const validatorError = 'error';
const defaultValidator = 'https://validator.w3.org/nu/';
const configValidator = 'https://html5.validator.nu';

// Html checker response that contains no errors
const noErrorMessages = {
    url: exampleUrl,
    messages: []
};

// Response from the default checker that contains errors/warnings, values modified to validate `toSeverity`
const defaultCheckerMessages = {
    url: exampleUrl,
    messages: [
        {
            type: 'error',
            lastLine: 1,
            lastColumn: 3114,
            firstColumn: 3046,
            subType: 'fatal',
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

const htmlCheckerMock = (response: any) => {
    return {
        '@hint/utils-network': {
            requestAsync(url: string, scanOptions: any) {
                let responseMessages;

                if (response.pass) { // No errors/warnings are detected in the target html
                    return Promise.resolve(JSON.stringify(noErrorMessages));
                }

                if (response.error) { // Errors/warnings are detected in the target html
                    const isDefaultChecker = url === defaultValidator;

                    responseMessages = isDefaultChecker ? defaultCheckerMessages : configCheckerMessages;

                    return Promise.resolve(JSON.stringify(responseMessages));
                }

                return Promise.reject(new Error(validatorError)); // Error with the validator
            }
        }
    };
};

const testsForDefaults: HintTest[] = [
    {
        name: 'No reports if HTML checker returns no messages',
        overrides: htmlCheckerMock({ pass: true })
    },
    {
        name: `Resource is not an HTML document`,
        serverConfig: { '/': { headers: { 'Content-Type': 'image/png' } } }
    },
    {
        name: 'Reports warnings/errors if the HTML checker returns messages (default)',
        overrides: htmlCheckerMock({ error: true }),
        reports: [{
            message: defaultCheckerMessages.messages[0].message,
            position: {
                column: defaultCheckerMessages.messages[0].firstColumn,
                line: defaultCheckerMessages.messages[0].lastLine
            },
            severity: Severity.error
        }, {
            message: defaultCheckerMessages.messages[1].message,
            position: {
                column: defaultCheckerMessages.messages[1].firstColumn,
                line: defaultCheckerMessages.messages[1].lastLine
            },
            severity: Severity.warning
        }]
    }
];

const testsForIgnoreStringConfigs: HintTest[] = [
    {
        name: 'Ignore selected message(string) from the report',
        overrides: htmlCheckerMock({ error: true }),
        reports: [{
            message: defaultCheckerMessages.messages[0].message,
            position: {
                column: defaultCheckerMessages.messages[0].firstColumn,
                line: defaultCheckerMessages.messages[0].lastLine
            },
            severity: Severity.error
        }]
    }
];

const testsForIgnoreArrayConfigs: HintTest[] = [
    {
        name: 'Ignore selected messages(array) from the report',
        overrides: htmlCheckerMock({ error: true })
    }
];

const testsForValidatorConfig: HintTest[] = [
    {
        name: 'Use configed validator service other than the default',
        overrides: htmlCheckerMock({ error: true }),
        reports: [{
            message: configCheckerMessages.messages[0].message,
            position: {
                column: configCheckerMessages.messages[0].firstColumn,
                line: configCheckerMessages.messages[0].lastLine
            }
        }]
    }
];

const testsForDetailsConfig: HintTest[] = [
    {
        name: 'Configure to show complete list of errors/warnings',
        overrides: htmlCheckerMock({ pass: true })
    },
    {
        name: 'Reports warnings/errors if the HTML checker returns messages (details config)',
        overrides: htmlCheckerMock({ error: true }),
        reports: [{
            message: defaultCheckerMessages.messages[0].message,
            position: {
                column: defaultCheckerMessages.messages[0].firstColumn,
                line: defaultCheckerMessages.messages[0].lastLine
            },
            severity: Severity.error
        }, {
            message: defaultCheckerMessages.messages[1].message,
            position: {
                column: defaultCheckerMessages.messages[1].firstColumn,
                line: defaultCheckerMessages.messages[1].lastLine
            },
            severity: Severity.warning
        }, {
            message: defaultCheckerMessages.messages[2].message,
            position: {
                column: defaultCheckerMessages.messages[2].firstColumn,
                line: defaultCheckerMessages.messages[2].lastLine
            },
            severity: Severity.information
        }]
    }
];

const testsForErrors: HintTest[] = [
    {
        name: 'Reports error when not able to get result from the HTML Checker',
        overrides: htmlCheckerMock({ reject: true }),
        reports: [{ message: `Could not get results from HTML checker for '${exampleUrl}'. Error: '${validatorError}'.` }]
    }
];

testHint(hintPath, testsForDefaults, { serial: true });
testHint(hintPath, testsForIgnoreStringConfigs, {
    hintOptions: { ignore: defaultCheckerMessages.messages[1].message },
    serial: true
});
testHint(hintPath, testsForIgnoreArrayConfigs, {
    hintOptions: { ignore: [defaultCheckerMessages.messages[0].message, defaultCheckerMessages.messages[1].message] },
    serial: true
});
testHint(hintPath, testsForValidatorConfig, {
    hintOptions: { validator: configValidator },
    serial: true
});
testHint(hintPath, testsForDetailsConfig, {
    hintOptions: { details: true },
    serial: true
});

testHint(hintPath, testsForErrors);
