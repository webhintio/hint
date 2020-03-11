require('util.promisify/shim')(); // Needed for `promisify` to work when bundled.

import browserslist = require('browserslist'); // `require` used because `browserslist` exports a function.
import { URL } from 'url';

import { Engine } from 'hint/dist/src/lib/engine';
import { Configuration } from 'hint/dist/src/lib/config';
import { HintResources, IHintConstructor } from 'hint/dist/src/lib/types';
import { HintsConfigObject } from '@hint/utils';

import CSSParser from '@hint/parser-css';
import HTMLParser from '@hint/parser-html';
import JavaScriptParser from '@hint/parser-javascript';
import ManifestParser from '@hint/parser-manifest';

import { addHostListener, notifyHost, removeHostListener } from './shared/host';
import { Config, HostEvents } from './shared/types';

import WebWorkerConnector from './connector';

import hints from './shared/hints.import';

/* istanbul ignore next */
const reportError = (message: string, stack: string) => {
    notifyHost({
        error: {
            message,
            stack
        }
    });
};

const main = async (userConfig: Config) => {
    const enabledHints: IHintConstructor[] = [];

    const hintsConfig = hints.reduce((o, hint) => {
        o[hint.meta.id] = 'default';
        enabledHints.push(hint);

        return o;
    }, {} as HintsConfigObject);

    const config: Configuration = {
        browserslist: browserslist('defaults'),
        connector: { name: 'web-extension', options: {} },
        extends: undefined,
        formatters: ['web-extension'],
        hints: hintsConfig,
        hintsTimeout: 10000,
        ignoredUrls: new Map<string, RegExp[]>(),
        language: 'en-US',
        parsers: ['css', 'html', 'javascript', 'manifest']
    };

    const resources: HintResources = {
        connector: WebWorkerConnector,
        formatters: [],
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

    engine.on('print', ({ problems }) => {
        if (problems.length) {
            notifyHost({ results: problems });
        }
    });

    await engine.executeOn(new URL(userConfig.resource));
};

const onHostEvent = (events: HostEvents) => {
    if (events.config) {
        main(events.config).catch((err) => {
            reportError(err.message, err.stack);
        });
        removeHostListener(onHostEvent);
    }
};

addHostListener(onHostEvent);
notifyHost({ requestConfig: true });
