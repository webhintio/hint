import { readFileSync } from 'fs';

import * as mock from 'mock-require';

import { generateHTMLPage } from '../../../helpers/misc';
import { getRuleName } from '../../../../src/lib/utils/rule-helpers';
import { IRuleTest } from '../../../helpers/rule-test-type';
import * as ruleRunner from '../../../helpers/rule-runner';

const ruleName = getRuleName(__dirname);
const svg = readFileSync(`${__dirname}/fixtures/space-nellie.svg`);
const png = readFileSync(`${__dirname}/fixtures/nellie-studying.png`);

const generateImageData = (content: Buffer, type): Object => {
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
const mockCloudinary = (responses) => {
    const mockedModule = {
        v2: {
            config() { },
            uploader: {
                upload_stream: (options, cb) => { // eslint-disable-line camelcase
                    let response = responses;

                    if (Array.isArray(response)) {
                        response = responses.shift();
                    }

                    setImmediate(() => {
                        return cb(null, response);
                    });

                    return { end() { } };
                }
            }
        }
    };

    mock('cloudinary', mockedModule);
};

const tests: Array<IRuleTest> = [
    {
        before() {
            mockCloudinary(savings50);
        },
        name: 'unoptimized PNG',
        reports: [{ message: `File http://localhost/nellie-studying.png could be around 143.62kB (50%) smaller.` }],
        serverConfig: {
            '/': generateHTMLPage('', `<img src="nellie-studying.png">`),
            '/nellie-studying.png': generateImageData(png, 'image/png')
        }
    },
    {
        before() {
            mockCloudinary(noSavings);
        },
        name: 'optimized SVG',
        serverConfig: {
            '/': generateHTMLPage('', `<img src="space-nellie.svg">`),
            '/space-nellie.svg': generateImageData(svg, 'image/svg+xml')
        }
    }
];

const testThresholds: Array<IRuleTest> = [
    {
        before() {
            mockCloudinary([savings33, savings33]);
        },
        name: 'unoptimized PNGs with threshold',
        reports: [{ message: `The total size savings optimizing the images in http://localhost/ could be of around 195kB.` }],
        serverConfig: {
            '/': generateHTMLPage('', `<img src="nellie-studying.png"><img src="nellie-focused.png">`),
            '/nellie-focused.png': generateImageData(png, 'image/png'),
            '/nellie-studying.png': generateImageData(png, 'image/png')
        }
    },
    {
        before() {
            mockCloudinary(savings50);
        },
        name: 'unoptimized PNG with threshold',
        serverConfig: {
            '/': generateHTMLPage('', `<img src="nellie-studying.png">`),
            '/nellie-studying.png': generateImageData(png, 'image/png')
        }
    }
];

ruleRunner.testRule(ruleName, testThresholds, {
    ignoredConnectors: ['chrome'],
    ruleOptions: { apiKey: 'fakeApiName', apiSecret: 'fakeApiSecret', cloudName: 'fakeCloudName', threshold: 150 },
    serial: true
});

ruleRunner.testRule(ruleName, tests, {
    ignoredConnectors: ['chrome'],
    ruleOptions: { apiKey: 'fakeApiName', apiSecret: 'fakeApiSecret', cloudName: 'fakeCloudName' },
    serial: true
});
