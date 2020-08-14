import { readFileSync } from 'fs';

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
    return {
        cloudinary: {
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
        }
    };
};

const tests: HintTest[] = [
    {
        name: 'unoptimized PNG',
        overrides: mockCloudinary(savings50),
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
        name: 'optimized SVG',
        overrides: mockCloudinary(noSavings),
        serverConfig: {
            '/': generateHTMLPage('', `<img src="space-nellie.svg">`),
            '/space-nellie.svg': generateResponse(svg, 'image/svg+xml')
        }
    },
    {
        name: 'invalid image',
        overrides: mockCloudinary(),
        serverConfig: {
            '/': generateHTMLPage('<script src="invalid-image.js"></script>'),
            '/invalid-image.js': generateResponse(invalid, 'text/javascript')
        }
    }
];

const testThresholds: HintTest[] = [
    {
        name: 'unoptimized PNGs with threshold',
        overrides: mockCloudinary([savings33, savings33]),
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
        name: 'unoptimized PNG with threshold',
        overrides: mockCloudinary(savings50),
        serverConfig: {
            '/': generateHTMLPage('', `<img src="nellie-studying.png">`),
            '/nellie-studying.png': generateResponse(png, 'image/png')
        }
    }
];

const noConfigTest: HintTest[] = [
    {
        name: 'No cloudinary Config',
        overrides: mockCloudinary(savings50),
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
