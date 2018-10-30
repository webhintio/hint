import { getHintPath } from 'hint/dist/src/lib/utils/hint-helpers';
import { HintTest } from '@hint/utils-tests-helpers/dist/src/hint-test-type';
import * as hintRunner from '@hint/utils-tests-helpers/dist/src/hint-runner';

const hintPath = getHintPath(__filename);

const tests: HintTest[] = [
    {
        name: 'DOCTYPE is not in the first line should fail',
        reports: [{ message: `\'DOCTYPE\' should be specified before anything else.`, position: { column: 16, line: 2 } }],
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
        name: 'Document starting with empty line instead of DOCTYPE should pass',
        serverConfig: {
            '/': {
                content: `
                <!doctype html>
                <p></p>`,
                headers: { 'Content-Type': 'text/html' }
            }
        }
    },
    {
        name: 'DOCTYPE found more than once should fail',
        reports: [{ message: `\'DOCTYPE\' is not needed as one was already specified.`, position: { column: 16, line: 3 } }],
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
        reports: [{ message: `'DOCTYPE' was not specified.` }],
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
        name: 'DOCTYPE with additional info on same line should pass',
        serverConfig: {
            '/': {
                content: `<!doctype html></br>`,
                headers: { 'Content-Type': 'text/html' }
            }
        }
    },
    {
        name: 'DOCTYPE as text in document should pass',
        serverConfig: {
            '/': {
                content: `<!doctype html><p>doctype</p>`,
                headers: { 'Content-Type': 'text/html' }
            }
        }
    },
    {
        name: 'DOCTYPE not valid should fail',
        reports: [{ message: `'DOCTYPE' should be specified as '<!doctype html>'.` }],
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
        reports: [{ message: `'DOCTYPE' should be specified as '<!doctype html>'.` }],
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
        name: 'DOCTYPE with legacy-compat should fail',
        reports: [{ message: `'DOCTYPE' should be specified as '<!doctype html>'.` }],
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
