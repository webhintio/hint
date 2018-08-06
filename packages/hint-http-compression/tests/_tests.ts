import * as fs from 'fs';

import * as mock from 'mock-require';

import { HintTest } from '@hint/utils-tests-helpers/dist/src/hint-test-type';

// We need to use `require` to be able to overwrite the method `asyncTry`.
const fnWrapper = require('hint/dist/src/lib/utils/async-wrapper');
const originalAsyncTry = fnWrapper.asyncTry;

const uaString = 'Mozilla/5.0 Gecko';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

// Error messages.

const generateCompressionMessage = (encoding?: string, notRequired?: boolean, suffix?: string) => {
    return `Response should${notRequired ? ' not' : ''} be compressed${encoding ? ` with ${encoding}` : ''}${notRequired ? '' : ` when ${['Zopfli', 'gzip'].includes(encoding) ? 'gzip' : encoding} compression is requested`}${suffix ? `${!suffix.startsWith(',') ? ' ' : ''}${suffix}` : ''}.`;
};

const generateContentEncodingMessage = (encoding?: string, notRequired?: boolean, suffix?: string) => {
    return `Response should${notRequired ? ' not' : ''} include 'content-encoding${encoding ? `: ${encoding}` : ''}' header${suffix ? ` ${suffix}` : ''}.`;
};

const generateDisallowedCompressionMessage = (encoding: string) => {
    return `Response should not be compressed with disallowed '${encoding}' compression method.`;
};

const generateSizeMessage = (encoding: string, differentSize: boolean) => {
    return `Response should not be served compressed with ${encoding} as the compressed size is ${differentSize ? 'bigger than' : 'the same size as'} the uncompressed one.`;
};

const generateUnneededContentEncodingMessage = (encoding?: string) => {
    return `Response should not include 'content-encoding' header${encoding ? ` for requests made with 'accept-encoding: ${encoding}'` : ''}.`;
};

const varyMessage = `Response should include 'vary' header containing 'accept-encoding' value.`;

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

// Files.

/* eslint-disable no-sync */
const faviconFile = {
    brotli: fs.readFileSync(`${__dirname}/fixtures/favicon.br`),
    gzip: fs.readFileSync(`${__dirname}/fixtures/favicon.gz`),
    original: fs.readFileSync(`${__dirname}/fixtures/favicon.ico`),
    zopfli: fs.readFileSync(`${__dirname}/fixtures/favicon.zopfli.gz`)
};

const htmlFile = {
    brotli: fs.readFileSync(`${__dirname}/fixtures/page.br`),
    gzip: fs.readFileSync(`${__dirname}/fixtures/page.gz`),
    original: fs.readFileSync(`${__dirname}/fixtures/page.html`),
    zopfli: fs.readFileSync(`${__dirname}/fixtures/page.zopfli.gz`)
};

const imageFile = {
    brotli: fs.readFileSync(`${__dirname}/fixtures/image.br`),
    gzip: fs.readFileSync(`${__dirname}/fixtures/image.gz`),
    original: fs.readFileSync(`${__dirname}/fixtures/image.png`),
    zopfli: fs.readFileSync(`${__dirname}/fixtures/image.zopfli.gz`)
};

const scriptFile = {
    brotli: fs.readFileSync(`${__dirname}/fixtures/script.br`),
    gzip: fs.readFileSync(`${__dirname}/fixtures/script.gz`),
    original: fs.readFileSync(`${__dirname}/fixtures/script.js`),
    zopfli: fs.readFileSync(`${__dirname}/fixtures/script.zopfli.gz`)
};

const scriptSmallFile = {
    brotli: fs.readFileSync(`${__dirname}/fixtures/script-small.br`),
    gzip: fs.readFileSync(`${__dirname}/fixtures/script-small.gz`),
    original: fs.readFileSync(`${__dirname}/fixtures/script-small.js`),
    zopfli: fs.readFileSync(`${__dirname}/fixtures/script-small.zopfli.gz`)
};

