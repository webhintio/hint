import { generateHTMLPage } from 'sonarwhal/dist/src/lib/utils/misc';
import { getRulePath } from 'sonarwhal/dist/src/lib/utils/rule-helpers';
import { RuleTest } from '@sonarwhal/utils-tests-helpers/dist/src/rule-test-type';
import * as ruleRunner from '@sonarwhal/utils-tests-helpers/dist/src/rule-runner';

const htmlWithManifestSpecified = generateHTMLPage('<link rel="manifest" href="site.webmanifest">');

const tests: Array<RuleTest> = [
    {
        name: `Web app manifest is specified without 'name' and 'short_name'`,
        reports: [{ message: `Should contain the 'name' property` }],
        serverConfig: {
            '/': htmlWithManifestSpecified,
            '/site.webmanifest': { content: '{}' }
        }
    },
    {
        name: `Web app manifest is specified with empty 'name' and no 'short_name'`,
        reports: [{ message: `Should have non-empty 'name' property value` }],
        serverConfig: {
            '/': htmlWithManifestSpecified,
            '/site.webmanifest': { content: `{ "name": "     " }` }
        }
    },
    {
        name: `Web app manifest is specified with 'name' and no 'short_name'`,
        serverConfig: {
            '/': htmlWithManifestSpecified,
            '/site.webmanifest': { content: `{ "name": "🐛🐛🐛🐛🐛🐛🐛🐛🐛🐛🐛🐛" }` }
        }
    },
    {
        name: `Web app manifest is specified with long 'name' and 'short_name'`,
        reports: [{ message: `Should have the 'name' property value under 30 characters` }],
        serverConfig: {
            '/': htmlWithManifestSpecified,
            '/site.webmanifest': { content: `{ "name": "1234567890123456789012345678901", "short_name": "test" }` }
        }
    },
    {
        name: `Web app manifest is specified with 'name' and 'short_name'`,
        serverConfig: {
            '/': htmlWithManifestSpecified,
            '/site.webmanifest': { content: `{ "name": "12345678901", "short_name": "🐛🐛🐛🐛🐛🐛🐛🐛🐛🐛🐛🐛" }` }
        }
    },
    {
        name: `Web app manifest is specified with 'name' and empty 'short_name'`,
        reports: [{ message: `Should have non-empty 'short_name' property value` }],
        serverConfig: {
            '/': htmlWithManifestSpecified,
            '/site.webmanifest': { content: `{ "name": "12345678901", "short_name": "  " }` }
        }
    },
    {
        name: `Web app manifest is specified with 'name' and long 'short_name'`,
        reports: [{ message: `Should have the 'short_name' property value under 12 characters` }],
        serverConfig: {
            '/': htmlWithManifestSpecified,
            '/site.webmanifest': { content: `{ "name": "12345678901", "short_name": "1234567890123" }` }
        }
    }
];

ruleRunner.testRule(getRulePath(__filename), tests, { parsers: ['manifest'] });
