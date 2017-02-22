/**
 * @fileoverview Main Sonar object, gets the configuration and loads collectors, rules and analyzes.
 * @author Anton Molleda (molant)
 */

const debug = require('debug')('sonar:engine');
const validator = require('./config/config-validator'),
    resourceLoader = require('./util/resource-loader'),
    RuleContext = require('./rule-context'),
    EventEmitter = require('eventemitter2').EventEmitter2;

function initialize(config) {
    function filterResources(type) {
        const loadedResources = resourceLoader.get(type);

        if (!config[type]) {
            // We create an empty map if the optional property doesn't exist (plugins)
            return new Map();
        }

        // This case is for collectors
        if (typeof config[type] === 'string') {
            const resourceName = config[type];
            const resource = loadedResources.get(config[type]);
            if (!resource) {
                throw new Error(`${type} ${resourceName} can't be found.`);
            }
            return resource;
        }

        // This case is for rules (an object with configuration), and plugins (an array of strings)
        // We just want the name of the rule or plugin, the config (if any) should be validated elsewhere
        const list = Array.isArray(config[type]) ? config[type] : Object.keys(config[type]);
        const configuredResources = list.reduce((resources, resourceName) => {
            if (loadedResources.has(resourceName)) {
                resources.set(resourceName, loadedResources.get(resourceName));
            } else {
                throw new Error(`${type}: ${resourceName} can't be found.`);
            }
            return resources;
        }, new Map());

        return configuredResources;
    }

    // Validates the config follows the righ schema
    if (!validator.validateConfig(config)) {
        throw new Error(`Configuration is not valid`);
    }

    const sonar = new EventEmitter({
        wildcard: true,
        delimiter: '::',
        maxListeners: 0
    });

    const messages = [];

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
    const api = {
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
        // Validation for plugins?
        const plugins = filterResources(resourceLoader.TYPE.plugins);

        sonar.plugins = plugins.forEach((plugin) => {
            const init = plugin.create(config);
            Object.keys(init).forEach((eventName) => {
                sonar.on(eventName, init[eventName]);
            });
        });
    }

    if (config.rules) {
        const rules = filterResources(resourceLoader.TYPE.rules);
        // Validate rules here

        sonar.rules = rules.forEach((rule, id) => {
            // TODO: pass context here (report, special properties/methods of collector, rule settings, severity)
            const context = new RuleContext(id, api, 1, config.rules[id], rule.meta);
            const init = rule.create(context);
            Object.keys(init).forEach((eventName) => {
                sonar.on(eventName, init[eventName]);
            });
        });
    }

    sonar.collector = require('./collectors/jsdom')(sonar); // TODO: this is a hack, find way to get it from config
    // TODO: collector should receive the server .on at least (or maybe the context?)

    sonar.executeOn = async (target) => {
        const start = Date.now();
        debug(`Starting the analysis on ${target}`);
        return sonar.collector.collect(target)
            .then(() => {
                debug(`Total runtime ${Date.now() - start}`);
                return messages;
            });
    };

    return sonar;
}

module.exports = initialize;
