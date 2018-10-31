require('util.promisify/shim')(); // Needed for `promisify` to work when bundled.

import browserslist = require('browserslist'); // `require` used because `browserslist` exports a function.

import { Engine } from 'hint';
import { Configuration } from 'hint/dist/src/lib/config';
import { HintResources, HintsConfigObject, IHintConstructor } from 'hint/dist/src/lib/types';

import CSSParser from '@hint/parser-css';
import JavaScriptParser from '@hint/parser-javascript';
import ManifestParser from '@hint/parser-manifest';

import WebExtensionConnector from './connector';
import WebExtensionFormatter from './formatter';

// TODO: Filter based on choices from devtools panel.
const hints: IHintConstructor[] = [
    require('@hint/hint-axe').default,
    require('@hint/hint-content-type').default,
    require('@hint/hint-disown-opener').default,
    require('@hint/hint-highest-available-document-mode').default,
    require('@hint/hint-http-cache').default,
    require('@hint/hint-manifest-app-name').default,
    require('@hint/hint-manifest-file-extension').default,
    require('@hint/hint-manifest-is-valid').default,
    require('@hint/hint-meta-charset-utf-8').default,
    require('@hint/hint-meta-viewport').default,
    require('@hint/hint-minified-js').default,
    require('@hint/hint-no-disallowed-headers').default,
    require('@hint/hint-no-html-only-headers').default,
    require('@hint/hint-no-http-redirects').default,
    require('@hint/hint-no-protocol-relative-urls').default,
    // require('@hint/hint-no-vulnerable-javascript-libraries').default,
    require('@hint/hint-sri').default,
    // require('@hint/hint-strict-transport-security').default,
    require('@hint/hint-stylesheet-limits').default,
    require('@hint/hint-validate-set-cookie-header').default,
    require('@hint/hint-x-content-type-options').default
];

const hintsConfig = hints.reduce((o, hint) => {
    o[hint.meta.id] = 'warning';

    return o;
}, {} as HintsConfigObject);

const config: Configuration = {
    browserslist: browserslist(),
    connector: { name: 'web-extension', options: { } },
    extends: undefined,
    formatters: ['web-extension'],
    hints: hintsConfig,
    hintsTimeout: 10000,
    ignoredUrls: new Map(),
    parsers: ['css', 'javascript', 'manifest']
};

const resources: HintResources = {
    connector: WebExtensionConnector,
    formatters: [WebExtensionFormatter],
    hints,
    incompatible: [],
    missing: [],
    parsers: [
        CSSParser,
        JavaScriptParser,
        ManifestParser
    ]
};

const engine = new Engine(config, resources);

const main = async () => {
    const problems = await engine.executeOn(new URL(location.href));

    engine.formatters.forEach((formatter) => {
        formatter.format(problems, location.href, { resources });
    });
};

main();
