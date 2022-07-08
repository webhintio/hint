import * as os from 'os';
import { getHintPath, HintTest, testHint } from '@hint/utils-tests-helpers';
import { Severity } from '@hint/utils-types';

const hintPath = getHintPath(__filename);

const normalizeEOL = (text: string): string => {
    return text.replace(/\n/g, os.EOL);
};

const tests: HintTest[] = [
    {
        name: `'doctype' is not in the first line should fail`,
        reports: [{
            fixes: {
                match: normalizeEOL(`<!DOCTYPE html>\n<p><span></span>
                <head></head>
                
                `)
            },
            message: `'doctype' should be specified before anything else.`,
            position: { match: '<!DOCTYPE html>' },
            severity: Severity.error
        }],
        serverConfig: {
            '/': {
                content: normalizeEOL(`<p><span></span>
                <head></head>
                <!DOCTYPE html>
                `),
                headers: { 'Content-Type': 'text/html' }
            }
        }
    },
    {
        name: `Document starting with empty line instead of 'doctype' should pass`,
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
        name: `'doctype' found more than once should fail`,
        reports: [{
            fixes: {
                match: normalizeEOL(`<!DOCTYPE html>
                <p><span></span>
                <head></head>
                <!-- Report -->
                `)
            },
            message: `'doctype' is not needed as one was already specified.`,
            position: { match: '<!DOCTYPE html><!-- Report -->' },
            severity: Severity.warning
        }],
        serverConfig: {
            '/': {
                content: normalizeEOL(`<!DOCTYPE html>
                <p><span></span>
                <head></head>
                <!DOCTYPE html><!-- Report -->
                `),
                headers: { 'Content-Type': 'text/html' }
            }
        }
    },
    {
        name: `'doctype' not found should fail`,
        reports: [{
            fixes: {
                match: `<!doctype html>${os.EOL}<head>

                </head>
                <body></body>
                `
            },
            message: `'doctype' was not specified.`,
            severity: Severity.error
        }],
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
        name: `'doctype' with additional info on same line should pass`,
        serverConfig: {
            '/': {
                content: `<!doctype html></br>`,
                headers: { 'Content-Type': 'text/html' }
            }
        }
    },
    {
        name: `'doctype' as text in document should pass`,
        serverConfig: {
            '/': {
                content: `<!doctype html><p>doctype</p>`,
                headers: { 'Content-Type': 'text/html' }
            }
        }
    },
    {
        name: `'doctype' not valid should fail`,
        reports: [{
            fixes: {
                match: `<!doctype html>
                <head></head>
                <body></body>
                `
            },
            message: `'doctype' should be specified as '<!doctype html>'.`,
            severity: Severity.error
        }],
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
        name: `'doctype' regular with no space between terms should fail`,
        reports: [{
            fixes: {
                match: `<!doctype html>
                <head></head>
                <body></body>
                `
            },
            message: `'doctype' should be specified as '<!doctype html>'.`,
            severity: Severity.warning
        }],
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
        name: `'doctype' with legacy-compat should fail`,
        reports: [{
            fixes: {
                match: `<!doctype html>
                <head></head>
                <body></body>
                `
            },
            message: `'doctype' should be specified as '<!doctype html>'.`,
            severity: Severity.warning
        }],
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
        name: `'doctype' regular with one more spaces after html should pass`,
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
        name: `'doctype' found on first line and nothing else found should pass`,
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
        name: `'doctype' is lowercase should pass`,
        serverConfig: {
            '/': {
                content: `<!doctype html>`,
                headers: { 'Content-Type': 'text/html' }
            }
        }
    },
    {
        name: `'doctype' in uppercase should pass`,
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
        name: `'doctype' appearing only once should pass`,
        serverConfig: {
            '/': {
                content: `<!doctype html>
                <p></p>`,
                headers: { 'Content-Type': 'text/html' }
            }
        }
    }
];

testHint(hintPath, tests);
