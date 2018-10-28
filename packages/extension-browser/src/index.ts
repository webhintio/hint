require('util.promisify/shim')(); // Needed for `promisify` to work when bundled.

import browserslist = require('browserslist'); // `require` used because `browserslist` exports a function.

import { Engine } from 'hint';
import { Configuration } from 'hint/dist/src/lib/config';

import CSSParser from '@hint/parser-css';
import JavaScriptParser from '@hint/parser-javascript';
import ManifestParser from '@hint/parser-manifest';

import AxeHint from '@hint/hint-axe';
import ContentTypeHint from '@hint/hint-content-type';
import DisownOpenerHint from '@hint/hint-disown-opener';
import HighestAvailableDocumentModeHint from '@hint/hint-highest-available-document-mode';
import HttpCacheHint from '@hint/hint-http-cache';
import ManifestAppNameHint from '@hint/hint-manifest-app-name';
import ManifestFileExtensionHint from '@hint/hint-manifest-file-extension';
import ManifestIsValidHint from '@hint/hint-manifest-is-valid';
import MetaCharsetUTF8Hint from '@hint/hint-meta-charset-utf-8';
import MetaViewportHint from '@hint/hint-meta-viewport';
import MinifiedJSHint from '@hint/hint-minified-js';
import NoDisallowedHeadersHint from '@hint/hint-no-disallowed-headers';
import NoHTMLOnlyHeadersHint from '@hint/hint-no-html-only-headers';
import NoHttpRedirectsHint from '@hint/hint-no-http-redirects';
import NoProtocolRelativeURLsHint from '@hint/hint-no-protocol-relative-urls';
// import NoVulnerableJavascriptLibrariesHint from '@hint/hint-no-vulnerable-javascript-libraries';
import SRIHint from '@hint/hint-sri';
// import StrictTransportSecurityHint from '@hint/hint-strict-transport-security';
import StylesheetLimitsHint from '@hint/hint-stylesheet-limits';
import ValidateSetCookieHeaderHint from '@hint/hint-validate-set-cookie-header';
import XContentTypeOptionsHint from '@hint/hint-x-content-type-options';

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
        'http-cache': 'error',
        'manifest-app-name': 'error',
        'manifest-file-extension': 'error',
        'manifest-is-valid': 'error',
        'meta-charset-utf-8': 'error',
        'meta-viewport': 'error',
        'minified-js': 'error',
        'no-disallowed-headers': 'error',
        'no-html-only-headers': 'error',
        'no-http-redirects': 'error',
        'no-protocol-relative-urls': 'error',
        // 'no-vulnerable-javascript-libraries': 'error'
        sri: 'error',
        // 'strict-transport-security': 'error',
        'stylesheet-limits': 'error',
        'validate-set-cookie-header': 'error',
        'x-content-type-options': 'error'
    },
    hintsTimeout: 10000,
    ignoredUrls: new Map(),
    parsers: ['css', 'javascript', 'manifest']
};

const engine = new Engine(config, {
    connector: WebExtensionConnector,
    formatters: [WebExtensionFormatter],
    hints: [
        AxeHint,
        ContentTypeHint,
        DisownOpenerHint,
        HighestAvailableDocumentModeHint,
        HttpCacheHint,
        ManifestAppNameHint,
        ManifestFileExtensionHint,
        ManifestIsValidHint,
        MetaCharsetUTF8Hint,
        MetaViewportHint,
        MinifiedJSHint,
        NoDisallowedHeadersHint,
        NoHTMLOnlyHeadersHint,
        NoHttpRedirectsHint,
        NoProtocolRelativeURLsHint,
        // NoVulnerableJavascriptLibrariesHint,
        SRIHint,
        // StrictTransportSecurityHint,
        StylesheetLimitsHint,
        ValidateSetCookieHeaderHint,
        XContentTypeOptionsHint
    ],
    incompatible: [],
    missing: [],
    parsers: [
        CSSParser,
        JavaScriptParser,
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
