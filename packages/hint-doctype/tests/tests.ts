import * as os from 'os';
import { getHintPath } from 'hint/dist/src/lib/utils/hint-helpers';
import { HintTest } from '@hint/utils-tests-helpers/dist/src/hint-test-type';
import * as hintRunner from '@hint/utils-tests-helpers/dist/src/hint-runner';

const hintPath = getHintPath(__filename);

const normalizeEOL = (text: string): string => {
    return text.replace(/\n/g, os.EOL);
};

const tests: HintTest[] = [
    {
        name: `'doctype' is not in the first line should fail`,
        reports: [{ message: `'doctype' should be specified before anything else.`, position: { match: '<!DOCTYPE html>' } }],
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
        reports: [{ message: `'doctype' is not needed as one was already specified.`, position: { match: '<!DOCTYPE html><!-- Report -->' } }],
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
        name: `'doctype' not found should fail`,
        reports: [{ message: `'doctype' was not specified.` }],
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
        reports: [{ message: `'doctype' should be specified as '<!doctype html>'.` }],
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
        reports: [{ message: `'doctype' should be specified as '<!doctype html>'.` }],
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
        reports: [{ message: `'doctype' should be specified as '<!doctype html>'.` }],
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

hintRunner.testHint(hintPath, tests);
