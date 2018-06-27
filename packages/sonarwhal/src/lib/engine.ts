/**
 * @fileoverview hint engine object, gets the configuration and loads
 * the connectors, rules and analyzes.
 */

/*
 * ------------------------------------------------------------------------------
 * Requirements
 * ------------------------------------------------------------------------------
 */

import * as url from 'url';

import chalk from 'chalk';
import { EventEmitter2 as EventEmitter } from 'eventemitter2';
import * as _ from 'lodash';

import { debug as d } from './utils/debug';
import { getSeverity } from './config/config-rules';
import { IAsyncHTMLElement, IConnector, NetworkData, UserConfig, Event, Problem, ProblemLocation, IRule, RuleConfig, Severity, IRuleConstructor, IConnectorConstructor, Parser, IFormatter, HintResources } from './types';
import * as logger from './utils/logging';
import { RuleContext } from './rule-context';
import { RuleScope } from './enums/rulescope';
import { HintConfig } from './config';

const debug: debug.IDebugger = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Public interface
 * ------------------------------------------------------------------------------
 */

export class Engine extends EventEmitter {
    // TODO: review which ones need to be private or not
    private parsers: Array<Parser>
    private rules: Map<string, IRule>
    private connector: IConnector
    private connectorConfig: object
    private messages: Array<Problem>
    private browserslist: Array<string> = [];
    private ignoredUrls: Map<string, Array<RegExp>>;
    private _formatters: Array<IFormatter>
    private _timeout: number = 60000;
    private _config: UserConfig;

    /** The DOM of the loaded page. */
    public get pageDOM(): object {
        return this.connector.dom;
    }

    /** The HTML of the loaded page. */
    public get pageContent(): Promise<string> {
        return this.connector.html;
    }

    /** The headers used in the requests. */
    public get pageHeaders(): object {
        return this.connector.headers;
    }

    /** The list of targetted browsers. */
    public get targetedBrowsers(): Array<string> {
        return this.browserslist;
    }

    /** The list of configured formatters. */
    public get formatters(): Array<IFormatter> {
        return this._formatters;
    }

    /** The max time an event should run. */
    public get timeout(): number {
        return this._timeout;
    }

    private isIgnored(urls: Array<RegExp>, resource: string): boolean {
        if (!urls) {
            return false;
        }

        return urls.some((urlIgnored: RegExp) => {
            return urlIgnored.test(resource);
        });
    }

    public constructor(config: HintConfig, resources: HintResources) {
        super({
            delimiter: '::',
            maxListeners: 0,
            wildcard: true
        });

        debug('Initializing hint engine');
        this._timeout = config.rulesTimeout;
        this.messages = [];
        this.browserslist = config.browserslist;
        this.ignoredUrls = config.ignoredUrls;

        const Connector: IConnectorConstructor = resources.connector;
        const connectorId = config.connector.name;

        if (!Connector) {
            throw new Error(`Connector "${connectorId}" not found`);
        }

        this.connector = new Connector(this, config.connector.options);
        this._formatters = resources.formatters.map((Formatter) => {
            return new Formatter();
        });

        this.parsers = resources.parsers.map((ParserConstructor) => {
            debug(`Loading parser`);

            return new ParserConstructor(this);
        });

        this.rules = new Map();

        /**
         * Returns the configuration for a given rule ID. In the case of a rule
         * pointing to a path, it will return the content of the first entry
         * in the config that contains the ID. E.g.:
         * * `../rule-x-content-type-options` is the key in the config
         * * `x-content-type-options` is the ID of the rule
         * * One of the keys in the config `includes` the rule ID so it's a match
         *
         * @param id The id of the rule
         */
        const getRuleConfig = (id: string): RuleConfig | Array<RuleConfig> => {
            if (config.rules[id]) {
                return config.rules[id];
            }

            const ruleEntries = Object.keys(config.rules);
            const idParts = id.split('/');

            /**
             * At this point we are trying to find the configuration of a rule specified
             * via a path.
             * The id of a rule (define in `Rule.meta.id`) will be `packageName/rule-id`
             * but most likely the code is not going to be on a path that ends like that
             * and will be more similar to `packageName/dist/src/rule-id.js`
             *
             * To solve this, we iterate over all the keys of the `rules` object until
             * we find the first entry that includes all the parts of the id
             * (`packageName` and `rule-id` in the example).
             *
             * E.g.:
             * * `../rule-packageName/dist/src/rule-id.js` --> Passes
             * * `../rule-packageAnotherName/dist/src/rule-id.js` --> Fails because
             *   `packageName` is not in that path
             */
            const ruleKey = ruleEntries.find((entry) => {
                return idParts.every((idPart) => {
                    return entry.includes(idPart);
                });
            });

            return config.rules[ruleKey];
        };

        resources.rules.forEach((Rule) => {
            debug('Loading rules');
            const id = Rule.meta.id;

            const ignoreRule = (RuleCtor: IRuleConstructor): boolean => {
                const ignoredConnectors: Array<string> = RuleCtor.meta.ignoredConnectors || [];

                return (connectorId === 'local' && RuleCtor.meta.scope === RuleScope.site) ||
                    (connectorId !== 'local' && RuleCtor.meta.scope === RuleScope.local) ||
                    ignoredConnectors.includes(connectorId);
            };

            const ruleOptions: RuleConfig | Array<RuleConfig> = getRuleConfig(id);
            const severity: Severity = getSeverity(ruleOptions);

            if (ignoreRule(Rule)) {
                debug(`Rule "${id}" is disabled for the connector "${connectorId}"`);
                // TODO: I don't think we should have a dependency on logger here. Maybe send a warning event?
                logger.log(chalk.yellow(`Warning: The rule "${id}" will be ignored for the connector "${connectorId}"`));
            } else if (severity) {
                const context: RuleContext = new RuleContext(id, this, severity, ruleOptions, Rule.meta);
                const rule: IRule = new Rule(context);

                this.rules.set(id, rule);
            } else {
                debug(`Rule "${id}" is disabled`);
            }
        });
    }

