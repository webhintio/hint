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

const loadOfType = (type) => {
    const resourceFiles = globby.sync(`{./,./node_modules/sonar-*}lib/${type}s/*.js`,
        { absolute: true });

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

    return resourcesOfType;
};

const resources = Object.freeze(_.reduce(TYPE, (acum, value, key) => {
    acum[key] = loadOfType(value);

    return acum;
}, {}));

// ------------------------------------------------------------------------------
// Public interface
// ------------------------------------------------------------------------------

/**
 * Loads all the resources for a given configuration.
 * @param {TYPE} type The type of resource to load (collectors, formatters, plugins, rules)
 * @return {Set|Object} The set with all the resources loaded for the given type
 */
const get = (type) => {
    const isValidType = _.find(TYPE, (validType) => {
        return validType === type;
    });

    if (!isValidType) {
        throw new Error(`Invalid type ${type}. It can only be ${Object.keys(TYPE).join(', ')}`);
    }

    // Don't really like how we do this. There should be a cleaner way
    if (type === TYPE.collector) {
        for (const collector of resources[type]) {
            return collector[1];
        }
    }

    return resources[type];
};


module.exports = {
    TYPE,
    get
};
