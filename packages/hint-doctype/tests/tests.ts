import { getHintPath } from 'hint/dist/src/lib/utils/hint-helpers';
import { HintTest } from '@hint/utils-tests-helpers/dist/src/hint-test-type';
import * as hintRunner from '@hint/utils-tests-helpers/dist/src/hint-runner';

const hintPath = getHintPath(__filename);

const tests: Array<HintTest> = [
    {
        name: 'HTML with no content should fail',
        reports: [{ message: `Content has no body` }],
        serverConfig: {
            '/': {
                content: '',
                headers: { 'Content-Type': 'text/html' }
            }
        }
    },
    {
        name: 'Doctype not found should fail',
        reports: [{ message: `The resource does not contain a valid doctype tag` }],
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
        name: 'Doctype not valid should fail',
        reports: [{ message: `The resource does not contain a valid doctype tag` }],
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
        name: 'Doctype with one more spaces after html should pass',
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
        name: 'Doctype found on first line and nothing else found should pass',
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
        name: 'Doctype with additional info on same line should fail',
        reports: [{ message: `There is additional information on the line with the doctype tag` }],
        serverConfig: {
            '/': {
                content: `<!doctype html>sadioklj`,
                headers: { 'Content-Type': 'text/html' }
            }
        }
    },
    {
        name: 'Doctype is not lowercase should fail',
        reports: [{ message: `The doctype should be in lowercase` }],
        serverConfig: {
            '/': {
                content: `<!DOCTYPE html>`,
                headers: { 'Content-Type': 'text/html' }
            }
        }
    },
    {
        name: 'Doctype is lowercase should pass',
        serverConfig: {
            '/': {
                content: `<!doctype html>`,
                headers: { 'Content-Type': 'text/html' }
            }
        }
    },
    {
        name: 'Doctype appearing more than once should fail',
        reports: [{ message: `There is more than one doctype tag in the document` }],
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
        name: 'Doctype appearing only once should pass',
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
