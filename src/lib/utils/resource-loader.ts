/**
 * @fileoverview Locates and requires resources (collectors, plugins, rules, formatters)
 * for Sonar across different places in the tree.
 * By convention, these resources need to be under
 * {/, /node_modules/}lib/{collectors, formatters, plugins, rules}/*.js
 */

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

import * as path from 'path';

import * as globby from 'globby';

import { findPackageRoot } from './misc';
import { debug as d } from './debug';
import { ICollectorBuilder, IFormatter, IPluginBuilder, Resource, IRuleBuilder } from '../types'; // eslint-disable-line no-unused-vars
import { validate as validateRule } from '../config/config-rules';


const debug = d(__filename);
const PROJECT_ROOT = findPackageRoot();

/** Cache of resource builders, indexex by resource Id. */
const resources = new Map<string, Resource>();

/** Cache of resources ids. */
const resourceIds = new Map<string, Array<string>>();

/** The type of resource */
export const TYPE = {
    collector: 'collector',
    formatter: 'formatter',
    rule: 'rule'
};

/** Returns a list with the ids of all the core resources of the given `type`. */
const getCoreResources = (type: string): Array<string> => {
    if (resourceIds.has(type)) {
        return resourceIds.get(type);
    }

    const resourcesFiles: string[] = globby.sync(`${PROJECT_ROOT}/dist/src/lib/${type}s/**/*.js`, { absolute: true });

    const ids = resourcesFiles.reduce((list: Array<string>, resourceFile: string) => {
        const resourceName = path.basename(resourceFile, '.js');

        if (path.dirname(resourceFile).includes(resourceName)) {
            list.push(resourceName);
        }

        return list;
    }, []);

    resourceIds.set(type, ids);

    return ids;
};

// ------------------------------------------------------------------------------
// Public
// ------------------------------------------------------------------------------

/** Tries to load a module from `resourcePath`. */
export const tryToLoadFrom = (resourcePath: string) => {
    let builder = null;

    try {
        // The following link has more info on how `require` resolves modules:
        // http://nodejs.org/dist/latest-v8.x/docs/api/modules.html#modules_all_together

        const resource = require(resourcePath);

        builder = resource.default || resource;
    } catch (e) {
        debug(`Can't require ${resourcePath}`);
    }

    return builder;
};


/** Looks for a sonar resource with the given `name` and tries to load it.
 * If no valid resource is found, it throws an `Error`.
 *
 * By default, the priorities are:
 *
 * 1. core resource
 * 2. `@sonarwhal/` scoped package
 * 3. `sonarwhal-` prefixed package
 *
 */
export const loadResource = (name: string, type: string) => {
    debug(`Searching ${name}…`);
    const key = `${type}-${name}`;

    if (resources.has(key)) {
        return resources.get(key);
    }

    const sources: string[] = [
        `${PROJECT_ROOT}/dist/src/lib/${type}s/${name}/${name}.js`,
        `@sonarwhal/${name}`,
        `sonarwhal-${name}`
    ];

    let resource;

    sources.some((source) => {
        resource = tryToLoadFrom(source);
        debug(`${name} found in ${source}`);

        return resource;
    });

    if (!resource) {
        debug(`Resource ${name} not found`);
        throw new Error(`Resource ${name} not found`);
    }

    resources.set(key, resource);

    return resource;
};

export const getCoreRules = (): Array<string> => {
    return getCoreResources(TYPE.rule);
};

export const getCoreFormatters = (): Array<string> => {
    return getCoreResources(TYPE.formatter);
};

export const getCoreCollectors = (): Array<string> => {
    return getCoreResources(TYPE.collector);
};

export const loadRules = (config: Object): Map<string, IRuleBuilder> => {
    const rulesIds = Object.keys(config);

    const rules = rulesIds.reduce((acum, ruleId) => {
        const rule = loadResource(ruleId, TYPE.rule);
        const valid = validateRule(rule, config[ruleId], ruleId);

        if (!valid) {
            throw new Error(`Rule ${ruleId} doesn't have a valid configuration`);
        }

        acum.set(ruleId, rule);

        return acum;
    }, new Map<string, IRuleBuilder>());

    return rules;
};

export const loadRule = (ruleId: string) => {
    return loadResource(ruleId, TYPE.rule);
};

export const loadCollector = (collectorId: string) => {
    return loadResource(collectorId, TYPE.collector);
};

export const loadFormatter = (formatterId: string) => {
    return loadResource(formatterId, TYPE.formatter);
};
