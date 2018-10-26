import browserslist = require('browserslist'); // `require` used because `browserslist` exports a function

import { Engine } from 'hint';
import { Configuration } from 'hint/dist/src/lib/config';

// import CSSParser from '@hint/parser-css';
// import JavaScriptParser from '@hint/parser-javascript';
import ManifestParser from '@hint/parser-manifest';

import AxeHint from '@hint/hint-axe';
import ContentTypeHint from '@hint/hint-content-type';
import DisownOpenerHint from '@hint/hint-disown-opener';
import HighestAvailableDocumentModeHint from '@hint/hint-highest-available-document-mode';
import ManifestAppNameHint from '@hint/hint-manifest-app-name';
import ManifestFileExtensionHint from '@hint/hint-manifest-file-extension';
import ManifestIsValidHint from '@hint/hint-manifest-is-valid';
import MetaCharsetUTF8Hint from '@hint/hint-meta-charset-utf-8';
// import MinifiedJSHint from '@hint/hint-minified-js';
import NoHttpRedirectsHint from '@hint/hint-no-http-redirects';

import WebExtensionConnector from './connector';
import WebExtensionFormatter from './formatter';

const config: Configuration = {
    browserslist: browserslist(),
    connector: { name: 'web-extension', options: { } },
    extends: undefined,
    formatters: ['web-extension'],
    hints: {
        axe: 'error',
        'content-type': 'error',
        'disown-opener': 'error',
        'highest-available-document-mode': 'error',
        'manifest-app-name': 'error',
        'manifest-file-extension': 'error',
        'manifest-is-valid': 'error',
        'meta-charset-utf-8': 'error',
        // 'minified-js': 'error',
        'no-broken-links': 'error',
        'no-http-redirects': 'error'
    },
    hintsTimeout: 10000,
    ignoredUrls: new Map(),
    parsers: [/* 'css', 'javascript', */'manifest']
};

const engine = new Engine(config, {
    connector: WebExtensionConnector,
    formatters: [WebExtensionFormatter],
    hints: [
        AxeHint,
        ContentTypeHint,
        DisownOpenerHint,
        HighestAvailableDocumentModeHint,
        ManifestAppNameHint,
        ManifestFileExtensionHint,
        ManifestIsValidHint,
        MetaCharsetUTF8Hint,
        // MinifiedJSHint,
        NoHttpRedirectsHint
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
