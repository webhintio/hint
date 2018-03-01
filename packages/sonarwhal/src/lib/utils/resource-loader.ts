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
import * as semver from 'semver';

import { getPackage, getSonarwhalPackage, findNodeModulesRoot, findPackageRoot, readFile } from '../utils/misc';
import { debug as d } from '../utils/debug';
import { Resource, IRuleConstructor, SonarwhalResources } from '../types';
import { SonarwhalConfig } from '../config';
import { ResourceType } from '../enums/resourcetype';

const debug: debug.IDebugger = d(__filename);
const SONARWHAL_ROOT: string = findPackageRoot();
const NODE_MODULES_ROOT: string = findNodeModulesRoot();

/** Cache of resource builders, indexex by resource Id. */
const resources: Map<string, Resource> = new Map<string, Resource>();

/** Cache of resources ids. */
const resourceIds: Map<string, Array<string>> = new Map<string, Array<string>>();

/**
 * Validates if a given package can be used with the current `sonarwhal` version
 * by looking at its `peerDependencies`
 */
const isVersionValid = (resourcePath: string): boolean => {
    try {
        const pkg = getPackage(resourcePath);
        const sonarwhalPkg = getSonarwhalPackage();

        return semver.satisfies(sonarwhalPkg.version, pkg.peerDependencies.sonarwhal);
    } catch (e) {
        // We failed to load the package.json so it's a core resource
        debug(e);

        return true;
    }
};

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export const getInstalledResources = (type: string): Array<string> => {
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

/** Tries to load a module from `resourcePath`. */
export const tryToLoadFrom = (resourcePath: string): any => {
    // This is exported so it's easier to stub during tests
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
const hasMultipleResources = (resource, type: ResourceType) => {
    switch (type) {
        case ResourceType.rule:
            // In a simple rule, the property meta should exist.
            return !resource.meta;
        // Only case with multiple resources is rules
        default:
            return false;
    }
};

/**
 * Get a resource with the given `name` from a path
 * If that path contains a package with multiple resources
 * then get just the one with the given `name`.
 */
const getResource = (source: string, type: ResourceType, name: string) => {
    const resource = tryToLoadFrom(source);

    if (!resource) {
        return null;
    }

    if (!hasMultipleResources(resource, type)) {
        return resource;
    }

    for (const [key, value] of Object.entries(resource)) {
        if (key === name) {
            return (value as any).default || value;
        }
    }

    return null;
};

/**
 * Looks inside the configurations looking for resources.
 */
const generateConfigPathsToResources = (configurations: Array<string>, name: string, type: ResourceType) => {
    return configurations.reduce((total: Array<string>, configuration: string) => {
        const basePackagePaths = ['@sonarwhal/configuration-', 'sonarwhal-configuration-'];

        for (const basePackagePath of basePackagePaths) {
            const packageName = `${basePackagePath}${configuration}`;

            try {
                const packagePath = path.dirname(require.resolve(packageName));

                const resourcePackages = globby.sync(`node_modules/{@sonarwhal/,sonarwhal-}${type}-${name}/package.json`, { absolute: true, cwd: packagePath }).map((pkg) => {
                    return path.dirname(pkg);
                });

                total = total.concat(resourcePackages);
            } catch (err) {
                debug(`Package ${packageName} not found`);
            }
        }

        return total;
    }, []);
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
export const loadResource = (name: string, type: ResourceType, configurations: Array<string> = [], verifyVersion = false) => {
    debug(`Searching ${name}…`);

    const packageName = name.includes('/') ? name.split('/')[0] : name;
    const resourceName = name.includes('/') ? name.split('/')[1] : name;

    const key: string = `${type}-${packageName}`;

    // When we check the version we ignore if there was a previous version loaded
    if (resources.has(key) && !verifyVersion) {
        return resources.get(key);
    }

    const configPathsToResources = generateConfigPathsToResources(configurations, packageName, type);

    const sources: Array<string> = [
        `@sonarwhal/${key}`, // Officially supported package
        `sonarwhal-${key}`, // Third party package
        path.normalize(`${SONARWHAL_ROOT}/dist/src/lib/${type}s/${packageName}/${packageName}.js`) // Part of core. E.g.: built-in formatters, parsers, connectors
        // path.normalize(`${path.resolve(SONARWHAL_ROOT, '..')}/${key}`) // Things under `/packages/` for when we are developing something official. E.g.: `/packages/rule-http-cache`
    ].concat(configPathsToResources);

    let resource;
    let resourcePath: string;
    let isValid: boolean = true;

    sources.some((source: string) => {
        const res = getResource(source, type, resourceName);

        if (res) {
            debug(`${name} found in ${source}`);

            if (verifyVersion && !isVersionValid(source)) {
                debug(`Resource ${name} isn't compatible with current sonarwhal version`);

                isValid = false;

                return false;
            }

            isValid = true;
            resourcePath = source;
            resource = res;
        }

        return resource;
    });

    if(!isValid) {
        throw new Error(`Resource ${name} isn't compatible with current sonarwhal version`);
    }

    if (!resource) {
        debug(`Resource ${name} not found`);
        throw new Error(`Resource ${name} not found`);
    }

    resources.set(key, resource);

    return resource;
};


const loadListOfResources = (list: Array<string> | Object, type: ResourceType, configurations: Array<string> = []): { incompatible: Array<string>, missing: Array<string>, resources: Array<any> } => {
    const missing: Array<string> = [];
    const incompatible: Array<string> = [];

    // In the case of rules, we get an object with rulename/priority, not an array
    const items = Array.isArray(list) ?
        list :
        Object.keys(list);

    const loadedResources = items.reduce((loaded, resourceId) => {
        try {
            const resource = loadResource(resourceId, type, configurations, true);

            loaded.push(resource);
        } catch (e) {
            if (e.message.includes(`isn't compatible`)) {
                incompatible.push(`${type}-${resourceId}`);
            } else {
                missing.push(`${type}-${resourceId}`);
            }
        }

        return loaded;
    }, []);

    return {
        incompatible,
        missing,
        resources: loadedResources
    };
};

export const loadRule = (ruleId: string, configurations: Array<string>): IRuleConstructor => {
    return loadResource(ruleId, ResourceType.rule, configurations);
};

export const loadConfiguration = (configurationId: string) => {
    return loadResource(configurationId, ResourceType.configuration);
};

/** Returns all the resources from a `SonarwhalConfig` */
export const loadResources = (config: SonarwhalConfig): SonarwhalResources => {
    // TODO: validate connector version is OK once all are extracted
    let connector = null;

    try {
        connector = loadResource(config.connector.name, ResourceType.connector, config.extends, true);
    } catch (e) {
        console.error(e);
    }

    const { incompatible: incompatibleRules, resources: rules, missing: missingRules } = loadListOfResources(config.rules, ResourceType.rule, config.extends);
    const { incompatible: incompatibleParsers, resources: parsers, missing: missingParsers } = loadListOfResources(config.parsers, ResourceType.parser, config.extends);
    const { incompatible: incompatibleFormatters, resources: formatters, missing: missingFormatters } = loadListOfResources(config.formatters, ResourceType.formatter, config.extends);
    const missing = [].concat(missingRules, missingParsers, missingFormatters);
    const incompatible = [].concat(incompatibleFormatters, incompatibleParsers, incompatibleRules);

    if (!connector) {
        missing.push(config.connector);
    }

    return {
        connector,
        formatters,
        incompatible,
        missing,
        parsers,
        rules
    };
};