const svgzFile = fs.readFileSync(`${__dirname}/fixtures/image.svgz`);
/* eslint-enable no-sync */

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

// Server configs.

const createConfig = ({
    faviconFileContent = faviconFile.zopfli,
    faviconFileHeaders = {
        'Content-Encoding': 'gzip',
        Vary: 'Accept-Encoding'
    },
    htmlFileContent = htmlFile.zopfli,
    htmlFileHeaders = {
        'Content-Encoding': 'gzip',
        Vary: 'Accept-Encoding'
    },
    imageFileContent = imageFile.original,
    imageFileHeaders = {},
    request = { headers: { 'Accept-Encoding': 'gzip, deflate, br' } },
    scriptFileContent = scriptFile.zopfli,
    scriptFileHeaders = {
        'Content-Encoding': 'gzip',
        Vary: 'Accept-Encoding'
    },
    svgzFileContent = svgzFile,
    svgzFileHeaders = { 'Content-Encoding': 'gzip' }
} = {}) => {
    return {
        [JSON.stringify({ request })]: {
            '/': {
                content: htmlFileContent,
                headers: Object.assign({ 'Content-Type': 'text/html; charset=utf-8' }, htmlFileHeaders)
            },
            '/favicon.ico': {
                content: faviconFileContent,
                headers: Object.assign({ 'Content-Type': 'image/x-icon' }, faviconFileHeaders)
            },
            '/image.png': {
                content: imageFileContent,
                headers: Object.assign({ 'Content-Type': 'image/png' }, imageFileHeaders)
            },
            '/image.svgz': {
                content: svgzFileContent,
                headers: Object.assign({ 'Content-Type': 'image/svg+xml' }, svgzFileHeaders)
            },
            '/script.js': {
                content: scriptFileContent,
                headers: Object.assign({ 'Content-Type': 'text/javascript; charset=utf-8' }, scriptFileHeaders)
            }
        }
    };
};

const brotliConfigs = {
    faviconFileContent: faviconFile.brotli,
    faviconFileHeaders: {
        'Content-Encoding': 'br',
        Vary: 'Accept-Encoding'
    },
    htmlFileContent: htmlFile.brotli,
    htmlFileHeaders: {
        'Content-Encoding': 'br',
        Vary: 'Accept-Encoding'
    },
    request: { headers: { 'Accept-Encoding': 'br' } },
    scriptFileContent: scriptFile.brotli,
    scriptFileHeaders: {
        'Content-Encoding': 'br',
        Vary: 'Accept-Encoding'
    }
};

const noCompressionConfigs = {
    faviconFileContent: faviconFile.original,
    faviconFileHeaders: {
        'Content-Encoding': null,
        Vary: null
    },
    htmlFileContent: htmlFile.original,
    htmlFileHeaders: {
        'Content-Encoding': null,
        Vary: null
    },
    request: { headers: { 'Accept-Encoding': 'identity' } },
    scriptFileContent: scriptFile.original,
    scriptFileHeaders: {
        'Content-Encoding': null,
        Vary: null
    }
};

const createGzipZopfliConfigs = (configs = {}) => {
    return Object.assign(
        // Accept-Encoding: gzip
        createConfig(Object.assign({ request: { headers: { 'Accept-Encoding': 'gzip' } } }, configs)),

        // Accept-Encoding: gzip, deflate (jsdom)
        createConfig(Object.assign({ request: { headers: { 'Accept-Encoding': 'gzip, deflate' } } }, configs)),

        // Accept-Encoding: gzip, deflate, br (chrome)
        createConfig(configs)
    );
};

