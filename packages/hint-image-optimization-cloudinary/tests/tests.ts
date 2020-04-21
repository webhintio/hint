import { readFileSync } from 'fs';

import * as mock from 'mock-require';

import { generateHTMLPage } from '@hint/utils-create-server';
import { getHintPath, HintTest, testHint } from '@hint/utils-tests-helpers';
import { Severity } from '@hint/utils-types';

import { cloudinaryResult } from '../src/cloudinary-types';

const hintPath = getHintPath(__filename);
const svg = readFileSync(`${__dirname}/fixtures/space-nellie.svg`);
const png = readFileSync(`${__dirname}/fixtures/nellie-studying.png`);
const invalid = readFileSync(`${__dirname}/fixtures/invalid-image.js`);

const generateResponse = (content: Buffer, type: string): Object => {
    return {
        content,
        headers: { 'Content-Type': type }
    };
};

const noSavings = {
    bytes: svg.length,
    element: null,
    originalBytes: svg.length,
    originalUrl: '/space-nellie.svg'
};

const savings50 = {
    bytes: Math.floor(png.length / 2),
    element: null,
    originalBytes: png.length,
    originalUrl: '/nellie-studying.png'
};

const savings33 = {
    bytes: Math.floor(png.length * 0.66),
    element: null,
    originalBytes: png.length,
    originalUrl: '/nellie-studying.png'
};

/** Creates a fake `cloudinary` module that will return the `response` on `v2.uploader.upload_stream`. */
const mockCloudinary = (responses?: Partial<cloudinaryResult> | Partial<cloudinaryResult>[]) => {
    const mockedModule = {
        v2: {
            config() { },
            uploader: {
                upload: () => {
                    if (!responses) {
                        return Promise.reject(new Error('Invalid image'));
                    }

                    const response = Array.isArray(responses) ? responses.shift() : responses;

                    return Promise.resolve(response);
                }
            }
        }
    };

    mock('cloudinary', mockedModule);
};

const tests: HintTest[] = [
    {
        before() {
            mockCloudinary(savings50);
        },
        name: 'unoptimized PNG',
        reports: [{
            message: `'http://localhost/nellie-studying.png' could be around 143.62kB (50%) smaller.`,
            severity: Severity.warning
        }],
        serverConfig: {
            '/': generateHTMLPage('', `<img src="nellie-studying.png">`),
            '/nellie-studying.png': generateResponse(png, 'image/png')
        }
    },
    {
        before() {
            mockCloudinary(noSavings);
        },
        name: 'optimized SVG',
        serverConfig: {
            '/': generateHTMLPage('', `<img src="space-nellie.svg">`),
            '/space-nellie.svg': generateResponse(svg, 'image/svg+xml')
        }
    },
    {
        before() {
            mockCloudinary();
        },
        name: 'invalid image',
        serverConfig: {
            '/': generateHTMLPage('<script src="invalid-image.js"></script>'),
            '/invalid-image.js': generateResponse(invalid, 'text/javascript')
        }
    }
];

const testThresholds: HintTest[] = [
    {
        before() {
            mockCloudinary([savings33, savings33]);
        },
        name: 'unoptimized PNGs with threshold',
        reports: [{
            message: `Total size savings optimizing the images on 'http://localhost/' could be of around 195kB.`,
            severity: Severity.warning
        }],
        serverConfig: {
            '/': generateHTMLPage('', `<img src="nellie-studying.png"><img src="nellie-focused.png">`),
            '/nellie-focused.png': generateResponse(png, 'image/png'),
            '/nellie-studying.png': generateResponse(png, 'image/png')
        }
    },
    {
        before() {
            mockCloudinary(savings50);
        },
        name: 'unoptimized PNG with threshold',
        serverConfig: {
            '/': generateHTMLPage('', `<img src="nellie-studying.png">`),
            '/nellie-studying.png': generateResponse(png, 'image/png')
        }
    }
];

const noConfigTest: HintTest[] = [
    {
        before() {
            mockCloudinary(savings50);
        },
        name: 'No cloudinary Config',
        reports: [{
            message: `No valid configuration for Cloudinary found. Hint could not run.`,
            severity: Severity.error
        }],
        serverConfig: {
            '/': generateHTMLPage('', `<img src="nellie-studying.png">`),
            '/nellie-studying.png': generateResponse(png, 'image/png')
        }
    }
];

testHint(hintPath, testThresholds, {
    hintOptions: { apiKey: 'fakeApiName', apiSecret: 'fakeApiSecret', cloudName: 'fakeCloudName', threshold: 150 },
    ignoredConnectors: ['puppeteer'],
    serial: true
});

testHint(hintPath, tests, {
    hintOptions: { apiKey: 'fakeApiName', apiSecret: 'fakeApiSecret', cloudName: 'fakeCloudName' },
    ignoredConnectors: ['puppeteer'],
    serial: true
});

testHint(hintPath, noConfigTest, {
    ignoredConnectors: ['puppeteer'],
    serial: true
});
