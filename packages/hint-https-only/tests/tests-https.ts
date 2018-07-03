import { readFileSync } from 'fs';

import { HintTest } from '@hint/utils-tests-helpers/dist/src/hint-test-type';
import { getHintPath } from 'hint/dist/src/lib/utils/hint-helpers';
import * as hintRunner from '@hint/utils-tests-helpers/dist/src/hint-runner';
import generateHTMLPage from 'hint/dist/src/lib/utils/misc/generate-html-page';

const hintPath = getHintPath(__filename);

const png = readFileSync(`${__dirname}/fixtures/nellie-studying.png`);

const generateResponse = (content: Buffer, type: string): Object => {
    return {
        content,
        headers: { 'Content-Type': type }
    };
};

const testsHTTPS: Array<HintTest> = [
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
        reports: [{ message: 'Should be served over HTTPS' }],
        serverConfig: { '/': { content: generateHTMLPage('', '<img src="http://example.com/image.png">') } }
    },
    {
        name: 'Redirect in resource fails',
        reports: [{ message: `Shouldn't be redirected from HTTP` }],
        // If this test fails, check the image src.
        serverConfig: { '/': { content: generateHTMLPage('', '<img src="http://webhint.io/static/images/home-hello-nellie-87201a8cb4.svg">') } }
    },
    {
        name: 'Redirect in resource fails',
        reports: [{ message: `Shouldn't be redirected from HTTP` }],
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
        reports: [{ message: 'Should be served over HTTPS' }],
        serverConfig: { '/': { content: generateHTMLPage('', '<img src="https://example.com/image.png" srcset="http://example.com/image.png 1x, https://example.com/image.png 2x">') } }
    },
    {
        name: `HTTPS page with HTTP object data should fail`,
        reports: [{ message: 'Should be served over HTTPS' }],
        serverConfig: { '/': { content: generateHTMLPage('', '<object data="http://example.com/image.png"><object>') } }
    },
    {
        name: `HTTPS page with HTTP video source and poster should fail`,
        reports: [{ message: 'Should be served over HTTPS' }, { message: 'Should be served over HTTPS' }],
        serverConfig: {
            '/': {
                content: generateHTMLPage('', `<video width="480" controls poster="http://ia800502.us.archive.org/10/items/WebmVp8Vorbis/webmvp8.gif" >
    <source src="https://archive.org/download/WebmVp8Vorbis/webmvp8.webm" type="video/webm">
    <source src="https://archive.org/download/WebmVp8Vorbis/webmvp8_512kb.mp4" type="video/mp4">
    <source src="http://ia800502.us.archive.org/10/items/WebmVp8Vorbis/webmvp8.ogv" type="video/ogg">
    Your browser doesn't support HTML5 video tag.
</video>`)
            }
        }
    },
    {
        name: `Resource is not an HTML document`,
        serverConfig: { '/': { headers: { 'Content-Type': 'image/png' } } }
    }
];

hintRunner.testHint(hintPath, testsHTTPS, { https: true });