const createServerConfig = (configs = {}, https: boolean = false) => {
    return Object.assign(

        // Accept-Encoding: identity
        createConfig(noCompressionConfigs),

        /*
         * Accept-Encoding: gzip
         * Accept-Encoding: gzip, deflate (jsdom)
         * Accept-Encoding: gzip, deflate, br (chrome)
         */
        createGzipZopfliConfigs(configs),

        // Accept-Encoding: br
        createConfig(Object.assign(
            { request: { headers: { 'Accept-Encoding': 'br' } } },
            https ? Object.assign({}, brotliConfigs, configs) : configs
        ))
    );
};

const createGzipZopfliServerConfig = (configs, https: boolean = false) => {
    return Object.assign(
        createServerConfig({}, https),
        createGzipZopfliConfigs(configs)
    );
};

const createBrotliServerConfig = (configs) => {
    return createGzipZopfliServerConfig(
        Object.assign(
            {},
            brotliConfigs,
            configs
        ),
        true
    );
};

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const testsForBrotli: Array<HintTest> = [
    {
        name: `Resource is not served compressed with Brotli when Brotli compression is requested`,
        reports: [{ message: generateCompressionMessage('Brotli', false, 'over HTTPS') }],
        serverConfig: createBrotliServerConfig({
            scriptFileContent: scriptFile.original,
            scriptFileHeaders: { 'Content-Encoding': null }
        })
    },
    {
        name: `Resource is served compressed with Brotli and without the 'Content-Encoding' header when Brotli compression is requested`,
        reports: [{ message: generateContentEncodingMessage('br') }],
        serverConfig: createBrotliServerConfig({
            scriptFileContent: scriptFile.brotli,
            scriptFileHeaders: {
                'Content-Encoding': null,
                vary: 'Accept-Encoding'
            }
        })
    },
    {
        after() {
            fnWrapper.asyncTry = originalAsyncTry;
        },
        before() {
            fnWrapper.asyncTry = (fetch) => {
                return (target, headers) => {
                    if (!target || !target.includes('script.js') || headers['Accept-Encoding'] !== 'br') {
                        return fetch(target, headers);
                    }

                    return null;
                };
            };

            mock('hint/dist/src/lib/utils/async-wrapper', fnWrapper);
        },
        name: `If a request throws an exception, if should be managed and report an error`,
        reports: [{ message: `Could not be fetched when requested compressed with Brotli` }],
        serverConfig: createBrotliServerConfig({
            scriptFileContent: scriptFile.brotli,
            scriptFileHeaders: brotliConfigs.scriptFileHeaders
        })
    }
];

const testsForBrotliOverHTTP: Array<HintTest> = [
    {
        name: `Resource is served compressed with Brotli over HTTP`,
        reports: [{ message: 'Response should not be compressed with Brotli over HTTP.' }],
        serverConfig: createGzipZopfliServerConfig(
            Object.assign(
                { request: { headers: { 'Accept-Encoding': 'br' } } },
                {
                    scriptFileContent: scriptFile.brotli,
                    scriptFileHeaders: {
                        'Content-Encoding': 'br',
                        vary: 'accept-encoding'
                    }
                }
            )
        )
    }
];

const testsForBrotliSmallSize: Array<HintTest> = [
    {
        name: `Resource is served compressed with Brotli when Brotli compression is requested but uncompressed size is smaller the compressed size`,
        reports: [{ message: generateSizeMessage('Brotli', true) }],
        serverConfig: createBrotliServerConfig({ scriptFileContent: scriptSmallFile.brotli })
    }
];

const testsForBrotliUASniffing = (): Array<HintTest> => {
    const headersConfig = {
        request: {
            headers: {
                'Accept-Encoding': 'br',
                'User-Agent': uaString
            }
        }
    };

    return [
        {
            name: `Resource is not served compressed with Brotli when Brotli compression is requested with uncommon user agent string`,
            reports: [{ message: generateCompressionMessage('Brotli', false, `over HTTPS, regardless of the user agent`) }],
            serverConfig: createBrotliServerConfig(
                Object.assign(
                    headersConfig,
                    {
                        scriptFileContent: scriptFile.original,
                        scriptFileHeaders: { 'Content-Encoding': null }
                    }
                )
            )
        }
    ];
};

