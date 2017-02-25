/**
 * @fileoverview Locates and requires resources (collectors, plugins, rules, formatters) for Sonar across different places in the tree.
 * By convention, these resources need to be under {/,/node_modules/}lib/{collectors,formatters,plugins,rules}/*.js
 * @author Anton Molleda (@molant)
 *
 */

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

const path = require('path');
const _ = require('lodash'),
    globby = require('globby');
const debug = require('debug')('sonar:util:resource-loader');

/**
 * The type of resource
 * @readonly
 * @enum {string}
 */
const TYPE = {
    collector: 'collector',
    formatter: 'formatter',
    plugin: 'plugin',
    rule: 'rule'
};

const resources = _.reduce(TYPE, (map, type) => {
    const resourceFiles = globby.sync(`{./,./node_modules/sonar-*}lib/${type}s/*.js`,
        {absolute: true});

    debug(`${resourceFiles.length} ${type} found`);

    const resourcesOfType = resourceFiles.reduce((resourceMap, resource) => {
        debug(`Loading ${resource}`);
        const name = path.basename(resource, '.js');

        if (!resourceMap.has(name)) {
            resourceMap.set(name, require(resource));
        } else {
            throw new Error(`Failed to add resource ${name} from ${resource}. It already exists.`);
        }

        return resourceMap;
    }, new Map());

    map.set(type, resourcesOfType || new Map());

    return map;
}, new Map());

// ------------------------------------------------------------------------------
// Public interface
// ------------------------------------------------------------------------------

/**
 * Loads all the resources available for a given resource type in all the project tree.
 * @param {TYPE} type The type of resource to load (collectors, formatters, plugins, rules)
 * @return {Set} The set with all the resources loaded for the given type
 */
const getAll = (type) => {
    const isValidType = _.find(TYPE, (validType) => {
        return validType === type;
    });

    if (!isValidType) {
        throw new Error(`Invalid type ${type}. It can only be ${Object.keys(TYPE).join(', ')}`);
    }

    return resources.get(type);
};

/**
 * Loads all the resources for a given configuration.
 * @param {TYPE} type The type of resource to load (collectors, formatters, plugins, rules)
 * @param {Object|string} configuration The configuration for that type of resource(s)
 * @return {Set|Object} The set with all the resources loaded for the given type
 */
const get = (type, allConfig) => {
    const loadedResources = getAll(type);

    const config = allConfig[type] || allConfig[`${type}s`];

    if (!config) {
        debug(`Missing configuration for ${type}`);
        throw new Error(`You need to provide a configuration to load the resource ${type}`);
    }

    // This case is for formatters and collectors without config
    if (typeof config === 'string') {
        const resourceName = config;
        const resource = loadedResources.get(config);

        if (!resource) {
            throw new Error(`${type} ${resourceName} can't be found.`);
        }

        return resource;
    }

    // This case is for rules (an object with configuration), and plugins (an array of strings)
    // We just want the name of the rule or plugin, the config (if any) should be validated elsewhere
    const list = Array.isArray(config) ? config : Object.keys(config);
    const configuredResources = list.reduce((filteredResources, resourceName) => {
        if (loadedResources.has(resourceName)) {
            filteredResources.set(resourceName, loadedResources.get(resourceName));
        } else {
            throw new Error(`${type}: ${resourceName} can't be found.`);
        }

        return filteredResources;
    }, new Map());

    return configuredResources;
};

module.exports = {
    TYPE,
    get,
    getAll
};
