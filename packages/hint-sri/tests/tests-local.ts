import * as path from 'path';

import { test } from '@hint/utils';
import { HintLocalTest, testLocalHint } from '@hint/utils-tests-helpers';

const { getHintPath } = test;
const hintPath = getHintPath(__filename);

const tests: HintLocalTest[] = [
    {
        name: 'Integrity ok and using relative resources should pass',
        path: path.join(__dirname, 'fixtures', 'local-pass')
    },
    {
        name: 'If the intregity is not valid it should fail',
        path: path.join(__dirname, 'fixtures', 'local-no-pass'),
        reports: [{
            message: `The hash in the "integrity" attribute in resource https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/core.js doesn't match the received payload.
Expected: sha256-YCbKJH6u4siPpUlk130udu/JepdKVpXjdEyzje+z1pE=
Actual:   sha256-YCbKJH6PpUlk130udu/JepdKVpXjdEyzje+z1pE=`
        }]
    }
];

const testsIgnoredUrls = [{
    name: 'If the URL with no valid sri is ignored, it should pass',
    path: path.join(__dirname, 'fixtures', 'local-no-pass')
}];

testLocalHint(hintPath, tests, {
    hintOptions: { baseline: 'sha256' },
    parsers: ['html']
});

testLocalHint(hintPath, testsIgnoredUrls, {
    ignoredUrls: [{
        domain: '^https://cdnjs.cloudflare.com/ajax/libs/jquery/3\\.3\\.1/core\\.js',
        hints: [
            'sri'
        ]
    }],
    parsers: ['html']
});