const testsForDefaults = (https: boolean = false): Array<HintTest> => {
    return [
        {
            name: `Only resources that should be served compressed are served compressed`,
            serverConfig: createServerConfig({}, https)
        },

        // Compression is applied to resources that should not be compressed..

        {
            name: `Resource that should not be served compressed is served compressed.`,
            reports: [{ message: generateCompressionMessage('', true) }],
            serverConfig: createGzipZopfliServerConfig(
                { imageFileContent: imageFile.gzip },
                https
            )
        },
        /*
         * TODO: This breaks connectors.
         *
         * {
         *     name: `Resource that should not be served compressed is served with the 'Content-Encoding' header`,
         *     reports: [{ message: generateCompressionMessage('', true) }],
         *     serverConfig: createGzipZopfliServerConfig(
         *         { imageFileHeaders: { 'content-encoding': 'gzip' },
         *         https
         *     )
         * },
         */
        {
            name: `Resource that should not be served compressed is served compressed and with the 'Content-Encoding' header`,
            reports: [
                { message: generateCompressionMessage('', true) },
                { message: generateContentEncodingMessage('', true) }
            ],
            serverConfig: createGzipZopfliServerConfig(
                {
                    imageFileContent: imageFile.gzip,
                    imageFileHeaders: { 'Content-Encoding': 'gzip' }
                },
                https
            )
        }
    ];
};

const testsForDisallowedCompressionMethods = (https: boolean = false): Array<HintTest> => {
    return [
        {
            name: `Compressed resource is served with disallowed 'Content-Encoding: x-gzip' header`,
            reports: [{ message: generateContentEncodingMessage('gzip') }],
            serverConfig: createGzipZopfliServerConfig(
                {
                    scriptFileHeaders: {
                        'Content-Encoding': 'x-gzip',
                        vary: 'Accept-Encoding'
                    }
                },
                https
            )
        },
        {
            name: `Compressed resource is served with disallowed 'Content-Encoding: x-compress' header`,
            reports: [
                { message: generateDisallowedCompressionMessage('x-compress') },
                { message: generateCompressionMessage('gzip') }
            ],
            serverConfig: createGzipZopfliServerConfig(
                {
                    scriptFileContent: scriptFile.original,
                    scriptFileHeaders: {
                        'Content-Encoding': 'x-compress',
                        vary: 'Accept-Encoding'
                    }
                },
                https
            )
        },
        {
            name: `Compressed resource is served with 'Get-Dictionary' header`,
            reports: [{ message: generateDisallowedCompressionMessage('sdch') }],
            serverConfig: createGzipZopfliServerConfig(
                {
                    scriptFileHeaders: {
                        'Content-Encoding': 'gzip',
                        'geT-dictionary': '/dictionaries/search_dict, /dictionaries/help_dict',
                        vary: 'Accept-Encoding'
                    }
                },
                https
            )
        }
    ];
};

