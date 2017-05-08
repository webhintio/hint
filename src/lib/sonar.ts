/**
 * @fileoverview Main Sonar object, gets the configuration and loads
 * the collectors, rules and analyzes.
 */

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

import { EventEmitter2 as EventEmitter } from 'eventemitter2';
import * as url from 'url';

import * as _ from 'lodash';
import * as browserslist from 'browserslist';

import { debug as d } from './utils/debug';
import { getSeverity } from './config/config-rules';
import { IAsyncHTMLElement, ICollector, IElementFoundEvent, IFetchEndEvent, IProblem, IProblemLocation, IRule, IPlugin, Severity, URL } from './types'; // eslint-disable-line no-unused-vars
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
    private messages: Array<IProblem>
    private browsersList: Array<String> = [];
    private ignoredUrls: Map<string, RegExp[]>;

    get pageContent() {
        return this.collector.html;
    }

    get pageHeaders() {
        return this.collector.headers;
    }

    get targetedBrowsers() {
        return this.browsersList;
    }

    private isIgnored(urls: RegExp[], resource: string) {
        if (!urls) {
            return false;
        }

        return urls.some((urlIgnored) => {
            return urlIgnored.test(resource);
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

        debug('Loading supported browsers');
        if (config.browserslist) {
            this.browsersList = browserslist(config.browserslist);
        }

        debug('Initializing ignored urls');
        this.ignoredUrls = new Map();
        if (config.ignoredUrls) {
            _.forEach(config.ignoredUrls, (rules, urlRegexString) => {
                rules.forEach((rule) => {
                    const ruleName = rule === '*' ? 'all' : rule;

                    const urlsInRule = this.ignoredUrls.get(ruleName);
                    const urlRegex = new RegExp(urlRegexString, 'i');

                    if (!urlsInRule) {
                        this.ignoredUrls.set(ruleName, [urlRegex]);
                    } else {
                        urlsInRule.push(urlRegex);
                    }
                });
            });
        }

        debug('Loading plugins');
        this.plugins = new Map();
        if (config.plugins) {

            const plugins = resourceLoader.getPlugins();

            config.plugins.forEach((id: string) => {
                const plugin = plugins.get(id);

                const instance = plugin.create(config);

                Object.keys(instance).forEach((eventName) => {
                    this.on(eventName, instance[eventName]);
                });

                this.plugins.set(id, instance);
            });

            debug(`Plugins loaded: ${this.plugins.size}`);
        }

        debug('Loading rules');
        this.rules = new Map();
        if (config.rules) {

            const rules = resourceLoader.getRules();
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

                    return handler(event);
                };
            };

            rulesIds.forEach((id: string) => {
                const rule = rules.get(id);

                const ruleOptions = config.rules[id];
                const ruleWorksWithLocalFiles = rule.meta.worksWithLocalFiles;

                const context = new RuleContext(id, this, getSeverity(ruleOptions), ruleOptions, rule.meta);
                const instance = rule.create(context);

                Object.keys(instance).forEach((eventName) => {
                    this.on(eventName, createEventHandler(instance[eventName], ruleWorksWithLocalFiles, id));
                });

                this.rules.set(id, instance);
            });

            debug(`Rules loaded: ${this.rules.size}`);
        }
    }

    async init(config) {
        debug('Loading collector');

        let collectorId;
        let collectorConfig;

        if (typeof config.collector === 'string') {
            collectorId = config.collector;
            collectorConfig = {};
        } else {
            collectorId = config.collector.name;
            collectorConfig = config.collector.options;
        }

        const collectors = resourceLoader.getCollectors();

        if (!collectors.has(collectorId)) {
            throw new Error(`Collector "${collectorId}" not found`);
        }

        this.collector = await collectors.get(collectorId)(this, collectorConfig);
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
    public report(ruleId: string, severity: Severity, node, location: IProblemLocation, message: string, resource: string) {
        const problem = {
            column: location && location.column || -1,
            line: location && location.line || -1,
            message,
            resource,
            ruleId,
            severity
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

export const create = async (config): Promise<Sonar> => {
    const sonar = new Sonar(config);

    await sonar.init(config);

    return sonar;
};
