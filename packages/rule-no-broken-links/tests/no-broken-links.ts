import { generateHTMLPage } from 'sonarwhal/dist/tests/helpers/misc';
import { RuleTest } from 'sonarwhal/dist/tests/helpers/rule-test-type';
import * as ruleRunner from 'sonarwhal/dist/tests/helpers/rule-runner';
import { getRuleName } from 'sonarwhal/dist/src/lib/utils/rule-helpers';

const ruleName = getRuleName(__dirname);

const bodyWithValidLinks = `<div>
<a href='https://example.com/'>Example</a>
<a href='/about'>About</a>
</div>`;

const bodyWithImageSource = `<div>
<img src='https://sonarwhal.com/static/images/next-arrow-c558ba3f13.svg'/>
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

const tests: Array<RuleTest> = [
    {
        name: `This test should pass as it has links with valid href value`,
        serverConfig: {
            '/': {content: generateHTMLPage(null, bodyWithValidLinks)},
            '/about': {content: 'My about page content'}
        }
    },
    {
        name: `This test should pass as it has an img with valid src value(absolute)`,
        serverConfig: generateHTMLPage(null, bodyWithImageSource)
    },
    {
        name: `This test should fail as it has a link with 404 href value(absolute)`,
        reports: [{ message: `Broken link found (404 response)` }],
        serverConfig: generateHTMLPage(null, bodyWithBrokenLinks)
    },
    {
        name: `This test should fail as it has an img with 404 src value(absolute)`,
        reports: [{ message: `Broken link found (404 response)` }],
        serverConfig: generateHTMLPage(null, bodyWithBrokenImageSource)
    },
    {
        name: `This test should fail as it has a link with 404 href value(absolute)`,
        reports: [{ message: `Broken link found (404 response)` }],
        serverConfig: generateHTMLPage(null, bodyWithValidLinksAndBrokenLinks)
    },
    {
        name: `This test should fail as it has a link with 500 href value(relative)`,
        reports: [{ message: `Broken link found (500 response)` }],
        serverConfig: {
            '/': {content: generateHTMLPage(null, bodyWithRelative500Links)},
            '/500': {status: 500}
        }
    },
    {
        name: `This test should fail as it has a link with 410 href value(relative)`,
        reports: [{ message: `Broken link found (410 response)` }],
        serverConfig: {
            '/': {content: generateHTMLPage(null, bodyWithRelative410Links)},
            '/410': {status: 410}
        }
    },
    {
        name: `This test should fail as it has a link with 404 href value(relative)`,
        reports: [{ message: `Broken link found (404 response)` }],
        serverConfig: {
            '/': {content: generateHTMLPage(null, bodyWithRelative404Links)},
            '/404': {status: 404}
        }
    },
    {
        name: `This test should fail as it has a link with 503 href value(relative)`,
        reports: [{ message: `Broken link found (503 response)` }],
        serverConfig: {
            '/': {content: generateHTMLPage(null, bodyWithRelative503Links)},
            '/503': {status: 503}
        }
    }
];

ruleRunner.testRule(ruleName, tests);