const testsForGzipZopfli = (https: boolean = false): Array<HintTest> => {
    return [
        {
            name: `Resource is not served compressed with gzip when gzip compression is requested`,
            reports: [{ message: generateCompressionMessage('gzip') }],
            serverConfig: createGzipZopfliServerConfig(
                {
                    request: { headers: { 'Accept-Encoding': 'gzip' } },
                    scriptFileContent: scriptFile.original,
                    scriptFileHeaders: { 'Content-Encoding': null }
                },
                https
            )
        },
        {
            name: `Resource is served compressed with gzip and without the 'Content-Encoding' header when gzip compression is requested`,
            reports: [
                { message: generateCompressionMessage('Zopfli') },
                { message: generateContentEncodingMessage('gzip') }
            ],
            serverConfig: createGzipZopfliServerConfig(
                {
                    request: { headers: { 'Accept-Encoding': 'gzip' } },
                    scriptFileContent: scriptFile.gzip,
                    scriptFileHeaders: {
                        'Content-Encoding': null,
                        vary: 'Accept-Encoding'
                    }
                },
                https
            )
        },
        {
            name: `Resource is not served compressed with Zopfli when gzip compression is requested`,
            reports: [{ message: generateCompressionMessage('Zopfli') }],
            serverConfig: createGzipZopfliServerConfig(
                {
                    request: { headers: { 'Accept-Encoding': 'gzip' } },
                    scriptFileContent: scriptFile.gzip,
                    scriptFileHeaders: {
                        'Content-Encoding': 'gzip',
                        vary: 'Accept-Encoding'
                    }
                },
                https
            )
        },
        {
            name: `Resource is served compressed with Zopfli and without the 'Content-Encoding' header when gzip compression is requested`,
            reports: [{ message: generateContentEncodingMessage('gzip') }],
            serverConfig: createGzipZopfliServerConfig(
                {
                    request: { headers: { 'Accept-Encoding': 'gzip' } },
                    scriptFileContent: scriptFile.zopfli,
                    scriptFileHeaders: {
                        'Content-Encoding': null,
                        vary: 'Accept-Encoding'
                    }
                },
                https
            )
        },
        {
            after() {
                fnWrapper.asyncTry = originalAsyncTry;
            },
            before() {
                fnWrapper.asyncTry = (fetch) => {
                    return (target, headers) => {
                        if (!target || !target.includes('script.js') || headers['Accept-Encoding'] !== 'gzip') {
                            return fetch(target, headers);
                        }

                        return null;
                    };
                };

                mock('hint/dist/src/lib/utils/async-wrapper', fnWrapper);
            },
            name: `If a request throws an exception, if should be managed and report an error`,
            reports: [{ message: 'Could not be fetched when requested compressed with gzip' }],
            serverConfig: createGzipZopfliServerConfig(
                {
                    request: { headers: { 'Accept-Encoding': 'gzip' } },
                    scriptFileContent: scriptFile.zopfli
                },
                https
            )
        }
    ];
};

const testsForGzipZopfliCaching = (https: boolean = false): Array<HintTest> => {
    return [
        {
            name: `Resource is served compressed with Zopfli and without the 'Vary' or 'Cache-Control' header when gzip compression is requested`,
            reports: [{ message: varyMessage }],
            serverConfig: createGzipZopfliServerConfig(
                {
                    request: { headers: { 'Accept-Encoding': 'gzip' } },
                    scriptFileHeaders: {
                        'Cache-control': null,
                        'Content-Encoding': 'gzip',
                        vary: null
                    }
                },
                https
            )
        },
        {
            name: `Resource is served compressed with Zopfli and with 'Cache-Control: private, max-age=0' header when gzip compression is requested`,
            serverConfig: createGzipZopfliServerConfig(
                {
                    request: { headers: { 'Accept-Encoding': 'gzip' } },
                    scriptFileHeaders: {
                        'Cache-Control': 'private, max-age=0',
                        'Content-Encoding': 'gzip',
                        vary: null
                    }
                },
                https
            )
        },
        {
            name: `Resource is served compressed with Zopfli and with 'Vary: user-agent' header when gzip compression is requested`,
            reports: [{ message: varyMessage }],
            serverConfig: createGzipZopfliServerConfig(
                {
                    request: { headers: { 'Accept-Encoding': 'gzip' } },
                    scriptFileHeaders: {
                        'Cache-Control': null,
                        'Content-Encoding': 'gzip',
                        vary: 'user-agent'
                    }
                },
                https
            )
        },
        {
            name: `Resource is served compressed with Zopfli and with 'Vary: user-agent, Accept-encoding' header when gzip compression is requested`,
            reports: [{ message: varyMessage }],
            serverConfig: createGzipZopfliServerConfig(
                {
                    request: { headers: { 'Accept-Encoding': 'gzip' } },
                    scriptFileHeaders: {
                        'Content-Encoding': 'gzip',
                        vary: 'user-agent, Accept-encoding'
                    }
                },
                https
            )
        }
    ];
};

