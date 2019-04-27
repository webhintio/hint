import * as fs from 'fs';

import { test } from '@hint/utils';
import { HintTest, testHint } from '@hint/utils-tests-helpers';

const { generateHTMLPage, getHintPath } = test;
const hintPath = getHintPath(__filename);

const htmlWithManifestSpecified = generateHTMLPage('<link rel="manifest" href="site.webmanifest">');

const icon192px = fs.readFileSync(`${__dirname}/fixtures/icon-192x192.png`); // eslint-disable-line no-sync
const icon512px = fs.readFileSync(`${__dirname}/fixtures/icon-512x512.png`); // eslint-disable-line no-sync
const icon128px = fs.readFileSync(`${__dirname}/fixtures/icon-128x128.png`); // eslint-disable-line no-sync

const generateImageData = (content: Buffer): Object => {
    return {
        content,
        headers: { 'Content-Type': 'image/png' }
    };
};

const tests: HintTest[] = [
    {
        name: 'Web app manifest is specified with empty icons property',
        reports: [{ message: `Valid icons property was not found.` }],
        serverConfig: {
            '/': htmlWithManifestSpecified,
            '/site.webmanifest': {
                content: `{
                    "icons": []
                }`
            }
        }
    },
    {
        name: 'Inaccessible icon URL in the Web app manifest',
        reports: [{ message: `Icon could not be fetched (status code: 404).` }],
        serverConfig: {
            '/': htmlWithManifestSpecified,
            '/fixtures/icon-192x192.png': generateImageData(icon192px),
            '/fixtures/icon-512x512.png': generateImageData(icon512px),
            '/site.webmanifest': {
                content: `{
                    "icons": [
                        {
                            "src": "an-inaccessible-path.png",
                            "sizes": "152x152",
                            "type": "image/png"
                        },
                        {
                            "src": "fixtures/icon-192x192.png",
                            "sizes": "192x192",
                            "type": "image/png"
                        },
                        {
                            "src": "fixtures/icon-512x512.png",
                            "sizes": "512x512",
                            "type": "image/png"
                        }
                    ]
                }`
            }
        }
    },
    {
        name: 'Specified type does not match with real image type',
        reports: [{ message: `Real image type (png) do not match with specified type (madeuptype)` }],
        serverConfig: {
            '/': htmlWithManifestSpecified,
            '/fixtures/icon-128x128.png': generateImageData(icon128px),
            '/fixtures/icon-192x192.png': generateImageData(icon192px),
            '/fixtures/icon-512x512.png': generateImageData(icon512px),
            '/site.webmanifest': {
                content: `{
                    "icons": [
                        {
                            "src": "fixtures/icon-128x128.png",
                            "sizes": "128x128",
                            "type": "image/madeuptype"
                        },
                        {
                            "src": "fixtures/icon-192x192.png",
                            "sizes": "192x192",
                            "type": "image/png"
                        },
                        {
                            "src": "fixtures/icon-512x512.png",
                            "sizes": "512x512",
                            "type": "image/png"
                        }
                        ]
                }`
            }
        }
    },
    {
        name: 'Specified size does not match with real image size',
        reports: [{ message: `Real image size (["128","128"]) do not match with specified size (128,120)` }],
        serverConfig: {
            '/': htmlWithManifestSpecified,
            '/fixtures/icon-128x128.png': generateImageData(icon128px),
            '/fixtures/icon-192x192.png': generateImageData(icon192px),
            '/fixtures/icon-512x512.png': generateImageData(icon512px),
            '/site.webmanifest': {
                content: `{
                    "icons": [
                        {
                            "src": "fixtures/icon-128x128.png",
                            "sizes": "128x120",
                            "type": "image/png"
                        },
                        {
                            "src": "fixtures/icon-192x192.png",
                            "sizes": "192x192",
                            "type": "image/png"
                        },
                        {
                            "src": "fixtures/icon-512x512.png",
                            "sizes": "512x512",
                            "type": "image/png"
                        }
                        ]
                }`
            }
        }
    },
    {
        name: 'Required size icons not found',
        reports: [{ message: `Required sizes ["512x512"] not found.` }],
        serverConfig: {
            '/': htmlWithManifestSpecified,
            '/fixtures/icon-192x192.png': generateImageData(icon192px),
            '/site.webmanifest': {
                content: `{
                    "icons": [
                        {
                            "src": "fixtures/icon-192x192.png",
                            "sizes": "192x192",
                            "type": "image/png"
                        }
                        ]
                }`
            }
        }
    },
    {
        name: 'Ideal icons specified',
        serverConfig: {
            '/': htmlWithManifestSpecified,
            '/fixtures/icon-192x192.png': generateImageData(icon192px),
            '/fixtures/icon-512x512.png': generateImageData(icon512px),
            '/site.webmanifest': {
                content: `{
                    "icons": [
                        {
                            "src": "fixtures/icon-192x192.png",
                            "sizes": "192x192",
                            "type": "image/png"
                        },
                        {
                            "src": "fixtures/icon-512x512.png",
                            "sizes": "512x512",
                            "type": "image/png"
                        }
                        ]
                }`
            }
        }
    }
];

testHint(hintPath, tests, { parsers: ['manifest'] });
