/**
 * @fileoverview hint engine object, gets the configuration and loads
 * the connectors, hints and analyzes.
 */

/*
 * ------------------------------------------------------------------------------
 * Requirements
 * ------------------------------------------------------------------------------
 */

import * as url from 'url';

import chalk from 'chalk';
import { EventEmitter2 as EventEmitter } from 'eventemitter2';
import remove = require('lodash/remove');

import * as logger from '@hint/utils/dist/src/logging';
import { HttpHeaders } from '@hint/utils/dist/src/types/http-header';
import { debug as d } from '@hint/utils/dist/src/debug';
import { HTMLElement, HTMLDocument } from '@hint/utils/dist/src/dom/html';

import { getSeverity } from './config/config-hints';
import {
    Events,
    HintConfig,
    HintResources,
    IConnector,
    IConnectorConstructor,
    IFetchOptions,
    IFormatter,
    IHint,
    IHintConstructor,
    NetworkData,
    Parser,
    StringKeyOf
} from './types';
import { HintContext } from './hint-context';
import { HintScope } from './enums/hint-scope';
import { Configuration } from './config';
import {
    Problem,
    Severity
} from '@hint/utils/dist/src/types/problems';

const debug: debug.IDebugger = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Public interface
 * ------------------------------------------------------------------------------
 */

export class Engine<E extends Events = Events> extends EventEmitter {
    // TODO: review which ones need to be private or not
    private parsers: Parser[]
    private hints: Map<string, IHint>
    private connector: IConnector
    private messages: Problem[]
    private browserslist: string[] = [];
    private ignoredUrls: Map<string, RegExp[]>;
    private _formatters: IFormatter[]
    private _timeout: number = 60000;

    /** The DOM of the loaded page. */
    public get pageDOM(): HTMLDocument | undefined {
        return this.connector.dom;
    }

    /** The HTML of the loaded page. */
    public get pageContent(): string | undefined {
        return this.connector.html;
    }

    /** The headers used in the requests. */
    public get pageHeaders(): HttpHeaders | undefined {
        return this.connector.headers;
    }

    /** The list of targetted browsers. */
    public get targetedBrowsers(): string[] {
        return this.browserslist;
    }

    /** The list of configured formatters. */
    public get formatters(): IFormatter[] {
        return this._formatters;
    }

    /** The max time an event should run. */
    public get timeout(): number {
        return this._timeout;
    }

    private isIgnored(urls: RegExp[], resource: string): boolean {
        if (!urls) {
            return false;
        }

        return urls.some((urlIgnored: RegExp) => {
            return urlIgnored.test(resource);
        });
    }

    public constructor(config: Configuration, resources: HintResources) {
        super({
            delimiter: '::',
            maxListeners: 0,
            wildcard: true
        });

        debug('Initializing hint engine');
        this._timeout = config.hintsTimeout;
        this.messages = [];
        this.browserslist = config.browserslist;
        this.ignoredUrls = config.ignoredUrls;

        const Connector: IConnectorConstructor | null = resources.connector;
        const connectorId = config.connector && config.connector.name;

        if (!Connector) {
            throw new Error(`Connector "${connectorId}" not found`);
        }

        this.connector = new Connector(this, config.connector && config.connector.options);
        this._formatters = resources.formatters.map((Formatter) => {
            return new Formatter();
        });

        this.parsers = resources.parsers.map((ParserConstructor) => {
            debug(`Loading parser`);

            return new ParserConstructor(this);
        });

        debug(`Parsers loaded: ${this.parsers.length}`);

        this.hints = new Map();

        /**
         * Returns the configuration for a given hint ID. In the case of a hint
         * pointing to a path, it will return the content of the first entry
         * in the config that contains the ID. E.g.:
         * * `../hint-x-content-type-options` is the key in the config
         * * `x-content-type-options` is the ID of the hint
         * * One of the keys in the config `includes` the hint ID so it's a match
         *
         * @param id The id of the hint
         */
        const getHintConfig = (id: string): HintConfig | HintConfig[] => {
            if (config.hints[id]) {
                return config.hints[id];
            }

            const hintEntries = Object.keys(config.hints);
            const idParts = id.split('/');

            /**
             * At this point we are trying to find the configuration of a hint specified
             * via a path.
             * The id of a hint (define in `Hint.meta.id`) will be `packageName/hint-id`
             * but most likely the code is not going to be on a path that ends like that
             * and will be more similar to `packageName/dist/src/hint-id.js`
             *
             * To solve this, we iterate over all the keys of the `hints` object until
             * we find the first entry that includes all the parts of the id
             * (`packageName` and `hint-id` in the example).
             *
             * E.g.:
             * * `../hint-packageName/dist/src/hint-id.js` --> Passes
             * * `../hint-packageAnotherName/dist/src/hint-id.js` --> Fails because
             *   `packageName` is not in that path
             */
            const hintKey = hintEntries.find((entry) => {
                return idParts.every((idPart) => {
                    return entry.includes(idPart);
                });
            });

            return config.hints[hintKey || ''];
        };

        resources.hints.forEach((Hint) => {
            debug('Loading hints');
            const id = Hint.meta.id;

            const ignoreHint = (HintCtor: IHintConstructor): boolean => {
                const ignoredConnectors: string[] = HintCtor.meta.ignoredConnectors || [];

                return (connectorId === 'local' && HintCtor.meta.scope === HintScope.site) ||
                    (connectorId !== 'local' && HintCtor.meta.scope === HintScope.local) ||
                    ignoredConnectors.includes(connectorId || '');
            };

            const getIgnoredUrls = () => {
                const urlsIgnoredForAll = this.ignoredUrls.get('all') || [];
                const urlsIgnoredForHint = this.ignoredUrls.get(id) || [];

                return urlsIgnoredForAll.concat(urlsIgnoredForHint);
            };

            const hintOptions: HintConfig | HintConfig[] = getHintConfig(id);
            const severity: Severity | null = getSeverity(hintOptions);

            if (ignoreHint(Hint)) {
                debug(`Hint "${id}" is disabled for the connector "${connectorId}"`);
                // TODO: I don't think we should have a dependency on logger here. Maybe send a warning event?
                logger.log(chalk.yellow(`Warning: The hint "${id}" will be ignored for the connector "${connectorId}"`));
            } else if (severity) {
                const context: HintContext = new HintContext(id, this, severity, hintOptions, Hint.meta, getIgnoredUrls());
                const hint: IHint = new Hint(context);

                this.hints.set(id, hint);
            } else {
                debug(`Hint "${id}" is disabled`);
            }
        });
    }