const testsForGzipZopfliSmallSize = (https: boolean = false): Array<HintTest> => {
    return [
        {
            name: `Resource is served compressed with gzip when gzip compression is requested but uncompressed size is smaller the compressed size`,
            reports: [{ message: generateSizeMessage('gzip', true) }],
            serverConfig: createGzipZopfliServerConfig(
                {
                    request: { headers: { 'Accept-Encoding': 'gzip' } },
                    scriptFileContent: scriptSmallFile.gzip
                },
                https
            )
        },
        {
            name: `Resource is served compressed with Zopfli when gzip compression is requested but uncompressed size is smaller the compressed size`,
            reports: [{ message: generateSizeMessage('Zopfli', true) }],
            serverConfig: createGzipZopfliServerConfig(
                {
                    request: { headers: { 'Accept-Encoding': 'gzip' } },
                    scriptFileContent: scriptSmallFile.zopfli
                },
                https
            )
        }
    ];
};

const testsForGzipZopfliUASniffing = (https: boolean = false): Array<HintTest> => {
    const headersConfig = {
        request: {
            headers: {
                'Accept-Encoding': 'gzip',
                'User-Agent': uaString
            }
        }
    };

    return [
        {
            name: `Resource is not served compressed with gzip when gzip compression is requested with uncommon user agent string`,
            reports: [{ message: generateCompressionMessage('gzip', false, `, regardless of the user agent`) }],
            serverConfig: createGzipZopfliServerConfig(
                Object.assign(
                    headersConfig,
                    {
                        scriptFileContent: scriptFile.original,
                        scriptFileHeaders: { 'Content-Encoding': null }
                    }
                ),
                https
            )
        },
        {
            name: `Resource is not served compressed with Zopfli when Zopfli compression is requested with uncommon user agent string`,
            reports: [{ message: generateCompressionMessage('Zopfli', false, `, regardless of the user agent`) }],
            serverConfig: createGzipZopfliServerConfig(
                Object.assign(
                    headersConfig,
                    {
                        scriptFileContent: scriptFile.gzip,
                        scriptFileHeaders: { 'Content-Encoding': 'gzip' }
                    }
                ),
                https
            )
        }
    ];
};

const testsForNoCompression = (https: boolean = false): Array<HintTest> => {
    return [
        {
            name: `Resource is served compressed when requested uncompressed`,
            reports: [
                { message: `Response should not be compressed for requests made with 'accept-encoding: identity'.` },
                { message: `Response should not include 'content-encoding' header for requests made with 'accept-encoding: identity'.` }
            ],
            serverConfig: createGzipZopfliServerConfig(
                {
                    faviconFileContent: faviconFile.original,
                    faviconFileHeaders: { 'Content-Encoding': null },
                    htmlFileContent: htmlFile.original,
                    htmlFileHeaders: { 'Content-Encoding': null },
                    request: { headers: { 'Accept-Encoding': 'identity' } }
                },
                https
            )
        },
        {
            name: `Resource is served uncompressed and with the 'Content-Encoding: identity' header when requested uncompressed`,

            reports: [{ message: generateUnneededContentEncodingMessage('identity') }],
            serverConfig: createGzipZopfliServerConfig(
                {
                    faviconFileContent: faviconFile.original,
                    faviconFileHeaders: { 'Content-Encoding': null },
                    htmlFileContent: htmlFile.original,
                    htmlFileHeaders: { 'Content-Encoding': null },
                    request: { headers: { 'Accept-Encoding': 'identity' } },
                    scriptFileContent: scriptFile.original,
                    scriptFileHeaders: { 'Content-Encoding': 'identity' }
                },
                https
            )
        },
        {
            name: `Resources are served uncompressed when requested uncompressed`,
            serverConfig: createGzipZopfliServerConfig(
                {
                    faviconFileContent: faviconFile.original,
                    faviconFileHeaders: { 'Content-Encoding': null },
                    htmlFileContent: htmlFile.original,
                    htmlFileHeaders: { 'Content-Encoding': null },
                    request: { headers: { 'Accept-Encoding': 'identity' } },
                    scriptFileContent: scriptFile.original,
                    scriptFileHeaders: { 'Content-Encoding': null }
                },
                https
            )
        },
        {
            after() {
                fnWrapper.asyncTry = originalAsyncTry;
            },
            before() {
                fnWrapper.asyncTry = (fetch) => {
                    return (target, headers) => {
                        if (!target || !target.includes('script.js') || headers['Accept-Encoding'] !== 'identity') {
                            return fetch(target, headers);
                        }

                        return null;
                    };
                };

                mock('hint/dist/src/lib/utils/async-wrapper', fnWrapper);
            },
            name: `If a request throws an exception, if should be managed and report an error`,
            reports: [{ message: 'Could not be fetched when requested uncompressed' }],
            serverConfig: createGzipZopfliServerConfig(
                {
                    faviconFileContent: faviconFile.original,
                    faviconFileHeaders: { 'Content-Encoding': null },
                    htmlFileContent: htmlFile.original,
                    htmlFileHeaders: { 'Content-Encoding': null },
                    request: { headers: { 'Accept-Encoding': 'identity' } },
                    scriptFileContent: scriptFile.original,
                    scriptFileHeaders: { 'Content-Encoding': null }
                },
                https
            )
        }
    ];
};