    public onRuleEvent(id: string, eventName: string, listener: Function) {
        const that = this;

        const createEventHandler = (handler: Function, ruleId: string) => {
            return function (event: Event): Promise<any> {
                const urlsIgnoredForAll = that.ignoredUrls.get('all') ? that.ignoredUrls.get('all') : [];
                const urlsIgnoredForRule = that.ignoredUrls.get(ruleId) ? that.ignoredUrls.get(ruleId) : [];
                const urlsIgnored = urlsIgnoredForRule.concat(urlsIgnoredForAll);

                if (that.isIgnored(urlsIgnored, event.resource)) {
                    return null;
                }

                // If a rule is spending a lot of time to finish we should ignore it.

                return new Promise((resolve) => {
                    let immediateId: any;

                    const timeoutId = setTimeout(() => {
                        if (immediateId) {
                            clearImmediate(immediateId);
                            immediateId = null;
                        }

                        debug(`Rule ${ruleId} timeout`);

                        resolve(null);
                    }, that._timeout);

                    immediateId = setImmediate(async () => {
                        const result: any = await handler(event, this.event); // eslint-disable-line no-invalid-this

                        if (timeoutId) {
                            clearTimeout(timeoutId);
                        }

                        resolve(result);
                    });
                });
            };
        };

        this.on(eventName, createEventHandler(listener, id));
    }

    public fetchContent(target: string | url.URL, headers: object): Promise<NetworkData> {
        return this.connector.fetchContent(target, headers);
    }

    public evaluate(source: string) {
        return this.connector.evaluate(source);
    }

    /** Releases any used resource and/or browser. */
    public async close() {
        await this.connector.close();
    }

    /** Reports a message from one of the rules. */
    public report(ruleId: string, severity: Severity, sourceCode: string, location: ProblemLocation, message: string, resource: string) {
        const problem: Problem = {
            location: location || { column: -1, line: -1 },
            message,
            resource,
            ruleId,
            severity,
            sourceCode
        };

        this.messages.push(problem);
    }

    public clean(fileUrl: url.URL) {
        const file = url.format(fileUrl);

        _.remove(this.messages, (message) => {
            return message.resource === file;
        });
    }

    public clear() {
        this.messages = [];
    }

    public async notify() {
        await this.emitAsync('print', this.messages);
    }

    /** Runs all the configured rules on a target */
    public async executeOn(target: url.URL): Promise<Array<Problem>> {

        const start: number = Date.now();

        debug(`Starting the analysis on ${target.href}`);

        await this.connector.collect(target);

        debug(`Total runtime ${Date.now() - start}`);

        return this.messages;
    }

    public querySelectorAll(selector: string): Promise<Array<IAsyncHTMLElement>> {
        return this.connector.querySelectorAll(selector);
    }

    public emitAsync(event: string | Array<string>, ...values: Array<any>): Promise<Array<any>> {
        const ignoredUrls: Array<RegExp> = this.ignoredUrls.get('all');

        if (this.isIgnored(ignoredUrls, values[0].resource)) {
            return Promise.resolve([]);
        }

        return super.emitAsync(event, ...values);
    }
}
