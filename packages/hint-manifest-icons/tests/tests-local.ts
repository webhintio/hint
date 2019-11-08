import * as path from 'path';

import { getHintPath, testLocalHint, HintLocalTest } from '@hint/utils-tests-helpers';
import { Severity } from '@hint/utils-types';

const hintPath = getHintPath(__filename);

const localTests: HintLocalTest[] = [
    {
        name: 'Web app manifest is specified with empty icons property',
        path: path.join(__dirname, 'fixtures', 'empty-icons.webmanifest'),
        reports: [{
            message: `Valid icons property was not found in the web app manifest`,
            position: { match: 'icons' },
            severity: Severity.error
        }]
    },
    {
        name: 'Specified type does not match with real image type',
        path: path.join(__dirname, 'fixtures', 'incorrect-type.webmanifest'),
        reports: [
            {
                message: `Real image type (png) do not match with specified type (jpg)`,
                position: { match: '"image/jpg"' },
                severity: Severity.warning
            }
        ]
    },
    {
        name: 'Missing type in icon',
        path: path.join(__dirname, 'fixtures', 'missing-type.webmanifest'),
        reports: [
            {
                message: `Icon type was not specified.`,
                position: {
                    match: `{
            "src"`
                },
                severity: Severity.error
            }
        ]
    },
    {
        name: 'Required size icons not found',
        path: path.join(__dirname, 'fixtures', 'missing-size.webmanifest'),
        reports: [
            {
                message: `Required sizes ["512x512"] not found.`,
                position: { match: `icons` },
                severity: Severity.error
            }
        ]
    },
    {
        name: 'Ideal icons specified pass even if files do not exist',
        path: path.join(__dirname, 'fixtures', 'icons-ok.webmanifest')
    }
];

testLocalHint(hintPath, localTests, { parsers: ['manifest'] });
