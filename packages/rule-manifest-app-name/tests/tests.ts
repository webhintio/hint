import { generateHTMLPage } from 'sonarwhal/dist/tests/helpers/misc';
import { getRuleName } from 'sonarwhal/dist/src/lib/utils/rule-helpers';
import { RuleTest } from 'sonarwhal/dist/tests/helpers/rule-test-type';
import * as ruleRunner from 'sonarwhal/dist/tests/helpers/rule-runner';

const htmlWithManifestSpecified = generateHTMLPage('<link rel="manifest" href="site.webmanifest">');

const tests: Array<RuleTest> = [
    {
        name: `Manifest is not specified, so the rule does not apply and the test should pass`,
        serverConfig: generateHTMLPage('<link rel="stylesheet" href="style.css">')
    },
    {
        name: `Manifest is specified and its content is not valid JSON, so the rule does not apply and the test should pass`,
        serverConfig: {
            '/': htmlWithManifestSpecified,
            '/site.webmanifest': 'x'
        }
    },
    {
        name: `Manifest is specified without 'name' and 'short_name'`,
        reports: [{ message: `Manifest should contain the 'name' member` }],
        serverConfig: {
            '/': htmlWithManifestSpecified,
            '/site.webmanifest': { content: '{}' }
        }
    },
    {
        name: `Manifest is specified with empty 'name' and no 'short_name'`,
        reports: [{ message: `Manifest should contain non-empty 'name' member` }],
        serverConfig: {
            '/': htmlWithManifestSpecified,
            '/site.webmanifest': { content: `{ "name": "     " }` }
        }
    },
    {
        name: `Manifest is specified with 'name' and no 'short_name'`,
        serverConfig: {
            '/': htmlWithManifestSpecified,
            '/site.webmanifest': { content: `{ "name": "🐛🐛🐛🐛🐛🐛🐛🐛🐛🐛🐛🐛" }` }
        }
    },
    {
        name: `Manifest is specified with long 'name' and 'short_name'`,
        reports: [{ message: `Manifest should have 'name' member under 30 characters` }],
        serverConfig: {
            '/': htmlWithManifestSpecified,
            '/site.webmanifest': { content: `{ "name": "1234567890123456789012345678901", "short_name": "test" }` }
        }
    },
    {
        name: `Manifest is specified with 'name' and 'short_name'`,
        serverConfig: {
            '/': htmlWithManifestSpecified,
            '/site.webmanifest': { content: `{ "name": "12345678901", "short_name": "🐛🐛🐛🐛🐛🐛🐛🐛🐛🐛🐛🐛" }` }
        }
    },
    {
        name: `Manifest is specified with 'name' and empty 'short_name'`,
        reports: [{ message: `Manifest should contain non-empty 'short_name' member` }],
        serverConfig: {
            '/': htmlWithManifestSpecified,
            '/site.webmanifest': { content: `{ "name": "12345678901", "short_name": "  " }` }
        }
    },
    {
        name: `Manifest is specified with 'name' and long 'short_name'`,
        reports: [{ message: `Manifest should have 'short_name' member under 12 characters` }],
        serverConfig: {
            '/': htmlWithManifestSpecified,
            '/site.webmanifest': { content: `{ "name": "12345678901", "short_name": "1234567890123" }` }
        }
    },
    {
        name: `Manifest is specified but request for file fails`,
        serverConfig: {
            '/': htmlWithManifestSpecified,
            '/site.webmanifest': null
        }
    },
    {
        name: `Manifest is specified but request for file fails with status code 404`,
        serverConfig: {
            '/': htmlWithManifestSpecified,
            '/site.webmanifest': { status: 404 }
        }
    },
    {
        name: `Manifest is specified but content is undefined`,
        reports: [{ message: `Manifest file does not contain valid JSON` }],
        serverConfig: {
            '/': htmlWithManifestSpecified,
            '/site.webmanifest': { content: void 0 }
        }
    }
];

ruleRunner.testRule(getRuleName(__dirname), tests);
