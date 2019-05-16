require('util.promisify/shim')(); // Needed for `promisify` to work when bundled.

import browserslist = require('browserslist'); // `require` used because `browserslist` exports a function.
import { URL } from 'url';

import { Engine } from 'hint/dist/src/lib/engine';
import { Configuration } from 'hint/dist/src/lib/config';
import { HintResources, HintsConfigObject, IHintConstructor } from 'hint/dist/src/lib/types';

import CSSParser from '@hint/parser-css';
import HTMLParser from '@hint/parser-html';
import JavaScriptParser from '@hint/parser-javascript';
import ManifestParser from '@hint/parser-manifest';

import { browser, location } from '../shared/globals';
import { Config, Events } from '../shared/types';

import WebExtensionConnector from './connector';
import WebExtensionFormatter from './formatter';

import hints from '../shared/hints.import';

const reportError = (message: string, stack: string) => {
    // TODO: Remove URLs and file paths from stack
    browser.runtime.sendMessage({
        error: {
            message,
            stack
        }
    });
};

/** Use the provided `browserslist` query if valid; `defaults` otherwise. */
const determineBrowserslist = (list?: string) => {
    if (list) {
        try {
            return browserslist(list);
        } catch (e) {
            console.warn(e, `Falling back to 'defaults'.`);
        }
    }

    return browserslist('defaults');
};

/** Build a `RegExp` to ignore all hints on the specified URLs (if provided). */
const determineIgnoredUrls = (ignoredUrls?: string) => {
    const map = new Map<string, RegExp[]>();

    if (ignoredUrls) {
        try {
            map.set('all', [new RegExp(ignoredUrls, 'i')]);
        } catch (e) {
            console.warn(e, 'Falling back to include all URLs.');
        }
    }

    return map;
};

const main = async (userConfig: Config) => {
    const enabledHints: IHintConstructor[] = [];

    const hintsConfig = hints.reduce((o, hint) => {
        const category = hint.meta.docs && hint.meta.docs.category || 'other';
        const enabled = !(userConfig.disabledCategories && userConfig.disabledCategories.includes(category));

        o[hint.meta.id] = enabled ? 'warning' : 'off';

        if (enabled) {
            enabledHints.push(hint);
        }

        return o;
    }, {} as HintsConfigObject);

    const config: Configuration = {
        browserslist: determineBrowserslist(userConfig.browserslist && userConfig.browserslist.trim()),
        connector: { name: 'web-extension', options: {} },
        extends: undefined,
        formatters: ['web-extension'],
        hints: hintsConfig,
        hintsTimeout: 10000,
        ignoredUrls: determineIgnoredUrls(userConfig.ignoredUrls),
        parsers: ['css', 'html', 'javascript', 'manifest']
    };

    const resources: HintResources = {
        connector: WebExtensionConnector,
        formatters: [WebExtensionFormatter],
        hints: enabledHints,
        incompatible: [],
        missing: [],
        parsers: [
            CSSParser as any,
            HTMLParser as any,
            JavaScriptParser as any,
            ManifestParser as any
        ]
    };

    const engine = new Engine(config, resources);
    const problems = await engine.executeOn(new URL(location.href));

    engine.formatters.forEach((formatter) => {
        formatter.format(problems, {
            resources,
            target: location.href
        });
    });
};

const onMessage = (events: Events) => {
    if (events.config) {
        main(events.config).catch((err) => {
            reportError(err.message, err.stack);
        });
        browser.runtime.onMessage.removeListener(onMessage);
    }
};

browser.runtime.onMessage.addListener(onMessage);

const requestConfig: Events = { requestConfig: true };

browser.runtime.sendMessage(requestConfig);