    public onHintEvent<K extends StringKeyOf<E>>(id: string, eventName: K, listener: (data: E[K], event: string) => void) {
        const that = this;

        const createEventHandler = (handler: (data: E[K], event: string) => void, hintId: string) => {
            /*
             * Using fake `this` parameter for typing: https://www.typescriptlang.org/docs/handbook/functions.html#this-parameters
             * `this.event` defined by eventemitter2: https://github.com/EventEmitter2/EventEmitter2#differences-non-breaking-compatible-with-existing-eventemitter
             */
            return function (this: { event: string }, event: E[K]): Promise<any> | null {
                const urlsIgnoredForAll = that.ignoredUrls.get('all') || [];
                const urlsIgnoredForHint = that.ignoredUrls.get(hintId) || [];
                const urlsIgnored = urlsIgnoredForHint.concat(urlsIgnoredForAll);
                const eventName = this.event; // eslint-disable-line no-invalid-this

                if (that.isIgnored(urlsIgnored, (event as any).resource)) {
                    return null;
                }

                // If a hint is spending a lot of time to finish we should ignore it.

                return new Promise((resolve, reject) => {
                    let immediateId: any;

                    const timeoutId = setTimeout(() => {
                        if (immediateId) {
                            clearImmediate(immediateId);
                            immediateId = null;
                        }

                        debug(`Hint ${hintId} timeout`);

                        resolve(null);
                    }, that._timeout);

                    immediateId = setImmediate(async () => {
                        try {
                            const result: any = await handler(event, eventName);

                            if (timeoutId) {
                                clearTimeout(timeoutId);
                            }

                            resolve(result);
                        } catch (e) {
                            reject(e);
                        }
                    });
                });
            };
        };

        this.on(eventName as any, createEventHandler(listener, id));
    }

    public fetchContent(target: string | url.URL, headers?: object): Promise<NetworkData> {
        return this.connector.fetchContent(target, headers);
    }

    public evaluate(source: string) {
        return this.connector.evaluate(source);
    }

    /** Releases any used resource and/or browser. */
    public async close() {
        await this.connector.close();
    }

    /** Reports a message from one of the hints. */
    public report(problem: Problem) {
        this.messages.push(problem);
    }

    public clean(fileUrl: url.URL) {
        const file = url.format(fileUrl);

        remove(this.messages, (message) => {
            return message.resource === file;
        });
    }

    public clear() {
        this.messages = [];
    }

    public async notify(this: Engine<Events>, resource: string) {
        await this.emitAsync('print', {
            problems: this.messages,
            resource
        });
    }

    /** Runs all the configured hints on a target */
    public async executeOn(target: url.URL, options?: IFetchOptions): Promise<Problem[]> {

        const start: number = Date.now();

        debug(`Starting the analysis on ${target.href}`);

        await this.connector.collect(target, options);

        debug(`Total runtime ${Date.now() - start}`);

        return this.messages;
    }

    public querySelectorAll(selector: string): HTMLElement[] {
        return this.connector.querySelectorAll(selector);
    }

    public emit<K extends StringKeyOf<E>>(event: K, data: E[K]): boolean {
        return super.emit(event, data);
    }

    public emitAsync<K extends StringKeyOf<E>>(event: K, data: E[K]): Promise<any[]> {
        const ignoredUrls = this.ignoredUrls.get('all') || [];

        if (this.isIgnored(ignoredUrls, (data as any).resource)) {
            return Promise.resolve([]);
        }

        return super.emitAsync(event, data);
    }

    public on<K extends StringKeyOf<E>>(event: K, listener: (data: E[K]) => void): this {
        return super.on(event, listener);
    }
}
