/**
 * @fileoverview Main Sonar object, gets the configuration and loads collectors, rules and analyzes.
 * @author Anton Molleda (@molant)
 */

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------
const EventEmitter = require('eventemitter2').EventEmitter2;
const _ = require('lodash');
const debug = require('debug')('sonar:engine');

const resourceLoader = require('./util/resource-loader'),
    RuleContext = require('./rule-context');

// ------------------------------------------------------------------------------
// Typedefs
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Public interface
// ------------------------------------------------------------------------------

const create = (config) => {
    // The configuration needs to be valid at this point
    const sonar = new EventEmitter({
        delimiter: '::',
        maxListeners: 0,
        wildcard: true
    });

    const messages = [];

    const api = {
        /**
         * Reports a message from one of the rules.''
         * @param {string} ruleId The ID of the rule causing the message.
         * @param {number} severity The severity level of the rule as configured.
         * @param {ASTNode} node The AST node that the message relates to.
         * @param {Object=} location An object containing the error line and column
         *      numbers. If location is not provided the node's start location will
         *      be used.
         * @param {string} message The actual message.
         * @param {string} resource Resource where the rule was executed
         * @returns {void}
         */
        report(ruleId, severity, node, location, message, resource) {
            const problem = {
                column: location.column + 1,
                line: location.line,
                message,
                resource,
                ruleId,
                severity
            };

            messages.push(problem);
        }
    };

    if (config.plugins) {
        const plugins = resourceLoader.get(resourceLoader.TYPE.plugin, config);

        sonar.plugins = plugins.forEach((plugin) => {
            const init = plugin.create(config);

            Object.keys(init).forEach((eventName) => {
                sonar.on(eventName, init[eventName]);
            });
        });
    }

    if (config.rules) {
        const rules = resourceLoader.get(resourceLoader.TYPE.rule);

        sonar.rules = _.filter(config.rules, (ruleOptions, id) => {
            const rule = rules.get(id);

            const context = new RuleContext(id, api, 1, ruleOptions, rule.meta);
            const init = rule.create(context);

            Object.keys(init).forEach((eventName) => {
                sonar.on(eventName, init[eventName]);
            });

            return init;
        });
    }

    const collector = resourceLoader.get(resourceLoader.TYPE.collector);
    const collectorOptions = typeof config.collector === 'object' ? config.collector.options : {};

    sonar.collector = collector(sonar, collectorOptions);

    sonar.executeOn = async (target) => {
        const start = Date.now();

        debug(`Starting the analysis on ${target}`);

        await sonar.collector.collect(target);
        debug(`Total runtime ${Date.now() - start}`);

        return messages;
    };

    return sonar;
};

module.exports = { create };
