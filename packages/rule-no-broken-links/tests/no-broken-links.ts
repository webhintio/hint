import { generateHTMLPage } from 'sonarwhal/dist/tests/helpers/misc';
import { RuleTest } from 'sonarwhal/dist/tests/helpers/rule-test-type';
import * as ruleRunner from 'sonarwhal/dist/tests/helpers/rule-runner';
import { getRuleName } from 'sonarwhal/dist/src/lib/utils/rule-helpers';

const ruleName = getRuleName(__dirname);

const bodyWithValidLinks = `<div>
<a href='https://example.com/'>Example</a>
</div>`;

const bodyWithImageSource = `<div>
<img src='https://sonarwhal.com/static/images/next-arrow-c558ba3f13.svg' />
</div>`;

const bodyWithBrokenLinks = `<div>
<a href='https://example.com/404'>Example</a>
</div>`;

const bodyWith500StatusCodeLinks = `<div>
<a href='https://example.com/500'>Example</a>
</div>`;

const bodyWithBrokenImageSource = `<div>
<img src='https://example.com/404.png' />
</div>`;

const bodyWithValidLinksAndBrokenLinks = `<div>
<a href='https://example.com/'>Example</a>
<a href='https://example.com/404'>Example2</a>
</div>`;

const tests: Array<RuleTest> = [
    {
        name: `This test should pass`,
        serverConfig: generateHTMLPage(null, bodyWithValidLinks)
    },
    {
        name: `This test should pass`,
        serverConfig: generateHTMLPage(null, bodyWithImageSource)
    },
    {
        name: `This test should fail`,
        reports: [{ message: `Broken link found (404 response)` }],
        serverConfig: generateHTMLPage(null, bodyWithBrokenLinks)
    },
    {
        name: `This test should fail`,
        reports: [{ message: `Broken link found (404 response)` }],
        serverConfig: generateHTMLPage(null, bodyWithBrokenImageSource)
    },
    {
        name: `This test should fail`,
        reports: [{ message: `Broken link found (500 response)` }],
        serverConfig: generateHTMLPage(null, bodyWith500StatusCodeLinks)
    },
    {
        name: `This test should fail`,
        reports: [{ message: `Broken link found (404 response)` }],
        serverConfig: generateHTMLPage(null, bodyWithValidLinksAndBrokenLinks)
    }
];

ruleRunner.testRule(ruleName, tests);
