import { test } from '@hint/utils';
import { HintTest, testHint } from '@hint/utils-tests-helpers';

const { generateHTMLPage, getHintPath } = test;
const generateErrorMessage = (url: string): string => {
    return `'${url}' should not be specified as a protocol-relative URL.`;
};

const tests: HintTest[] = [
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
            position: { match: 'link rel="manifest" href="//site.webmanifest"' }
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
            position: { match: 'script src="//script.js"' }
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
            position: { match: 'a href="//home"' }
        }],
        serverConfig: generateHTMLPage(undefined, '<a href="//home">home</a>')
    },
    {
        name: `'script' with no "src" passes the hint`,
        serverConfig: generateHTMLPage(undefined, '<script>var a = 10;</script>')
    }
];

testHint(getHintPath(__filename), tests);
