/**
 * @fileoverview Main Sonar object, gets the configuration and loads collectors, rules and analyzes.
 * @author Anton Molleda (@molant)
 */

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------
import { EventEmitter2 as EventEmitter } from 'eventemitter2';
import * as _ from 'lodash';

const debug = require('debug')('sonar:engine');

import * as resourceLoader from './util/resource-loader';
import { getSeverity } from './config/config-rules';
import { Plugin, Rule, Collector, Problem, Severity, Location } from './types'
import { RuleContext } from './rule-context';

// import {RuleContext as RuleContext} from './rule-context';

// ------------------------------------------------------------------------------
// Public interface
// ------------------------------------------------------------------------------

export class Sonar extends EventEmitter {
    private plugins: Map<string, Plugin>
    private rules: Map<string, Rule>
    private collector: Collector
    private messages: Array<Problem>

    constructor(config) {
        super({
            delimiter: '::',
            maxListeners: 0,
            wildcard: true
        });

        this.messages = [];

        this.plugins = new Map();
        if (config.plugins) {
            const plugins = resourceLoader.getPlugins();

            for (const plugin of plugins) {
                const instance = plugin[1].create(config);

                Object.keys(instance).forEach((eventName) => {
                    this.on(eventName, instance[eventName]);
                });
                this.plugins.set(plugin[0], instance);
            }
        }

        this.rules = new Map();
        if (config.rules) {
            const rules = resourceLoader.getRules();

            _.filter(config.rules, (ruleOptions, id: string) => {
                const rule = rules.get(id);

                const context = new RuleContext(id, this, getSeverity(ruleOptions), ruleOptions, rule.meta);
                const instance = rule.create(context);

                Object.keys(instance).forEach((eventName) => {
                    this.on(eventName, instance[eventName]);
                });

                this.rules.set(id, instance);
            });
        }

        let collectorId,
            collectorConfig;

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

        this.collector = collectors.get(collectorId)(this, collectorConfig);
    }

    /** Reports a message from one of the rules. */
    report(ruleId: string, severity: Severity, node, location: Location, message: string, resource: string, meta) {
        const problem = {
            column: location.column + 1,
            line: location.line,
            message,
            resource,
            ruleId,
            severity
        };

        this.messages.push(problem);
    }

    /** Runs all the configured rules and plugins on a target */
    async executeOn(target: string): Promise<Array<Problem>> {
        const start = Date.now();

        debug(`Starting the analysis on ${target}`);

        await this.collector.collect(target);
        debug(`Total runtime ${Date.now() - start}`);

        return this.messages;
    };
}

export const create = (config): Sonar => {
    const sonar = new Sonar(config);
    return sonar;
}
