/**
 * @fileoverview Main Sonar object, gets the configuration and loads
 * the connectors, rules and analyzes.
 */

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

import * as url from 'url';

import * as _ from 'lodash';
import * as browserslist from 'browserslist';
import * as chalk from 'chalk';
import { EventEmitter2 as EventEmitter } from 'eventemitter2';

import { debug as d } from './utils/debug';
import { getSeverity } from './config/config-rules';
import { IAsyncHTMLElement, IConnector, IConnectorBuilder, IConfig, IEvent, IProblem, IProblemLocation, IRule, IRuleBuilder, IRuleConfigList, IPlugin, RuleConfig, Severity, URL } from './types'; // eslint-disable-line no-unused-vars
import * as logger from './utils/logging';
import * as resourceLoader from './utils/resource-loader';
import normalizeRules from './utils/normalize-rules';
import { RuleContext } from './rule-context';

const debug: debug.IDebugger = d(__filename);

// ------------------------------------------------------------------------------
// Public interface
// ------------------------------------------------------------------------------

export class Sonar extends EventEmitter {
    // TODO: review which ones need to be private or not
    private plugins: Map<string, IPlugin>
    private rules: Map<string, IRule>
    private connector: IConnector
    private connectorId: string
    private connectorConfig: object
    private messages: Array<IProblem>
    private browsersList: Array<string> = [];
    private ignoredUrls: Map<string, Array<RegExp>>;
    private _formatter: string

    public get pageDOM(): object {
        return this.connector.dom;
    }

    public get pageContent(): Promise<string> {
        return this.connector.html;
    }

    public get pageHeaders(): object {
        return this.connector.headers;
    }

    public get targetedBrowsers(): Array<string> {
        return this.browsersList;
    }

    public get formatter(): string {
        return this._formatter;
    }

    private isIgnored(urls: Array<RegExp>, resource: string): boolean {
        if (!urls) {
            return false;
        }

        return urls.some((urlIgnored: RegExp) => {
            return urlIgnored.test(resource);
        });
    }

    public constructor(config: IConfig) {
        super({
            delimiter: '::',
            maxListeners: 0,
            wildcard: true
        });

        debug('Initializing sonar engine');

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

        debug('Loading supported browsers');
        if (config.browserslist) {
            this.browsersList = browserslist(config.browserslist);
        }

        debug('Setting the selected formatter');
        this._formatter = config.formatter;

        debug('Initializing ignored urls');
        this.ignoredUrls = new Map();
        if (config.ignoredUrls) {
            _.forEach(config.ignoredUrls, (rules: Array<string>, urlRegexString: string) => {
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

        const connectorBuillder: IConnectorBuilder = resourceLoader.loadConnector(this.connectorId);

        if (!connectorBuillder) {
            throw new Error(`Connector "${this.connectorId}" not found`);
        }

        this.connector = connectorBuillder(this, this.connectorConfig);
        this.initRules(config);
    }

    private initRules(config: IConfig) {
        debug('Loading rules');
        this.rules = new Map();
        if (!config.rules) {
            return;
        }

        config.rules = normalizeRules(config.rules);

        const rules: Map<string, IRuleBuilder> = resourceLoader.loadRules(config.rules);
        const rulesIds: Array<string> = Object.keys(config.rules);

        const createEventHandler = (handler: Function, worksWithLocalFiles: boolean, ruleId: string) => {
            return (event: IEvent): Promise<any> => {
                const localResource: boolean = url.parse(event.resource).protocol === 'file:';
                const urlsIgnored: Array<RegExp> = this.ignoredUrls.get(ruleId);

                // Some rules don't work with local resource,
                // so it doesn't make sense to the event.

                if ((localResource && !worksWithLocalFiles) || this.isIgnored(urlsIgnored, event.resource)) {
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
                    }, config.rulesTimeout || 120000);

                    immediateId = setImmediate(async () => {
                        const result: any = await handler(event);

                        if (timeoutId) {
                            clearTimeout(timeoutId);
                        }

                        resolve(result);
                    });
                });
            };
        };

        const ignoreConnector = (rule): boolean => {
            const ignoredConnectors: Array<string> = rule.meta.ignoredConnectors;

            if (!ignoredConnectors) {
                return false;
            }

            return ignoredConnectors.includes(this.connectorId);
        };

        rulesIds.forEach((id: string) => {
            const rule: IRuleBuilder = rules.get(id);

            const ruleOptions: RuleConfig | Array<RuleConfig> = config.rules[id];
            const ruleWorksWithLocalFiles: boolean = rule.meta.worksWithLocalFiles;
            const severity: Severity = getSeverity(ruleOptions);

            if (ignoreConnector(rule)) {
                debug(`Rule "${id}" is disabled for the connector "${this.connectorId}"`);
                // TODO: I don't think we should have a dependency on logger here. Maybe send a warning event?
                logger.log(chalk.yellow(`Warning: The rule "${id}" will be ignored for the connector "${this.connectorId}"`));
            } else if (severity) {
                const context: RuleContext = new RuleContext(id, this, severity, ruleOptions, rule.meta);
                const instance: IRule = rule.create(context);

                Object.keys(instance).forEach((eventName: string) => {
                    this.on(eventName, createEventHandler(instance[eventName], ruleWorksWithLocalFiles, id));
                });

                this.rules.set(id, instance);
            } else {
                debug(`Rule "${id}" is disabled`);
            }
        });

        debug(`Rules loaded: ${this.rules.size}`);
    }

    public fetchContent(target: string | url.Url, headers: object) {
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
