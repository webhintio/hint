require('util.promisify/shim')(); // Needed for `promisify` to work when bundled.

import browserslist = require('browserslist'); // `require` used because `browserslist` exports a function.
import { URL } from 'url';

import { Engine } from 'hint';
import { Configuration } from 'hint/dist/src/lib/config';
import { HintResources, HintsConfigObject, IHintConstructor } from 'hint/dist/src/lib/types';

import JavaScriptParser from '@hint/parser-javascript';
import ManifestParser from '@hint/parser-manifest';

import { browser, location } from '../shared/globals';
import { Config, Events } from '../shared/types';

import WebExtensionConnector from './connector';
import WebExtensionFormatter from './formatter';

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

const main = async (userConfig: Config) => {
    const enabledHints: IHintConstructor[] = [];

    const hintsConfig = hints.reduce((o, hint) => {
        const category = hint.meta.docs && hint.meta.docs.category || 'other';
        const enabled = !userConfig.categories || userConfig.categories.includes(category);

        o[hint.meta.id] = enabled ? 'warning' : 'off';

        if (enabled) {
            enabledHints.push(hint);
        }

        return o;
    }, {} as HintsConfigObject);

    const ignoredUrls = (() => {
        const map = new Map<string, RegExp[]>();

        if (userConfig.ignoredUrls) {
            map.set('all', [new RegExp(userConfig.ignoredUrls, 'i')]);
        }

        return map;
    })();

    const config: Configuration = {
        browserslist: browserslist(userConfig.browserslist || 'defaults'),
        connector: { name: 'web-extension', options: { } },
        extends: undefined,
        formatters: ['web-extension'],
        hints: hintsConfig,
        hintsTimeout: 10000,
        ignoredUrls,
        parsers: ['javascript', 'manifest']
    };

    const resources: HintResources = {
        connector: WebExtensionConnector,
        formatters: [WebExtensionFormatter],
        hints: enabledHints,
        incompatible: [],
        missing: [],
        parsers: [
            JavaScriptParser as any,
            ManifestParser as any
        ]
    };

    const engine = new Engine(config, resources);
    const problems = await engine.executeOn(new URL(location.href));

    engine.formatters.forEach((formatter) => {
        formatter.format(problems, location.href, { resources });
    });
};

const onMessage = (events: Events) => {
    if (events.enable) {
        main(events.enable);
        browser.runtime.onMessage.removeListener(onMessage);
    }
};

browser.runtime.onMessage.addListener(onMessage);

const requestConfig: Events = { requestConfig: true };

browser.runtime.sendMessage(requestConfig);
