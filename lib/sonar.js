/**
 * @fileoverview Main Sonar object, gets the configuration and loads collectors, rules and analyzes.
 * @author Anton Molleda (@molant)
 */

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------
const EventEmitter = require('eventemitter2').EventEmitter2;

const debug = require('debug')('sonar:engine');

const validator = require('./config/config-validator'),
    resourceLoader = require('./util/resource-loader'),
    RuleContext = require('./rule-context');

// ------------------------------------------------------------------------------
// Typedefs
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Public interface
// ------------------------------------------------------------------------------

const create = (config) => {
    // Validates the config follows the righ schema
    if (!validator.validateConfig(config)) {
        throw new Error(`Configuration is not valid`);
    }

    const sonar = new EventEmitter({
        delimiter: '::',
        maxListeners: 0,
        wildcard: true
    });

    const messages = [];

    const api = {
        /**
         * Reports a message from one of the rules.
         * @param {string} ruleId The ID of the rule causing the message.
         * @param {number} severity The severity level of the rule as configured.
         * @param {ASTNode} node The AST node that the message relates to.
         * @param {Object=} location An object containing the error line and column
         *      numbers. If location is not provided the node's start location will
         *      be used.
         * @param {string} message The actual message.
         * @returns {void}
         */
        report(ruleId, severity, node, location, message) {
            const problem = {
                column: location.column + 1,
                line: location.line,
                message,
                ruleId,
                severity
            };

            messages.push(problem);
        }
    };

    if (config.plugins) {
        const plugins = resourceLoader.get(resourceLoader.TYPE.plugin, config);
        // TODO: validation for plugins?

        sonar.plugins = plugins.forEach((plugin) => {
            const init = plugin.create(config);

            Object.keys(init).forEach((eventName) => {
                sonar.on(eventName, init[eventName]);
            });
        });
    }

    if (config.rules) {
        const rules = resourceLoader.get(resourceLoader.TYPE.rule, config);
        // TODO: validate rules here

        sonar.rules = rules.forEach((rule, id) => {
            const context = new RuleContext(id, api, 1, config.rules[id], rule.meta);
            const init = rule.create(context);

            Object.keys(init).forEach((eventName) => {
                sonar.on(eventName, init[eventName]);
            });
        });
    }

    // TODO: find a cleaner way than accessing the first element to get the collector and its configuration
    resourceLoader.get(resourceLoader.TYPE.collector, config).forEach((collector, id) => {
        sonar.collector = collector(sonar, config.collector[id]);
    });

    /**
     * Reports a message from one of the rules.''
     * @param {string} ruleId The ID of the rule causing the message.
     * @param {number} severity The severity level of the rule as configured.
     * @param {ASTNode} node The AST node that the message relates to.
     * @param {Object=} location An object containing the error line and column
     *      numbers. If location is not provided the node's start location will
     *      be used.
     * @param {string} message The actual message.
     * @returns {void}
    */
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
