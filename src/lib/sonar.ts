/**
 * @fileoverview Main Sonar object, gets the configuration and loads
 * the collectors, rules and analyzes.
 */

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

import * as url from 'url';

import * as _ from 'lodash';
import * as browserslist from 'browserslist';
import * as chalk from 'chalk';
import { EventEmitter2 as EventEmitter } from 'eventemitter2';

import { loggerInitiator } from './utils/logging';
import { getSeverity } from './config/config-rules';
import { IAsyncHTMLElement, ICollector, ICollectorBuilder, IConfig, IEvent, IProblem, IProblemLocation, IRule, IRuleBuilder, IRuleConfigList, IPlugin, RuleConfig, Severity, URL } from './types'; // eslint-disable-line no-unused-vars
import * as resourceLoader from './utils/resource-loader';
import normalizeRules from './utils/normalize-rules';
import { RuleContext } from './rule-context';

const logger = loggerInitiator(__filename);

// ------------------------------------------------------------------------------
// Public interface
// ------------------------------------------------------------------------------

export class Sonar extends EventEmitter {
    // TODO: review which ones need to be private or not
    private plugins: Map<string, IPlugin>
    private rules: Map<string, IRule>
    private collector: ICollector
    private collectorId: string
    private collectorConfig: object
    private messages: Array<IProblem>
    private browsersList: Array<string> = [];
    private ignoredUrls: Map<string, Array<RegExp>>;
    private _formatter: string

    get pageDOM(): object {
        return this.collector.dom;
    }

    get pageContent(): Promise<string> {
        return this.collector.html;
    }

    get pageHeaders(): object {
        return this.collector.headers;
    }

    get targetedBrowsers(): Array<string> {
        return this.browsersList;
    }

    get formatter(): string {
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

    constructor(config: IConfig) {
        super({
            delimiter: '::',
            maxListeners: 0,
            wildcard: true
        });

        logger.debug('Initializing sonar engine');

        this.messages = [];

        logger.debug('Loading collector');

        if (!config.collector) {
            throw new Error(`Collector not found in the configuration`);
        }

        if (typeof config.collector === 'string') {
            this.collectorId = config.collector;
            this.collectorConfig = {};
        } else {
            this.collectorId = config.collector.name;
            this.collectorConfig = config.collector.options;
        }

        logger.debug('Loading supported browsers');
        if (config.browserslist) {
            this.browsersList = browserslist(config.browserslist);
        }

        logger.debug('Setting the selected formatter');
        this._formatter = config.formatter;

        logger.debug('Initializing ignored urls');
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

        const collectorBuillder: ICollectorBuilder = resourceLoader.loadCollector(this.collectorId);

        if (!collectorBuillder) {
            throw new Error(`Collector "${this.collectorId}" not found`);
        }

        this.collector = collectorBuillder(this, this.collectorConfig);
        this.initRules(config);
    }

    private initRules(config: IConfig) {
        logger.debug('Loading rules');
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

                        logger.debug(`Rule ${ruleId} timeout`);

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

        const ignoreCollector = (rule): boolean => {
            const ignoredCollectors: Array<string> = rule.meta.ignoredCollectors;

            if (!ignoredCollectors) {
                return false;
            }

            return ignoredCollectors.includes(this.collectorId);
        };

        rulesIds.forEach((id: string) => {
            const rule: IRuleBuilder = rules.get(id);

            const ruleOptions: RuleConfig | Array<RuleConfig> = config.rules[id];
            const ruleWorksWithLocalFiles: boolean = rule.meta.worksWithLocalFiles;
            const severity: Severity = getSeverity(ruleOptions);

            if (ignoreCollector(rule)) {
                logger.debug(`Rule "${id}" is disabled for the collector "${this.collectorId}"`);
                //TODO: I don't think we should have a dependency on logger here. Maybe send a warning event?
                logger.log(chalk.yellow(`Warning: The rule "${id}" will be ignored for the collector "${this.collectorId}"`));
            } else if (severity) {
                const context: RuleContext = new RuleContext(id, this, severity, ruleOptions, rule.meta);
                const instance: IRule = rule.create(context);

                Object.keys(instance).forEach((eventName: string) => {
                    this.on(eventName, createEventHandler(instance[eventName], ruleWorksWithLocalFiles, id));
                });

                this.rules.set(id, instance);
            } else {
                logger.debug(`Rule "${id}" is disabled`);
            }
        });

        logger.debug(`Rules loaded: ${this.rules.size}`);
    }

    public fetchContent(target: string | url.Url, headers: object) {
        return this.collector.fetchContent(target, headers);
    }

    public evaluate(source: string) {
        return this.collector.evaluate(source);
    }

    /** Releases any used resource and/or browser. */
    public async close() {
        await this.collector.close();
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

        logger.debug(`Starting the analysis on ${target.path}`);

        await this.collector.collect(target);

        logger.debug(`Total runtime ${Date.now() - start}`);

        return this.messages;
    }

    public querySelectorAll(selector: string): Promise<Array<IAsyncHTMLElement>> {
        return this.collector.querySelectorAll(selector);
    }

    emitAsync(event: string | Array<string>, ...values: Array<any>): Promise<Array<any>> {
        const ignoredUrls: Array<RegExp> = this.ignoredUrls.get('all');

        if (this.isIgnored(ignoredUrls, values[0].resource)) {
            return Promise.resolve([]);
        }

        return super.emitAsync(event, ...values);
    }
}
