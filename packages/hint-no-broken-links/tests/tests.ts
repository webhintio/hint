import generateHTMLPage from 'hint/dist/src/lib/utils/misc/generate-html-page';
import { HintTest } from '@hint/utils-tests-helpers/dist/src/hint-test-type';
import * as hintRunner from '@hint/utils-tests-helpers/dist/src/hint-runner';
import { getHintPath } from 'hint/dist/src/lib/utils/hint-helpers';

const hintPath = getHintPath(__filename);

const bodyWithValidLinks = `<div>
<a href='https://example.com/'>Example</a>
<a href='/about'>About</a>
</div>`;

const bodyWithImageSource = `<div>
<img src='https://webhint.io/static/images/next-arrow-c558ba3f13.svg'/>
</div>`;

const bodyWithValidRelativeLink = `<div>
<a href='about'>About</a>
</div>`;

const bodyWithBrokenLinks = `<div>
<a href='https://example.com/404'>Example</a>
</div>`;

const bodyWithBrokenImageSource = `<div>
<img src='https://example.com/404.png'/>
</div>`;

const bodyWithValidLinksAndBrokenLinks = `<div>
<a href='https://example.com/'>Example</a>
<a href='https://example.com/404'>Example2</a>
</div>`;

const bodyWithRelative500Links = `<div>
<a href='/500'>Example</a>
</div>`;

const bodyWithRelative410Links = `<div>
<a href='/410'>Example</a>
</div>`;

const bodyWithRelative404Links = `<div>
<a href='/410'>Example</a>
</div>`;

const bodyWithRelative503Links = `<div>
<a href='/503'>Example</a>
</div>`;

const bodyWithBrokenScriptTag = `<div>
<script href='/404'>Example</script>
</div>`;

const bodyWithBrokenLinkTag = `<div>
<link rel="stylesheet" href='/404'>
</div>`;

const bodyWithBrokenImageSrcSets = `<div>
<img alt="test" src="/1.jpg" srcset="2.jpg 640w,3.jpg 750w , 4.jpg 1080w">
</div>`;

const bodyWithBrokenVideo = `<div>
<video controls src="/1.mp4" poster="/2.png">
</div>`;

const tests: Array<HintTest> = [
    {
        name: `This test should pass as it has links with valid href value`,
        serverConfig: {
            '/': {content: generateHTMLPage('', bodyWithValidLinks)},
            '/about': {content: 'My about page content'}
        }
    },
    {
        name: `This test should pass as it has an img with valid src value(absolute)`,
        serverConfig: generateHTMLPage('', bodyWithImageSource)
    },
    {
        name: `This test should pass as it has links with valid href values and a base tag which gets not used`,
        serverConfig: {
            '/': {content: generateHTMLPage('<base href="nested/">', bodyWithValidLinks)},
            '/about': {content: 'My about page content'}
        }
    },
    {
        name: `This test should pass as it has a link a valid link (when resolved with the base tag)`,
        serverConfig: {
            '/': {content: generateHTMLPage('<base href="nested/">', bodyWithValidRelativeLink)},
            '/nested/about': {content: 'My about page content'}
        }
    },
    {
        name: `This test should fail as it has a link with 404 href value(absolute)`,
        reports: [{ message: `Broken link found (404 response).` }],
        serverConfig: generateHTMLPage('', bodyWithBrokenLinks)
    },
    {
        name: `This test should fail as it has an img with 404 src value(absolute)`,
        reports: [{ message: `Broken link found (404 response).` }],
        serverConfig: generateHTMLPage('', bodyWithBrokenImageSource)
    },
    {
        name: `This test should fail as it has a link with 404 href value(absolute)`,
        reports: [{ message: `Broken link found (404 response).` }],
        serverConfig: generateHTMLPage('', bodyWithValidLinksAndBrokenLinks)
    },
    {
        name: `This test should fail as it has a link with 500 href value(relative)`,
        reports: [{ message: `Broken link found (500 response).` }],
        serverConfig: {
            '/': {content: generateHTMLPage('', bodyWithRelative500Links)},
            '/500': {status: 500}
        }
    },
    {
        name: `This test should fail as it has a link with 410 href value(relative)`,
        reports: [{ message: `Broken link found (410 response).` }],
        serverConfig: {
            '/': {content: generateHTMLPage('', bodyWithRelative410Links)},
            '/410': {status: 410}
        }
    },
    {
        name: `This test should fail as it has a link with 404 href value(relative)`,
        reports: [{ message: `Broken link found (404 response).` }],
        serverConfig: {
            '/': {content: generateHTMLPage('', bodyWithRelative404Links)},
            '/404': {status: 404}
        }
    },
    {
        name: `This test should fail as it has a link with 503 href value(relative)`,
        reports: [{ message: `Broken link found (503 response).` }],
        serverConfig: {
            '/': {content: generateHTMLPage('', bodyWithRelative503Links)},
            '/503': {status: 503}
        }
    },
    {
        name: `This test should fail as it has a link with 404 href value`,
        reports: [{ message: `Broken link found (404 response).` }],
        serverConfig: {
            '/': {content: generateHTMLPage('', bodyWithBrokenScriptTag)},
            '/404': {status: 404}
        }
    },
    {
        name: `This test should fail as it has a script with 404 src value`,
        reports: [{ message: `Broken link found (404 response).` }],
        serverConfig: {
            '/': {content: generateHTMLPage('', bodyWithBrokenLinkTag)},
            '/404': {status: 404}
        }
    },
    {
        name: `This test should fail as it has an img with 404 src and srcset values`,
        reports: [
            { message: `Broken link found (404 response).`},
            { message: `Broken link found (404 response).`},
            { message: `Broken link found (404 response).`}
        ],
        serverConfig: {
            '/': {content: generateHTMLPage('', bodyWithBrokenImageSrcSets)},
            '/1.jpg': {status: 404},
            '/2.jpg': '',
            '/3.jpg': {status: 404},
            '/4.jpg': {status: 404}
        }
    },
    {
        name: `This test should fail as it has a video tag broken poster and src`,
        reports: [
            { message: `Broken link found (404 response).`},
            { message: `Broken link found (404 response).`}
        ],
        serverConfig: {
            '/': {content: generateHTMLPage('', bodyWithBrokenVideo)},
            '/1.mp4': {status: 404},
            '/2.png': {status: 404}
        }
    }
];

hintRunner.testHint(hintPath, tests);
