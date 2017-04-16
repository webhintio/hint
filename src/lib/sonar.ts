/**
 * @fileoverview Main Sonar object, gets the configuration and loads collectors, rules and analyzes.
 * @author Anton Molleda (@molant)
 */

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

import { EventEmitter2 as EventEmitter } from 'eventemitter2';

import * as resourceLoader from './utils/resource-loader';
import { ICollector, IElementFoundEvent, IFetchEndEvent, IProblem, IProblemLocation, IRule, Severity, URL } from './interfaces'; // eslint-disable-line no-unused-vars
import { RuleContext } from './rule-context';
import { debug as d } from './utils/debug';
import { getSeverity } from './config/config-rules';

const debug = d(__filename);

// ------------------------------------------------------------------------------
// Public interface
// ------------------------------------------------------------------------------

export class Sonar extends EventEmitter {
    // TODO: review which ones need to be private or not
    private plugins: Map<string, Plugin>
    private rules: Map<string, IRule>
    private collector: ICollector
    private messages: Array<IProblem>

    get pageContent() {
        return this.collector.html;
    }

    get pageHeaders() {
        return this.collector.headers;
    }

    fetchContent(target, headers) {
        return this.collector.fetchContent(target, headers);
    }

    constructor(config) {

        super({
            delimiter: '::',
            maxListeners: 0,
            wildcard: true
        });

        debug('Initializing sonar engine');

        this.messages = [];

        debug('Loading plugins');
        this.plugins = new Map();
        if (config.plugins) {

            const plugins = resourceLoader.getPlugins();

            plugins.forEach((plugin) => {
                const instance = plugin[1].create(config);

                Object.keys(instance).forEach((eventName) => {
                    this.on(eventName, instance[eventName]);
                });

                this.plugins.set(plugin[0], instance);
            });

            debug(`Plugins loaded: ${this.plugins.size}`);

        }

        debug('Loading rules');
        this.rules = new Map();
        if (config.rules) {

            const rules = resourceLoader.getRules();
            const rulesIds = Object.keys(config.rules);

            rulesIds.forEach((id: string) => {

                const rule = rules.get(id);
                const ruleOptions = config.rules[id];

                const context = new RuleContext(id, this, getSeverity(ruleOptions), ruleOptions, rule.meta);
                const instance = rule.create(context);

                Object.keys(instance).forEach((eventName) => {
                    this.on(eventName, instance[eventName]);
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

    /** Reports a message from one of the rules. */
    report(ruleId: string, severity: Severity, node, location: IProblemLocation, message: string, resource: string) {
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

    // async emitAysnc(eventName: string, data: ElementFoundEvent | FetchEndEvent) {
    //     super.emitAsync(eventName, data);
    // }

    /** Runs all the configured rules and plugins on a target */
    async executeOn(target: URL): Promise<Array<IProblem>> {

        const start = Date.now();

        debug(`Starting the analysis on ${target.path}`);

        try {
            await this.collector.collect(target);
        } catch (e) {
            return Promise.reject(e);
        }

        debug(`Total runtime ${Date.now() - start}`);

        return this.messages;

    }
}

export const create = async (config): Promise<Sonar> => {
    const sonar = new Sonar(config);

    await sonar.init(config);

    return sonar;
};
