/* eslint sort-keys: 0, no-undefined: 0 */

import { generateHTMLPage } from '../../../helpers/misc';
import { getRuleName } from '../../../../src/lib/utils/rule-helpers';
import { IRuleTest } from '../../../helpers/rule-test-type';
import * as ruleRunner from '../../../helpers/rule-runner';

const htmlWithManifestSpecified = generateHTMLPage(`<link rel="manifest" href="site.webmanifest">`);

const tests: Array<IRuleTest> = [
    {
        name: `Manifest is not specified, so the rule does not apply and the test should pass`,
        reports: [{ message: 'Manifest not specified' }],
        serverConfig: generateHTMLPage('<link rel="stylesheet" href="style.css">')
    },
    {
        name: `Manifest is specified multiple times`,
        reports: [{ message: 'Manifest already specified' }],
        serverConfig: {
            '/': generateHTMLPage(`<link rel="manifest" href="site1.webmanifest"><link rel="manifest" href="site2.webmanifest">`),
            '/site1.webmanifest': '',
            '/site2.webmanifest': ''
        }
    },
    {
        name: `Manifest is specified with no 'href'`,
        reports: [{ message: `Manifest specified with invalid 'href'` }],
        serverConfig: generateHTMLPage('<link rel="manifest">')
    },
    {
        name: `Manifest is specified with empty 'href'`,
        reports: [{ message: `Manifest specified with invalid 'href'` }],
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
        name: `Manifest is specified and the file exists`,
        serverConfig: {
            '/': htmlWithManifestSpecified,
            '/site.webmanifest': ''
        }
    },
    {
        name: `Manifest is specified and request for file fails`,
        reports: [{ message: `Manifest file request failed` }],
        serverConfig: {
            '/': htmlWithManifestSpecified,
            '/site.webmanifest': null
        }
    },
    {
        name: `Manifest is specified and request for file fails with status code 404`,
        reports: [{ message: `Manifest file could not be fetched (status code: 404)` }],
        serverConfig: {
            '/': htmlWithManifestSpecified,
            '/site.webmanifest': { status: 404 }
        }
    },
    {
        name: `Manifest is specified and request for file fails with status code 500`,
        reports: [{ message: `Manifest file could not be fetched (status code: 500)` }],
        serverConfig: {
            '/': htmlWithManifestSpecified,
            '/site.webmanifest': { status: 500 }
        }
    }
];

ruleRunner.testRule(getRuleName(__dirname), tests);
