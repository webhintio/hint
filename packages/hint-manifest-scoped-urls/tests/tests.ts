import { test } from '@hint/utils';
import { HintTest, testHint } from '@hint/utils-tests-helpers';

const { generateHTMLPage, getHintPath } = test;
const hintPath = getHintPath(__filename);

const htmlWithManifestSpecified = generateHTMLPage('<link rel="manifest" href="site.webmanifest">');

const tests: HintTest[] = [
    {
        name: 'No start_url property specified in Manifest file',
        reports: [{ message: `Property 'start_url' not found in manifest file` }],
        serverConfig: {
            '/': htmlWithManifestSpecified,
            '/site.webmanifest': { content: `{}` }
        }
    },
    {
        name: 'Manifest property start_url not scoped.',
        reports: [
            {
                message: `'start_url' is not in scope of the app.`,
                position: { match: 'start_url": "/",' }
            }
        ],
        serverConfig: {
            '/': htmlWithManifestSpecified,
            '/site.webmanifest': {
                content: `{
                    "short_name": "Test webhint App",
                    "start_url": "/",
                    "scope": "/test"
                }`
            }
        }
    },
    {
        name: 'Manifest property start_url is relative and inaccessible.',
        reports: [
            {
                message: `Specified 'start_url' is not accessible. (status code: 404).`,
                position: { match: 'start_url": "randomcontent",' }
            }
        ],
        serverConfig: {
            '/': htmlWithManifestSpecified,
            '/site.webmanifest': {
                content: `{
                    "short_name": "Test webhint App",
                    "start_url": "randomcontent",
                    "scope": "/"
                }`
            }
        }
    },
    {
        name: 'Manifest property start_url is not same origin',
        reports: [
            {
                message: `'start_url' must have same origin as the manifest file.`,
                position: { match: 'start_url": "https://example.com",' }
            }
        ],
        serverConfig: {
            '/': htmlWithManifestSpecified,
            '/site.webmanifest': {
                content: `{
                    "short_name": "Test webhint App",
                    "start_url": "https://example.com",
                    "scope": "/"
                }`
            }
        }
    },
    {
        name: 'Manifest property start_url is absolute and scoped but inaccessible',
        reports: [
            {
                message: `Specified 'start_url' is not accessible. (status code: 404).`,
                position: { match: 'start_url": "/test",' }
            }
        ],
        serverConfig: {
            '/': htmlWithManifestSpecified,
            '/site.webmanifest': {
                content: `{
                    "short_name": "Test webhint App",
                    "start_url": "/test",
                    "scope": "/test"
                }`
            }
        }
    },
    {
        name: 'Manifest property start_url is relative and accessible.',
        serverConfig: {
            '/index.html': htmlWithManifestSpecified,
            '/site.webmanifest': {
                content: `{
                    "short_name": "Test webhint App",
                    "start_url": "index.html",
                    "scope": "/"
                }`
            }
        }
    },
    {
        name: 'Manifest property start_url is a deep absolute accessible path.',
        serverConfig: {
            '/site.webmanifest': {
                content: `{
                    "short_name": "Test webhint App",
                    "start_url": "/test/path/../../test/path/index.html",
                    "scope": "/test/path"
                }`
            },
            '/test/path/index.html': htmlWithManifestSpecified
        }
    },
    {
        name: 'Manifest property start_url is a deep relative accessible path.',
        serverConfig: {
            '/site.webmanifest': {
                content: `{
                    "short_name": "Test webhint App",
                    "start_url": "test/path/../../test/path/index.html",
                    "scope": "/test/path"
                }`
            },
            '/test/path/index.html': htmlWithManifestSpecified
        }
    },
    {
        name: 'Manifest property name specified and start_url accessible and scoped',
        serverConfig: {
            '/index.html': htmlWithManifestSpecified,
            '/site.webmanifest': {
                content: `{
                    "short_name": "Test webhint App",
                    "start_url": "/index.html",
                    "scope": "/"
                }`
            }
        }
    }
];

testHint(hintPath, tests, { parsers: ['manifest'] });
