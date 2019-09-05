import { readFileSync } from 'fs';

import { HintTest, testHint } from '@hint/utils-tests-helpers';
import { test } from '@hint/utils';

const { generateHTMLPage, getHintPath } = test;
const hintPath = getHintPath(__filename);

const png = readFileSync(`${__dirname}/fixtures/nellie-studying.png`);

const noInsecureRedirectMessage = 'Should not be redirected from HTTPS.';
const serveOverHTTPSMessage = 'Should be served over HTTPS.';

const generateResponse = (content: Buffer, type: string): Object => {
    return {
        content,
        headers: { 'Content-Type': type }
    };
};

const testsHTTPS: HintTest[] = [
    {
        name: 'HTML page with no resources over HTTPS passes',
        serverConfig: generateHTMLPage()
    },
    {
        name: 'If source is HTTPS, it should pass',
        serverConfig: {
            '/': { content: generateHTMLPage('', '<img src="https://localhost/nellie-studying.png">') },
            'nellie-studying.png': generateResponse(png, 'image/png')
        }
    },
    {
        name: 'If source is a relative protocol, it should pass',
        serverConfig: {
            '/': { content: generateHTMLPage('', '<img src="//localhost/nellie-studying.png">') },
            '/nellie-studying.png': generateResponse(png, 'image/png')
        }
    },
    {
        name: `HTTPS page with HTTP resources should fail`,
        reports: [{ message: serveOverHTTPSMessage }],
        serverConfig: { '/': { content: generateHTMLPage('', '<img src="http://example.com/image.png">') } }
    },
    {
        name: 'Redirect in resource fails (png)',
        reports: [{ message: noInsecureRedirectMessage }],
        serverConfig: {
            '/': generateHTMLPage('', '<img src="/image.png">'),
            '/image.png': {
                // If this test fails, check the image src.
                content: 'http://webhint.io/static/images/home-hello-nellie-87201a8cb4.svg',
                status: 302
            }
        }
    },
    {
        name: `HTTPS page with HTTP img srcset and should fail`,
        reports: [{ message: serveOverHTTPSMessage }],
        serverConfig: { '/': { content: generateHTMLPage('', '<img src="https://example.com/image.png" srcset="http://example.com/image.png 1x, https://example.com/image.png 2x">') } }
    },
    {
        name: `HTTPS page with HTTP object data should fail`,
        reports: [{ message: serveOverHTTPSMessage }],
        serverConfig: { '/': { content: generateHTMLPage('', '<object data="http://example.com/image.png"><object>') } }
    },
    {
        name: `HTTPS page with HTTP video source and poster should fail`,
        reports: [
            { message: serveOverHTTPSMessage },
            { message: serveOverHTTPSMessage }
        ],
        serverConfig: {
            '/': {
                content: generateHTMLPage('', `<video width="480" controls poster="http://ia800502.us.archive.org/10/items/WebmVp8Vorbis/webmvp8.gif" >
        <source src="https://archive.org/download/WebmVp8Vorbis/webmvp8.webm" type="video/webm">
        <source src="https://archive.org/download/WebmVp8Vorbis/webmvp8_512kb.mp4" type="video/mp4">
        <source src="http://ia800502.us.archive.org/10/items/WebmVp8Vorbis/webmvp8.ogv" type="video/ogg">
        Your browser doesn't support HTML5 video tag.
    </video>`)
            }
        },
        skip: true
    },
    {
        name: `Resource is not an HTML document`,
        serverConfig: { '/': { headers: { 'Content-Type': 'image/png' } } }
    }
];

testHint(hintPath, testsHTTPS, { https: true });