const testsForSpecialCases = (https: boolean = false): Array<HintTest> => {
    return [

        // SVGZ.

        {
            name: `SVGZ image is served without the 'Content-Encoding: gzip' header`,
            reports: [{ message: generateContentEncodingMessage('gzip') }],
            serverConfig: createServerConfig({ svgzFileHeaders: { 'Content-Encoding': null } }, https)
        },
        {
            name: `SVGZ image is served with the wrong 'Content-Encoding: br' header`,
            reports: [{ message: generateContentEncodingMessage('gzip') }],
            serverConfig: createServerConfig({ svgzFileHeaders: { 'Content-Encoding': 'x-gzip' } }, https)
        }
    ];
};

const testsForUserConfigs = (encoding, isTarget: boolean = true, https: boolean = false): Array<HintTest> => {
    const isBrotli = encoding === 'Brotli';
    const isGzip = encoding === 'gzip';

    const configs = { request: { headers: { 'Accept-Encoding': isBrotli ? 'br' : 'gzip' } } };

    if (!isBrotli) {
        Object.assign(configs, { request: { headers: { vary: 'Accept-encoding' } } });
    }

    Object.assign(
        configs,
        isTarget ?
            {
                htmlFileContent: isGzip ? htmlFile.zopfli : htmlFile.gzip,
                htmlFileHeaders: { 'Content-Encoding': null }
            } :
            {
                scriptFileContent: isGzip ? scriptFile.zopfli : scriptFile.gzip,
                scriptFileHeaders: { 'Content-Encoding': null }
            }
    );

    return [
        {
            name: `${isTarget ? 'Target' : 'Resource'} is not served compressed with ${encoding} when ${isBrotli ? 'Brotli' : 'gzip'} compression is requested but the user configuration allows it`,
            serverConfig: isBrotli && https ? createBrotliServerConfig(configs) : createGzipZopfliServerConfig(configs, https)
        }
    ];
};

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export {
    testsForBrotli,
    testsForBrotliOverHTTP,
    testsForBrotliSmallSize,
    testsForBrotliUASniffing,
    testsForDefaults,
    testsForDisallowedCompressionMethods,
    testsForGzipZopfli,
    testsForGzipZopfliCaching,
    testsForGzipZopfliSmallSize,
    testsForGzipZopfliUASniffing,
    testsForNoCompression,
    testsForSpecialCases,
    testsForUserConfigs
};
