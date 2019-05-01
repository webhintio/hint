import { test } from '@hint/utils';
import { HintTest, testHint } from '@hint/utils-tests-helpers';

const { generateHTMLPage, getHintPath } = test;
const hintPath = getHintPath(__filename);

/*
 * You should test for cases where the hint passes and doesn't.
 * More information about how `hintRunner` can be configured is
 * available in:
 * https://webhint.io/docs/contributor-guide/how-to/test-hints/
 */

const htmlWithManifestSpecified = generateHTMLPage('<link rel="manifest" href="site.webmanifest">');

const tests: HintTest[] = [
    {
        name: 'No name or short_name property specified in Manifest file',
        reports: [{ message: `Property name not found in Manifest file` }],
        serverConfig: {
            '/': htmlWithManifestSpecified,
            '/site.webmanifest': {
                content: `{
                    "start_url": "/"
                }`
            }
        }
    },
    {
        name: 'No start_url property specified in Manifest file',
        reports: [{ message: `Property start_url not found in Manifest file` }],
        serverConfig: {
            '/': htmlWithManifestSpecified,
            '/site.webmanifest': {
                content: `{
                    "short_name": "Test webhint App"
                }`
            }
        }
    },
    {
        name: 'Manifest property start_url not scoped.',
        reports: [
            {
                message: `start_url is not in scope of the app.`,
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
        name: 'Manifest property start_url scoped but inaccessible',
        reports: [
            {
                message: `Specified start_url not accessible. (status code: 404).`,
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
