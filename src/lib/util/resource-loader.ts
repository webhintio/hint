/**
 * @fileoverview Locates and requires resources (collectors, plugins, rules, formatters) for Sonar across different places in the tree.
 * By convention, these resources need to be under {/, /node_modules/}lib/{collectors, formatters, plugins, rules}/*.js
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

// ------------------------------------------------------------------------------
// Interfaces
// ------------------------------------------------------------------------------

/** A rule to be used with Sonar */
interface Rule {
    /** Creates an instance of the rule.
     * @returns {Object} The instance of the rule with
     */
    create(config: Object);
    /** The metadata associated to the rule (docs, schema, etc.) */
    meta: Object;
}

/** A collector to be used by Sonar */
interface Collector {
    /** Collects all the information for the given target */
    collect(target: string): Promise<Array<Object>>;
}

/** A format function that will output the results obtained by Sonar */
interface Formatter {
    ({ })
}

/** A plugin to expand the collector's functionality */
interface Plugin { }

/** A resource required by Sonar: Collector, Formatter, Plugin, Rule,  */
type Resource = Collector | Formatter | Plugin | Rule;


/** The type of resource */
const TYPE = {
    collector: 'collector',
    formatter: 'formatter',
    plugin: 'plugin',
    rule: 'rule'
};

/** Loads all the resources available for the given type */
const loadOfType = (type: string): Map<string, Resource> => {

    const resourceFiles: string[] = globby.sync(`{./,./node_modules/sonar-*}lib/${type}s/*.js`,
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

/** Loads all the resources for a given configuration. */
const get = (type: string): (() => Map<string, any>) => {
    return () => {
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
}

/** Returns all the Collectors found */
export const getCollectors: () => Map<string, Collector> = get(TYPE.collector);
/** Returns all the Formatters found */
export const getFormatters: () => Map<string, Formatter> = get(TYPE.formatter);
/** Returns all the Rules found */
export const getRules: () => Map<string, Rule> = get(TYPE.rule);
/** Returns all the Plugins found */
export const getPlugins: () => Map<string, Plugin> = get(TYPE.plugin);
