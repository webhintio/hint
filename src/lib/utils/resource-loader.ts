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
import { loggerInitiator } from './logging';
import { ICollectorBuilder, IFormatter, IPluginBuilder, Resource, IRuleBuilder } from '../types'; // eslint-disable-line no-unused-vars
import { validate as validateRule } from '../config/config-rules';

const logger = loggerInitiator(__filename);
const PROJECT_ROOT: string = findPackageRoot();

/** Cache of resource builders, indexex by resource Id. */
const resources: Map<string, Resource> = new Map<string, Resource>();

/** Cache of resources ids. */
const resourceIds: Map<string, Array<string>> = new Map<string, Array<string>>();

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

    const resourcesFiles: Array<string> = globby.sync(`${PROJECT_ROOT}/dist/src/lib/${type}s/**/*.js`, { absolute: true });

    const ids: Array<string> = resourcesFiles.reduce((list: Array<string>, resourceFile: string) => {
        const resourceName: string = path.basename(resourceFile, '.js');

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
export const tryToLoadFrom = (resourcePath: string): any => {
    let builder: any = null;

    try {
        // The following link has more info on how `require` resolves modules:
        // http://nodejs.org/dist/latest-v8.x/docs/api/modules.html#modules_all_together

        const resource = require(resourcePath);

        builder = resource.default || resource;
    } catch (e) {
        logger.debug(`Can't require ${resourcePath}`);
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
    logger.debug(`Searching ${name}…`);
    const key: string = `${type}-${name}`;

    if (resources.has(key)) {
        return resources.get(key);
    }

    const sources: Array<string> = [
        `${PROJECT_ROOT}/dist/src/lib/${type}s/${name}/${name}.js`,
        `@sonarwhal/${name}`,
        `sonarwhal-${name}`
    ];

    let resource: any;

    sources.some((source: string) => {
        resource = tryToLoadFrom(source);
        logger.debug(`${name} found in ${source}`);

        return resource;
    });

    if (!resource) {
        logger.debug(`Resource ${name} not found`);
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
    const rulesIds: Array<string> = Object.keys(config);

    const rules: Map<string, IRuleBuilder> = rulesIds.reduce((acum: Map<string, IRuleBuilder>, ruleId: string) => {
        const rule: IRuleBuilder = loadResource(ruleId, TYPE.rule);
        const valid: boolean = validateRule(rule, config[ruleId], ruleId);

        if (!valid) {
            throw new Error(`Rule ${ruleId} doesn't have a valid configuration`);
        }

        acum.set(ruleId, rule);

        return acum;
    }, new Map<string, IRuleBuilder>());

    return rules;
};

export const loadRule = (ruleId: string): IRuleBuilder => {
    return loadResource(ruleId, TYPE.rule);
};

export const loadCollector = (collectorId: string): ICollectorBuilder => {
    return loadResource(collectorId, TYPE.collector);
};

export const loadFormatter = (formatterId: string): IFormatter => {
    return loadResource(formatterId, TYPE.formatter);
};
