/**
 * @fileoverview Main sonarwhal object, gets the configuration and loads
 * the connectors, rules and analyzes.
 */

/*
 * ------------------------------------------------------------------------------
 * Requirements
 * ------------------------------------------------------------------------------
 */

import * as url from 'url';

import * as browserslist from 'browserslist';
import chalk from 'chalk';
import { EventEmitter2 as EventEmitter } from 'eventemitter2';
import * as _ from 'lodash';

import { debug as d } from './utils/debug';
import { getSeverity } from './config/config-rules';
import { IAsyncHTMLElement, IConnector, INetworkData, UserConfig, IEvent, IProblem, IProblemLocation, IRule, RuleConfig, Severity, IgnoredUrl, IRuleConstructor, IConnectorConstructor, IParserConstructor, IParser } from './types';
import * as logger from './utils/logging';
import * as resourceLoader from './utils/resource-loader';
import normalizeRules from './utils/normalize-rules';
import { RuleContext } from './rule-context';
import { RuleScope } from './enums/rulescope';

const debug: debug.IDebugger = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Public interface
 * ------------------------------------------------------------------------------
 */

export class Sonarwhal extends EventEmitter {
    // TODO: review which ones need to be private or not
    private parsers: Array<IParser>
    private rules: Map<string, IRule>
    private connector: IConnector
    private connectorId: string
    private connectorConfig: object
    private messages: Array<IProblem>
    private browserslist: Array<string> = [];
    private ignoredUrls: Map<string, Array<RegExp>>;
    private _formatters: Array<string>
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
    public get formatters(): Array<string> {
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

    public constructor(config: UserConfig) {
        super({
            delimiter: '::',
            maxListeners: 0,
            wildcard: true
        });

        debug('Initializing sonarwhal engine');
        this._config = config;
        this._timeout = config.rulesTimeout || this._timeout;

        this.messages = [];

        debug('Loading connector');

        if (!config.connector) {
            throw new Error(`Connector not found in the configuration`);
        }

        if (typeof config.connector === 'string') {
            this.connectorId = config.connector;
            this.connectorConfig = {};
        } else {
            this.connectorId = config.connector.name;
            this.connectorConfig = config.connector.options;
        }

        // this.connectorConfig = Object.assign(this.connectorConfig, { watch: config.watch });

        debug('Loading supported browsers');
        if (!config.browserslist || config.browserslist.length === 0) {
            this.browserslist = browserslist();
        } else {
            this.browserslist = browserslist(config.browserslist);
        }

        debug('Setting the selected formatters');
        if (Array.isArray(config.formatters)) {
            this._formatters = config.formatters;
        } else {
            this._formatters = [config.formatters];
        }

        debug('Initializing ignored urls');
        this.ignoredUrls = new Map();
        if (config.ignoredUrls) {
            config.ignoredUrls.forEach((ignoredUrl: IgnoredUrl) => {
                const { domain: urlRegexString, rules } = ignoredUrl;

                rules.forEach((rule: string) => {
                    const ruleName = rule === '*' ? 'all' : rule;

                    const urlsInRule: Array<RegExp> = this.ignoredUrls.get(ruleName);
                    const urlRegex: RegExp = new RegExp(urlRegexString, 'i');

                    if (!urlsInRule) {
                        this.ignoredUrls.set(ruleName, [urlRegex]);
                    } else {
                        urlsInRule.push(urlRegex);
                    }
                });
            });
        }

        const Connector: IConnectorConstructor = resourceLoader.loadConnector(this.connectorId);

        if (!Connector) {
            throw new Error(`Connector "${this.connectorId}" not found`);
        }

        this.connector = new Connector(this, this.connectorConfig);
        this.initParsers();
        this.initRules();
    }

    private initParsers() {
        const config = this._config;

        debug('Loading parsers');

        this.parsers = [];
        if (!config.parsers) {
            return;
        }

        const parsers: Map<string, IParserConstructor> = resourceLoader.loadParsers(config.parsers);

        parsers.forEach((ParserConst, parserId) => {
            debug(`Loading parser ${parserId}`);

            const parser: IParser = new ParserConst(this);

            this.parsers.push(parser);
        });
    }

    private initRules() {
        const config = this._config;

        debug('Loading rules');
        this.rules = new Map();
        if (!config.rules) {
            return;
        }

        config.rules = normalizeRules(config.rules);

        const rules: Map<string, IRuleConstructor> = resourceLoader.loadRules(config.rules);
        const rulesIds: Array<string> = Object.keys(config.rules);


        const ignoreRule = (rule): boolean => {
            const ignoredConnectors: Array<string> = rule.meta.ignoredConnectors || [];

            return (this.connectorId === 'local' && rule.meta.scope === RuleScope.site) ||
                (this.connectorId !== 'local' && rule.meta.scope === RuleScope.local) ||
                ignoredConnectors.includes(this.connectorId);
        };

        rulesIds.forEach((id: string) => {
            const Rule: IRuleConstructor = rules.get(id);

            const ruleOptions: RuleConfig | Array<RuleConfig> = config.rules[id];
            const severity: Severity = getSeverity(ruleOptions);

            if (ignoreRule(Rule)) {
                debug(`Rule "${id}" is disabled for the connector "${this.connectorId}"`);
                // TODO: I don't think we should have a dependency on logger here. Maybe send a warning event?
                logger.log(chalk.yellow(`Warning: The rule "${id}" will be ignored for the connector "${this.connectorId}"`));
            } else if (severity) {
                const context: RuleContext = new RuleContext(id, this, severity, ruleOptions, Rule.meta);
                const rule: IRule = new Rule(id, context);

                this.rules.set(id, rule);
            } else {
                debug(`Rule "${id}" is disabled`);
            }
        });

        debug(`Rules loaded: ${this.rules.size}`);
    }

    public onRuleEvent(id: string, eventName: string, listener: Function) {
        const that = this;

        const createEventHandler = (handler: Function, ruleId: string) => {
            return function (event: IEvent): Promise<any> {
                const urlsIgnored: Array<RegExp> = that.ignoredUrls.get(ruleId);

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
                    }, that._config.rulesTimeout || 120000);

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

    public fetchContent(target: string | url.Url, headers: object): Promise<INetworkData> {
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
    public report(ruleId: string, severity: Severity, sourceCode: string, location: IProblemLocation, message: string, resource: string) {
        const problem: IProblem = {
            location: location || { column: -1, line: -1 },
            message,
            resource,
            ruleId,
            severity,
            sourceCode
        };

        this.messages.push(problem);
    }

    public clean(fileUrl: url.Url) {
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

    /** Runs all the configured rules and plugins on a target */
    public async executeOn(target: url.Url): Promise<Array<IProblem>> {

        const start: number = Date.now();

        debug(`Starting the analysis on ${target.path}`);

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
