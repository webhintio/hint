require('util.promisify/shim')(); // Needed for `promisify` to work when bundled.

import browserslist = require('browserslist'); // `require` used because `browserslist` exports a function.
import { URL } from 'url';

import { Engine } from 'hint/dist/src/lib/engine';
import { Configuration } from 'hint/dist/src/lib/config';
import { HintResources, IHintConstructor } from 'hint/dist/src/lib/types';
import { HintsConfigObject } from '@hint/utils/dist/src/config/types';
import normalizeHints from '@hint/utils/dist/src/config/normalize-hints';

import { addHostListener, notifyHost, removeHostListener } from './shared/host';
import { Config, HostEvents } from './shared/types';

import WebWorkerConnector from './connector';

import hints from './shared/hints.import';
import parsers from './shared/parsers.import';

/* istanbul ignore next */
const reportError = (message: string, stack: string) => {
    notifyHost({
        error: {
            message,
            stack
        }
    });
};

const main = async ({ defaultHintSeverity = 'default', resource, userConfig = {} }: Config) => {
    const enabledHints: IHintConstructor[] = [];
    const configuredHints = normalizeHints(userConfig.hints || []);

    const hintsConfig = hints.reduce((o, hint) => {
        o[hint.meta.id] = configuredHints[hint.meta.id] || defaultHintSeverity;

        if (o[hint.meta.id] !== 'off') {
            enabledHints.push(hint);
        }

        return o;
    }, {} as HintsConfigObject);

    const config: Configuration = {
        browserslist: browserslist(userConfig.browserslist || 'defaults'),
        connector: { name: 'web-worker' },
        extends: [],
        formatters: [],
        hints: hintsConfig,
        hintsTimeout: userConfig.hintsTimeout || 10000,
        ignoredUrls: new Map<string, RegExp[]>(),
        language: userConfig.language,
        parsers: [...parsers.keys()]
    };

    const resources: HintResources = {
        connector: WebWorkerConnector,
        formatters: [],
        hints: enabledHints,
        incompatible: [],
        missing: [],
        parsers: [...parsers.values()]
    };

    const engine = new Engine(config, resources);

    engine.on('print', ({ problems }) => {
        if (problems.length) {
            notifyHost({ results: problems });
        }
    });

    await engine.executeOn(new URL(resource));
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
