import { getHintPath } from 'hint/dist/src/lib/utils/hint-helpers';
import { HintTest } from '@hint/utils-tests-helpers/dist/src/hint-test-type';
import * as hintRunner from '@hint/utils-tests-helpers/dist/src/hint-runner';

const hintPath = getHintPath(__filename);

const tests: Array<HintTest> = [
    {
        name: 'DOCTYPE is not in the first line should fail',
        reports: [{ message: `DOCTYPE is not in the first line.` }],
        serverConfig: {
            '/': {
                content: `<p><span></span>
                <head></head>
                <!DOCTYPE html>
                `,
                headers: { 'Content-Type': 'text/html' }
            }
        }
    },
    {
        name: 'DOCTYPE found more than once should fail',
        reports: [{ message: `There is more than one DOCTYPE in the document.` }],
        serverConfig: {
            '/': {
                content: `<!DOCTYPE html>
                <p><span></span>
                <head></head>
                <!DOCTYPE html>
                `,
                headers: { 'Content-Type': 'text/html' }
            }
        }
    },
    {
        name: 'HTML with no content should fail',
        reports: [{ message: `Resource has no content.` }],
        serverConfig: {
            '/': {
                content: '',
                headers: { 'Content-Type': 'text/html' }
            }
        }
    },
    {
        name: 'DOCTYPE not found should fail',
        reports: [{ message: `The resource does not contain a valid DOCTYPE.` }],
        serverConfig: {
            '/': {
                content: `<head>

                </head>
                <body></body>
                `,
                headers: { 'Content-Type': 'text/html' }
            }
        }
    },
    {
        name: 'DOCTYPE not valid should fail',
        reports: [{ message: `The resource does not contain a valid DOCTYPE.` }],
        serverConfig: {
            '/': {
                content: `<!doctype htmltest>
                <head></head>
                <body></body>
                `,
                headers: { 'Content-Type': 'text/html' }
            }
        }
    },
    {
        name: 'DOCTYPE regular with no space between terms should fail',
        reports: [{ message: `The resource does not contain a valid DOCTYPE.` }],
        serverConfig: {
            '/': {
                content: `<!doctypehtml>
                <head></head>
                <body></body>
                `,
                headers: { 'Content-Type': 'text/html' }
            }
        }
    },
    {
        name: 'DOCTYPE legacy-compat with no space bewteen first two terms should fail',
        reports: [{ message: `The resource does not contain a valid DOCTYPE.` }],
        serverConfig: {
            '/': {
                content: `<!doctypehtml SYSTEM "about:legacy-compat">
                <head></head>
                <body></body>
                `,
                headers: { 'Content-Type': 'text/html' }
            }
        }
    },
    {
        name: 'DOCTYPE legacy-compat with no space between second two terms should fail',
        reports: [{ message: `The resource does not contain a valid DOCTYPE.` }],
        serverConfig: {
            '/': {
                content: `<!doctype htmlSYSTEM "about:legacy-compat">
                <head></head>
                <body></body>
                `,
                headers: { 'Content-Type': 'text/html' }
            }
        }
    },
    {
        name: 'DOCTYPE legacy-compat with no space bewteen third two terms should fail',
        reports: [{ message: `The resource does not contain a valid DOCTYPE.` }],
        serverConfig: {
            '/': {
                content: `<!doctype html SYSTEM"about:legacy-compat">
                <head></head>
                <body></body>
                `,
                headers: { 'Content-Type': 'text/html' }
            }
        }
    },
    {
        name: 'DOCTYPE with legacy-compat should pass',
        serverConfig: {
            '/': {
                content: `<!doctype html SYSTEM "about:legacy-compat">
                <head></head>
                <body></body>
                `,
                headers: { 'Content-Type': 'text/html' }
            }
        }
    },
    {
        name: 'DOCTYPE regular with one more spaces after html should pass',
        serverConfig: {
            '/': {
                content: `<!doctype html      >
                <head></head>
                <body></body>
                `,
                headers: { 'Content-Type': 'text/html' }
            }
        }
    },
    {
        name: 'DOCTYPE legacy-compat with one more spaces after html should pass',
        serverConfig: {
            '/': {
                content: `<!doctype html SYSTEM "about:legacy-compat"     >
                <head></head>
                <body></body>
                `,
                headers: { 'Content-Type': 'text/html' }
            }
        }
    },
    {
        name: 'DOCTYPE found on first line and nothing else found should pass',
        serverConfig: {
            '/': {
                content: `<!doctype html>
                <head></head>
                `,
                headers: { 'Content-Type': 'text/html' }
            }
        }
    },
    {
        name: 'DOCTYPE with additional info on same line should fail',
        reports: [{ message: `There is additional information on the line with the DOCTYPE.` }],
        serverConfig: {
            '/': {
                content: `<!doctype html></br>`,
                headers: { 'Content-Type': 'text/html' }
            }
        }
    },
    {
        name: 'DOCTYPE is lowercase should pass',
        serverConfig: {
            '/': {
                content: `<!doctype html>`,
                headers: { 'Content-Type': 'text/html' }
            }
        }
    },
    {
        name: 'DOCTYPE in uppercase should pass',
        serverConfig: {
            '/': {
                content: `<!DOCTYPE html>
                <head></head>
                <body></body>
                `,
                headers: { 'Content-Type': 'text/html' }
            }
        }
    },
    {
        name: 'DOCTYPE appearing more than once should fail',
        reports: [{ message: `There is more than one DOCTYPE in the document.` }],
        serverConfig: {
            '/': {
                content: `<!doctype html>
                <p></p>
                <!doctype html>`,
                headers: { 'Content-Type': 'text/html' }
            }
        }
    },
    {
        name: 'DOCTYPE appearing only once should pass',
        serverConfig: {
            '/': {
                content: `<!doctype html>
                <p></p>`,
                headers: { 'Content-Type': 'text/html' }
            }
        }
    }
];

hintRunner.testHint(hintPath, tests);
