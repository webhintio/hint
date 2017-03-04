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

import {Resource, CollectorBuilder, Formatter, RuleBuilder, PluginBuilder} from '../types';

// ------------------------------------------------------------------------------
// Interfaces
// ------------------------------------------------------------------------------

/** The type of resource */
const TYPE = {
    collector: 'collector',
    formatter: 'formatter',
    plugin: 'plugin',
    rule: 'rule'
};

/** Loads all the resources available for the given type */
const loadOfType = (type: string): Map<string, Resource> => {

    const resourceFiles: string[] = globby.sync(`{./,./node_modules/sonar-*}dist/lib/${type}s/*.js`,
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
        // TODO: This should be taken care of by typescript somehow
        const isValidType = _.find(TYPE, (validType) => {
            return validType === type;
        });

        if (!isValidType) {
            throw new Error(`Invalid type ${type}. It can only be ${Object.keys(TYPE).join(', ')}`);
        }

        return resources[type];
    };
}

/** Returns all the Collectors found */
export const getCollectors: () => Map<string, CollectorBuilder> = get(TYPE.collector);
/** Returns all the Formatters found */
export const getFormatters: () => Map<string, Formatter> = get(TYPE.formatter);
/** Returns all the Rules found */
export const getRules: () => Map<string, RuleBuilder> = get(TYPE.rule);
/** Returns all the Plugins found */
export const getPlugins: () => Map<string, PluginBuilder> = get(TYPE.plugin);
