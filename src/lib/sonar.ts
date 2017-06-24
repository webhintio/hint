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
import * as minimatch from 'minimatch';
import { EventEmitter2 as EventEmitter } from 'eventemitter2';

import { debug as d } from './utils/debug';
import { getSeverity } from './config/config-rules';
import { IAsyncHTMLElement, ICollector, IProblem, IProblemLocation, IRule, IPlugin, Severity, URL } from './types'; // eslint-disable-line no-unused-vars
import * as logger from './utils/logging';
import * as resourceLoader from './utils/resource-loader';
import { RuleContext } from './rule-context';

const debug = d(__filename);

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
    private browsersList: Array<String> = [];
    private ignoredUrls: Map<string, string[]>;
    private _formatter: string

    get pageDOM() {
        return this.collector.dom;
    }

    get pageContent(): Promise<string> {
        return this.collector.html;
    }

    get pageHeaders() {
        return this.collector.headers;
    }

    get targetedBrowsers() {
        return this.browsersList;
    }

    get formatter() {
        return this._formatter;
    }

    private isIgnored(urls: string[], resource: string) {
        if (!urls) {
            return false;
        }

        return urls.some((urlIgnored) => {
            return minimatch(resource, urlIgnored);
        });
    }

    constructor(config) {
        super({
            delimiter: '::',
            maxListeners: 0,
            wildcard: true
        });

        debug('Initializing sonar engine');

        this.messages = [];

        debug('Loading collector');

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

        debug('Loading supported browsers');
        if (config.browserslist) {
            this.browsersList = browserslist(config.browserslist);
        }

        debug('Setting the selected formatter');
        this._formatter = config.formatter;

        debug('Initializing ignored urls');
        this.ignoredUrls = new Map();
        if (config.ignoredUrls) {
            _.forEach(config.ignoredUrls, (rules, urlGlobPattern) => {
                rules.forEach((rule) => {
                    const ruleName = rule === '*' ? 'all' : rule;

                    const urlsInRule = this.ignoredUrls.get(ruleName);

                    if (!urlsInRule) {
                        this.ignoredUrls.set(ruleName, [urlGlobPattern]);
                    } else {
                        urlsInRule.push(urlGlobPattern);
                    }
                });
            });
        }

        const collectorBuillder = resourceLoader.loadCollector(this.collectorId);

        if (!collectorBuillder) {
            throw new Error(`Collector "${this.collectorId}" not found`);
        }

        this.collector = collectorBuillder(this, this.collectorConfig);
        this.initRules(config);
    }

    private initRules(config) {
        debug('Loading rules');
        this.rules = new Map();
        if (!config.rules) {
            return;
        }

        const rules = resourceLoader.loadRules(config.rules);
        const rulesIds = Object.keys(config.rules);

        const createEventHandler = (handler: Function, worksWithLocalFiles: boolean, ruleId: string) => {
            return (event) => {
                const localResource = url.parse(event.resource).protocol === 'file:';
                const urlsIgnored = this.ignoredUrls.get(ruleId);

                // Some rules don't work with local resource,
                // so it doesn't make sense to the event.

                if ((localResource && !worksWithLocalFiles) || this.isIgnored(urlsIgnored, event.resource)) {
                    return null;
                }

                // If a rule is spending a lot of time to finish we should ignore it.

                return new Promise((resolve) => {
                    let immediateId;

                    const timeoutId = setTimeout(() => {
                        if (immediateId) {
                            clearImmediate(immediateId);
                            immediateId = null;
                        }

                        debug(`Rule ${ruleId} timeout`);

                        resolve(null);
                    }, config.rulesTimeout || 120000);

                    immediateId = setImmediate(async () => {
                        const result = await handler(event);

                        if (timeoutId) {
                            clearTimeout(timeoutId);
                        }

                        resolve(result);
                    });
                });
            };
        };

        const ignoreCollector = (rule) => {
            const ignoredCollectors = rule.meta.ignoredCollectors;

            if (!ignoredCollectors) {
                return false;
            }

            return ignoredCollectors.includes(this.collectorId);
        };

        rulesIds.forEach((id: string) => {
            const rule = rules.get(id);

            const ruleOptions = config.rules[id];
            const ruleWorksWithLocalFiles = rule.meta.worksWithLocalFiles;
            const severity = getSeverity(ruleOptions);

            if (ignoreCollector(rule)) {
                debug(`Rule "${id}" is disabled for the collector "${this.collectorId}"`);
                //TODO: I don't think we should have a dependency on logger here. Maybe send a warning event?
                logger.log(chalk.yellow(`Warning: The rule "${id}" will be ignored for the collector "${this.collectorId}"`));
            } else if (severity) {
                const context = new RuleContext(id, this, severity, ruleOptions, rule.meta);
                const instance = rule.create(context);

                Object.keys(instance).forEach((eventName) => {
                    this.on(eventName, createEventHandler(instance[eventName], ruleWorksWithLocalFiles, id));
                });

                this.rules.set(id, instance);
            } else {
                debug(`Rule "${id}" is disabled`);
            }
        });

        debug(`Rules loaded: ${this.rules.size}`);
    }

    public fetchContent(target, headers) {
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
    public async executeOn(target: URL): Promise<Array<IProblem>> {

        const start = Date.now();

        debug(`Starting the analysis on ${target.path}`);

        await this.collector.collect(target);

        debug(`Total runtime ${Date.now() - start}`);

        return this.messages;
    }

    public querySelectorAll(selector: string): Promise<IAsyncHTMLElement[]> {
        return this.collector.querySelectorAll(selector);
    }

    emitAsync(event: string | string[], ...values: any[]): Promise<any[]> {
        const ignoredUrls = this.ignoredUrls.get('all');

        if (this.isIgnored(ignoredUrls, values[0].resource)) {
            return Promise.resolve([]);
        }

        return super.emitAsync(event, ...values);
    }
}
