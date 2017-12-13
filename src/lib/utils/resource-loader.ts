/**
 * @fileoverview Locates and requires resources (Connectors, plugins, rules, formatters)
 * for sonarwhal across different places in the tree.
 * By convention, these resources need to be under
 * {/, /node_modules/}lib/{connectors, formatters, plugins, rules}/*.js
 */

/*
 * ------------------------------------------------------------------------------
 * Requirements
 * ------------------------------------------------------------------------------
 */

import * as path from 'path';

import * as globby from 'globby';

import { findNodeModulesRoot, findPackageRoot, readFile } from './misc';
import { debug as d } from './debug';
import { IConnectorBuilder, IFormatter, Resource, IRuleBuilder } from '../types';
import { validate as validateRule } from '../config/config-rules';

const debug: debug.IDebugger = d(__filename);
const PROJECT_ROOT: string = findPackageRoot();
const NODE_MODULES_ROOT: string = findNodeModulesRoot();
const externalPackages: Array<string> = globby.sync(`{${process.cwd()},${NODE_MODULES_ROOT}/{.,@sonarwhal,sonarwhal-}}/{{rule,connector,formatter}-*,.}/package.json`, { nodir: false });
const externalPaths: Array<string> = externalPackages.map((packagePath) => {
    return packagePath.replace('package.json', '');
});

/** Cache of resource builders, indexex by resource Id. */
const resources: Map<string, Resource> = new Map<string, Resource>();

/** Cache of resources ids. */
const resourceIds: Map<string, Array<string>> = new Map<string, Array<string>>();

/** The type of resource */
export const TYPE = {
    connector: 'connector',
    formatter: 'formatter',
    rule: 'rule'
};

/** Returns a list with the ids of all the core resources of the given `type`. */
const getCoreResources = (type: string): Array<string> => {
    if (resourceIds.has(type)) {
        return resourceIds.get(type);
    }

    const resourcesFiles: Array<string> = globby.sync(`${PROJECT_ROOT}/dist/src/lib/${type}s/**/*.js`);

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

const getInstalledResources = (type: string): Array<string> => {
    const installedType = `installed-${type}`;

    if (resourceIds.has(installedType)) {
        return resourceIds.get(installedType);
    }

    const resourcesFiles: Array<string> = globby.sync(`${NODE_MODULES_ROOT}/@sonarwhal/${type}-*/**/package.json`);

    const ids: Array<string> = resourcesFiles.reduce((list: Array<string>, resourceFile: string) => {
        const packageName = JSON.parse(readFile(resourceFile)).name;
        const resourceName = packageName.substr(packageName.lastIndexOf('/') + 1);

        list.push(resourceName);

        return list;
    }, []);

    resourceIds.set(installedType, ids);

    return ids;
};

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

/** Tries to load a module from `resourcePath`. */
export const tryToLoadFrom = (resourcePath: string): any => {
    let builder: any = null;

    try {
        /*
         * The following link has more info on how `require` resolves modules:
         * http://nodejs.org/dist/latest-v8.x/docs/api/modules.html#modules_all_together
         */

        const resource = require(resourcePath);

        builder = resource.default || resource;
    } catch (e) {
        debug(`Can't require ${resourcePath}`);
    }

    return builder;
};

/**
 * Check if it is a package with multiple resources.
 */
const hasMultipleResources = (resource, type: string) => {
    switch (type) {
        case TYPE.connector:
            // In a simple connector, resource should be a function.
            return typeof resource === 'object';
        case TYPE.formatter:
            // In a simple formatter, the property format should exist.
            return !resource.format;
        case TYPE.rule:
            // In a simple rule, the properties create and meta should exist.
            return !(resource.create && resource.meta);
        default:
            return false;
    }
};

/**
 * Get a resource with the given `name` from a path
 * If that path contain a package with multiple resources
 * then get just the one with the given `name`.
 */
const getResource = (source: string, type: string, name: string) => {
    const resource = tryToLoadFrom(source);

    if (!resource) {
        return null;
    }

    if (!hasMultipleResources(resource, type)) {
        return resource;
    }

    for (const [key, value] of Object.entries(resource)) {
        if (key === name) {
            return value;
        }
    }

    return null;
};

/**
 * Looks for a sonarwhal resource with the given `name` and tries to load it.
 * If no valid resource is found, it throws an `Error`.
 *
 * By default, the priorities are:
 *
 * 1. core resource
 * 2. `@sonarwhal/` scoped package
 * 3. `sonarwhal-` prefixed package
 * 4. external rules
 *
 */
export const loadResource = (name: string, type: string) => {
    debug(`Searching ${name}…`);
    const key: string = `${type}-${name}`;

    if (resources.has(key)) {
        return resources.get(key);
    }

    const sources: Array<string> = [
        path.normalize(`${PROJECT_ROOT}/dist/src/lib/${type}s/${name}/${name}.js`),
        `@sonarwhal/${name}`,
        `sonarwhal-${name}`
    ].concat(externalPaths);

    let resource: any;

    sources.some((source: string) => {
        resource = getResource(source, type, name);
        if (resource) {
            debug(`${name} found in ${source}`);
        }

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

export const getCoreConnectors = (): Array<string> => {
    return getCoreResources(TYPE.connector);
};

export const getInstalledConnectors = (): Array<string> => {
    return getInstalledResources(TYPE.connector);
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

export const loadConnector = (connectorId: string): IConnectorBuilder => {
    return loadResource(connectorId, TYPE.connector);
};

export const loadFormatter = (formatterId: string): IFormatter => {
    return loadResource(formatterId, TYPE.formatter);
};
