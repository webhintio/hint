import browserslist = require('browserslist'); // `require` used because `browserslist` exports a function

import { Engine } from 'hint';
import { Configuration } from 'hint/dist/src/lib/config';

// import CSSParser from '@hint/parser-css';
// import JavaScriptParser from '@hint/parser-javascript';
import ManifestParser from '@hint/parser-manifest';

import ContentTypeHint from '@hint/hint-content-type';
import ManifestIsValidHint from '@hint/hint-manifest-is-valid';
// import MinifiedJSHint from '@hint/hint-minified-js';

import WebExtensionConnector from './connector';
import WebExtensionFormatter from './formatter';

const config: Configuration = {
    browserslist: browserslist(),
    connector: { name: 'web-extension', options: { } },
    extends: undefined,
    formatters: ['web-extension'],
    hints: {
        'hint-content-type': 'error',
        'hint-manifest-is-valid': 'error'
        // 'hint-minified-js': 'error'
    },
    hintsTimeout: 10000,
    ignoredUrls: new Map(),
    parsers: [/* 'css', 'javascript', */'manifest']
};

const engine = new Engine(config, {
    connector: WebExtensionConnector,
    formatters: [WebExtensionFormatter],
    hints: [
        ContentTypeHint,
        ManifestIsValidHint
        // MinifiedJSHint
    ],
    incompatible: [],
    missing: [],
    parsers: [
        /* CSSParser, */
        /* JavaScriptParser, */
        ManifestParser
    ]
});

const main = async () => {
    const problems = await engine.executeOn(new URL(location.href));

    engine.formatters.forEach((formatter) => {
        formatter.format(problems, location.href, {});
    });
};

main();
