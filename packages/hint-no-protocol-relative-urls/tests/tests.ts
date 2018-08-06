/* eslint sort-keys: 0, no-undefined: 0 */

import generateHTMLPage from 'hint/dist/src/lib/utils/misc/generate-html-page';
import { getHintPath } from 'hint/dist/src/lib/utils/hint-helpers';
import { HintTest } from '@hint/utils-tests-helpers/dist/src/hint-test-type';
import * as hintRunner from '@hint/utils-tests-helpers/dist/src/hint-runner';

const generateErrorMessage = (url: string): string => {
    return `'${url}' should not be specified as a protocol-relative URL.`;
};

const tests: Array<HintTest> = [
    {
        name: `'link' with no initial slashes passes the hint`,
        serverConfig: generateHTMLPage('<link rel="manifest" href="site.webmanifest">')
    },
    {
        name: `'link' with initial / passes the hint`,
        serverConfig: generateHTMLPage('<link rel="manifest" href="/site.webmanifest">')
    },
    {
        name: `'link' with http passes the hint`,
        serverConfig: generateHTMLPage('<link rel="manifest" href="http://localhost/site.webmanifest">')
    },
    {
        name: `'link' with initial // fails the hint`,
        reports: [{
            message: generateErrorMessage('//site.webmanifest'),
            position: { column: 37, line: 2 }
        }],
        serverConfig: generateHTMLPage('<link rel="manifest" href="//site.webmanifest">')
    },
    {
        name: `'script' with no initial slashes passes the hint`,
        serverConfig: generateHTMLPage(undefined, '<script src="script.js"></script>')
    },
    {
        name: `'script' with initial / passes the hint`,
        serverConfig: generateHTMLPage(undefined, '<script src="/script.js"></script>')
    },
    {
        name: `'script' with http passes the hint`,
        serverConfig: generateHTMLPage(undefined, '<script src="http://localhost/script.js"></script>')
    },
    {
        name: `'script' with initial // fails the hint`,
        reports: [{
            message: generateErrorMessage('//script.js'),
            position: { column: 23, line: 5 }
        }],
        serverConfig: generateHTMLPage(undefined, '<script src="//script.js"></script>')
    },
    {
        name: `'a' with no initial slashes passes the hint`,
        serverConfig: generateHTMLPage(undefined, '<a href="home">home</a>')
    },
    {
        name: `'a' with initial / passes the hint`,
        serverConfig: generateHTMLPage(undefined, '<a href="/home">home</a>')
    },
    {
        name: `'a' with http passes the hint`,
        serverConfig: generateHTMLPage(undefined, '<a href="http://localhost/home">home</a>')
    },
    {
        name: `'a' with initial // fails the hint`,
        reports: [{
            message: generateErrorMessage('//home'),
            position: { column: 19, line: 5 }
        }],
        serverConfig: generateHTMLPage(undefined, '<a href="//home">home</a>')
    },
    {
        name: `'script' with no "src" passes the hint`,
        serverConfig: generateHTMLPage(undefined, '<script>var a = 10;</script>')
    }
];

hintRunner.testHint(getHintPath(__filename), tests);
