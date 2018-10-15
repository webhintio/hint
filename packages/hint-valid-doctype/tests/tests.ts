import { getHintPath } from 'hint/dist/src/lib/utils/hint-helpers';
import { HintTest } from '@hint/utils-tests-helpers/dist/src/hint-test-type';
import * as hintRunner from '@hint/utils-tests-helpers/dist/src/hint-runner';

const hintPath = getHintPath(__filename);

const tests: Array<HintTest> = [
    {
        name: 'HTML with no content should fail',
        reports: [{ message: `Content has no body.` }],
        serverConfig: {
            '/': {
                content: '',
                headers: { 'Content-Type': 'text/html' }
            }
        }
    },
    {
        name: 'Doctype not found on first line should fail',
        reports: [{ message: `The first line does not contain a valid doctype tag.` }],
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
        name: 'Doctype found on first line but but has additional information should fail',
        reports: [{ message: `The first line contain more than a valid doctype tag: <!doctype html> <head>` }],
        serverConfig: {
            '/': {
                content: `<!doctype html> <head>

                </head>
                <body></body>
                `,
                headers: { 'Content-Type': 'text/html' }
            }
        }
    },
    ,
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
];

hintRunner.testHint(hintPath, tests);
