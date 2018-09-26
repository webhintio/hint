/* eslint sort-keys: 0 */

import generateHTMLPage from 'hint/dist/src/lib/utils/misc/generate-html-page';
import { getHintPath } from 'hint/dist/src/lib/utils/hint-helpers';
import { HintTest } from '@hint/utils-tests-helpers/dist/src/hint-test-type';
import * as hintRunner from '@hint/utils-tests-helpers/dist/src/hint-runner';

const htmlWithManifestSpecified = generateHTMLPage(`<link rel="manifest" href="site.webmanifest">`);

// Error messages.

const linkElementIsNotSpecifiedErrorMessage = `'manifest' link element was not specified.`;
const linkElementIsAlreadySpecifiedErrorMessage = `'manifest' link element is not needed as one was already specified.`;
const linkElementHasEmptyHrefAttributeErrorMessage= `'manifest' link element should have non-empty 'href' attribute.`;

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const tests: Array<HintTest> = [
    {
        name: `Manifest is not specified`,
        reports: [{ message: linkElementIsNotSpecifiedErrorMessage }],
        serverConfig: generateHTMLPage('<link rel="stylesheet" href="style.css">')
    },
    {
        name: `Manifest is specified multiple times`,
        reports: [{ message: linkElementIsAlreadySpecifiedErrorMessage }],
        serverConfig: {
            '/': generateHTMLPage(`<link rel="manifest" href="site1.webmanifest"><link rel="manifest" href="site2.webmanifest">`),
            '/site1.webmanifest': '',
            '/site2.webmanifest': ''
        }
    },
    {
        name: `Manifest is specified with no 'href'`,
        reports: [{ message: linkElementHasEmptyHrefAttributeErrorMessage }],
        serverConfig: generateHTMLPage('<link rel="manifest">')
    },
    {
        name: `Manifest is specified with empty 'href'`,
        reports: [{ message: linkElementHasEmptyHrefAttributeErrorMessage }],
        serverConfig: generateHTMLPage('<link rel="manifest" href="">')
    },
    {
        name: `Manifest is specified as a full URL`,
        serverConfig: {
            '/': generateHTMLPage('<link rel="manifest" href="http://localhost/site.webmanifest">'),
            '/site.webmanifest': ''
        }
    },
    {
        name: `Manifest is specified as only the file extension`,
        serverConfig: {
            '/': generateHTMLPage('<link rel="manifest" href="http://localhost/.webmanifest">'),
            '/.webmanifest': ''
        }
    },
    {
        name: `Manifest is specified and the file exists`,
        serverConfig: {
            '/': htmlWithManifestSpecified,
            '/site.webmanifest': ''
        }
    },
    {
        name: `Manifest is specified and request for file fails`,
        reports: [{ message: `'site.webmanifest' could not be fetched (request failed).` }],
        serverConfig: {
            '/': htmlWithManifestSpecified,
            '/site.webmanifest': null
        }
    },
    {
        name: `Manifest is specified and request for file fails with status code 404`,
        reports: [{ message: `'site.webmanifest' could not be fetched (status code: 404).` }],
        serverConfig: {
            '/': htmlWithManifestSpecified,
            '/site.webmanifest': { status: 404 }
        }
    },
    {
        name: `Manifest is specified and request for file fails with status code 500`,
        reports: [{ message: `'site.webmanifest' could not be fetched (status code: 500).` }],
        serverConfig: {
            '/': htmlWithManifestSpecified,
            '/site.webmanifest': { status: 500 }
        }
    }
];

hintRunner.testHint(getHintPath(__filename), tests, { parsers: ['manifest'] });
