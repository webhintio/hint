/**
 * @fileoverview Locates and requires resources (collectors, plugins, rules, formatters) for Sonar across different places in the tree.
 * By convention, these resources need to be under {/,/node_modules/}lib/{collectors,formatters,plugins,rules}/*.js
 * @author Anton Molleda (@molant)
 *
 */

const path = require('path'),
    _ = require('lodash'),
    debug = require('debug')('sonar:util:resource-loader'),
    globby = require('globby');


/**
 * @enum {string}
 */
const TYPE = {
    collectors: 'collectors',
    formatters: 'formatters',
    plugins: 'plugins',
    rules: 'rules'
};

const resources = _.reduce(TYPE, (map, type) => {
    const resourceFiles = globby.sync(`{./,./node_modules/sonar-*}lib/${type}/*.js`,
        {
            absolute: true
        });
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


/*
    Public interface
 */

/**
 * @description Loads all the resources available for a given resource type in all the project tree.
 * @param {TYPE} type The type of resource to load (collectors, formatters, plugins, rules)
 * @return {Set} The set with all the resources loaded for the given type
 */
const get = (type) => {
    const isValidType = _.find(TYPE, validType => validType === type);
    if (!isValidType) {
        throw new Error(`Invalid type ${type}. It can only be ${Object.keys(TYPE).join(', ')}`);
    }

    return resources.get(type);
};

module.exports = {
    TYPE,
    get
};
