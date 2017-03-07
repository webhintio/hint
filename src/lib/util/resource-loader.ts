/**
 * @fileoverview Locates and requires resources (collectors, plugins, rules, formatters)
 * for Sonar across different places in the tree.
 * By convention, these resources need to be under
 * {/, /node_modules/}lib/{collectors, formatters, plugins, rules}/*.js
 * @author Anton Molleda (@molant)
 *
 */

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

import * as path from 'path';
import * as _ from 'lodash';
import * as globby from 'globby';
import {Resource, CollectorBuilder, Formatter, RuleBuilder, PluginBuilder} from '../types';

const debug = require('debug')('sonar:util:resource-loader');

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

/** Returns the resources for a given type. */
const get = (type: string): (() => Map<string, any>) => {
    return () => {
        return resources[type];
    };
}

// ------------------------------------------------------------------------------
// Public
// ------------------------------------------------------------------------------

/** Returns all the available Collectors */
export const getCollectors: () => Map<string, CollectorBuilder> = get(TYPE.collector);
/** Returns all the available Formatters */
export const getFormatters: () => Map<string, Formatter> = get(TYPE.formatter);
/** Returns all the available Rules */
export const getRules: () => Map<string, RuleBuilder> = get(TYPE.rule);
/** Returns all the available Plugins */
export const getPlugins: () => Map<string, PluginBuilder> = get(TYPE.plugin);
