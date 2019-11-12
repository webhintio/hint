import { Severity } from '@hint/utils-types';
import { generateHTMLPage } from '@hint/utils-create-server';
import { getHintPath, HintTest, testHint } from '@hint/utils-tests-helpers';

const htmlWithManifestSpecified = generateHTMLPage('<link rel="manifest" href="site.webmanifest">');

const tests: HintTest[] = [
    {
        name: `Web app manifest is specified without 'name' and 'short_name'`,
        reports: [{
            message: `Web app manifest should have 'name' property.`,
            severity: Severity.error
        }],
        serverConfig: {
            '/': htmlWithManifestSpecified,
            '/site.webmanifest': { content: '{}' }
        }
    },
    {
        name: `Web app manifest is specified with empty 'name' and no 'short_name'`,
        reports: [{
            message: `Web app manifest should have non-empty 'name' property value.`,
            severity: Severity.error
        }],
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
        reports: [{
            message: `Web app manifest should have 'name' property value under 30 characters.`,
            severity: Severity.warning
        }],
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
        reports: [{
            message: `Web app manifest should have non-empty 'short_name' property value.`,
            severity: Severity.error
        }],
        serverConfig: {
            '/': htmlWithManifestSpecified,
            '/site.webmanifest': { content: `{ "name": "12345678901", "short_name": "  " }` }
        }
    },
    {
        name: `Web app manifest is specified with 'name' and long 'short_name'`,
        reports: [{
            message: `Web app manifest should have 'short_name' property value under 12 characters.`,
            severity: Severity.warning
        }],
        serverConfig: {
            '/': htmlWithManifestSpecified,
            '/site.webmanifest': { content: `{ "name": "12345678901", "short_name": "1234567890123" }` }
        }
    }
];

testHint(getHintPath(__filename), tests, { parsers: ['manifest'] });
