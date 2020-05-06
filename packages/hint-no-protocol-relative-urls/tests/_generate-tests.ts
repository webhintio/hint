import { generateHTMLPage } from '@hint/utils-create-server';
import { HintTest } from '@hint/utils-tests-helpers';
import { Severity } from '@hint/utils-types';

const errorMessage = 'References to URLs should not be protocol-relative.';

const getTests = (severity: Severity) => {

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
                message: errorMessage,
                position: { match: 'link rel="manifest" href="//site.webmanifest"' },
                severity
            }],
            serverConfig: generateHTMLPage('<link rel="manifest" href="//site.webmanifest">')
        },
        {
            name: `'link' for 'dns-prefetch' with initial // passes the hint`,
            serverConfig: generateHTMLPage('<link rel="dns-prefetch" href="//host_name_to_prefetch.com">')
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
                message: errorMessage,
                position: { match: 'script src="//script.js"' },
                severity
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
                message: errorMessage,
                position: { match: 'a href="//home"' },
                severity
            }],
            serverConfig: generateHTMLPage(undefined, '<a href="//home">home</a>')
        },
        {
            name: `'script' with no "src" passes the hint`,
            serverConfig: generateHTMLPage(undefined, '<script>var a = 10;</script>')
        }
    ];

    return tests;
};

export { getTests };
