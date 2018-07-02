/**
 * @fileoverview Locates and requires resources (connectors, parsers, hints, formatters)
 * for hint across different places in the tree.
 * By convention, these resources need to be under
 * {/, /node_modules/}lib/{connectors, formatters, parsers, hints}/*.js
 */

/*
 * ------------------------------------------------------------------------------
 * Requirements
 * ------------------------------------------------------------------------------
 */

import * as fs from 'fs';
import * as path from 'path';

import * as globby from 'globby';
import * as semver from 'semver';

import loadJSONFile from './fs/load-json-file';
import getPackage from './packages/load-package';
import getHintPackage from './packages/load-hint-package';
import findNodeModulesRoot from './packages/find-node-modules-root';
import findPackageRoot from './packages/find-package-root';
import isNormalizedIncluded from './misc/normalize-includes';
import readFile from './fs/read-file';
import { debug as d } from './debug';
import { Resource, IHintConstructor, HintResources } from '../types';
import { Configuration } from '../config';
import { ResourceType } from '../enums/resourcetype';
import { ResourceErrorStatus } from '../enums/errorstatus';
import { ResourceError } from '../types/resourceerror';

const debug: debug.IDebugger = d(__filename);
const HINT_ROOT: string = findPackageRoot();
const NODE_MODULES_ROOT: string = findNodeModulesRoot();
const moduleNameRegex: RegExp = /[^']*'([^']*)'/g;

/** Cache of resource builders, indexex by resource Id. */
const resources: Map<string, Resource> = new Map<string, Resource>();

/** Cache of resources ids. */
const resourceIds: Map<string, Array<string>> = new Map<string, Array<string>>();

/**
 * Validates if a given package can be used with the current `hint` version
 * by looking at its `peerDependencies`
 */
const isVersionValid = (resourcePath: string): boolean => {
    try {
        const pkg = getPackage(resourcePath);
        const hintPkg = getHintPackage();

        return semver.satisfies(hintPkg.version, pkg.peerDependencies.hint);
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

/** Returns a list with the ids of all the core resources of the given `type`. */
export const getCoreResources = (type: string): Array<string> => {
    if (resourceIds.has(type)) {
        return resourceIds.get(type);
    }

    const resourcesFiles: Array<string> = globby.sync(`dist/src/lib/${type}s/**/*.js`, { cwd: HINT_ROOT });
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

/**
 * Check if it is a package with multiple resources.
 */
const hasMultipleResources = (resource, type: ResourceType) => {
    switch (type) {
        case ResourceType.hint:
            // In a simple hint, the property meta should exist.
            return !resource.meta;
        // Only case with multiple resources is hints
        default:
            return false;
    }
};

export const getInstalledResources = (type: ResourceType): Array<string> => {
    const installedType = `installed-${type}`;

    if (resourceIds.has(installedType)) {
        return resourceIds.get(installedType);
    }

    const resourcesFiles: Array<string> = globby.sync(`${NODE_MODULES_ROOT}/@hint/${type}-*/package.json`);

    const ids: Array<string> = resourcesFiles.reduce((list: Array<string>, resourceFile: string) => {
        const resource = require(path.dirname(resourceFile));
        const packageName = JSON.parse(readFile(resourceFile)).name;
        const resourceName = packageName.substr(packageName.lastIndexOf('/') + 1).replace(`${type}-`, '');

        if (!hasMultipleResources(resource, type)) {
            list.push(resourceName);
        } else {
            const hints = Object.entries(resource);

            if (hints.length === 1 && resource[resourceName]) {
                list.push(resourceName);
            } else {
                for (const [key] of hints) {
                    list.push(`${resourceName}/${key}`);
                }
            }
        }

        return list;
    }, []);

    resourceIds.set(installedType, ids);

    return ids;
};

/** Tries to load a module from `resourcePath`. */
export const tryToLoadFrom = (resourcePath: string): any => {
    // This is exported so it's easier to stub during tests
    let builder: any = null;

    /*
     * We could be loading a config file that points to a path (thus a JSON).
     * `require` will try to load `.js`, `.json`, `.node` so it will fail and
     * we have to manually do this
     */
    try {
        const resource = loadJSONFile(resourcePath);

        return resource;
    } catch (e) {
        debug(`${resourcePath} is not a JSON file, trying to load it normally`);
    }

    try {
        /*
         * The following link has more info on how `require` resolves modules:
         * http://nodejs.org/dist/latest-v8.x/docs/api/modules.html#modules_all_together
         */

        const resource = require(resourcePath);

        builder = resource.default || resource;
    } catch (e) {
        debug(`Can't require ${resourcePath}`);

        if (e.code === 'MODULE_NOT_FOUND') {
            /*
             * This get the name of the missed module
             * e.g: Cannot find module 'iltorb'
             */
            const exec = moduleNameRegex.exec(e.message);
            const moduleName = exec ? exec[1] : null;

            /*
             * If the module not found is the same as the module
             * we are trying to load, then is ok.
             */
            if (!moduleName || moduleName === resourcePath) {
                return null;
            }

            const errorMessage = `Module ${moduleName} not found when loading ${resourcePath}`;

            // The resourcePath and the module not found are different.
            throw new ResourceError(errorMessage, ResourceErrorStatus.DependencyError);
        }

        throw new ResourceError(e, ResourceErrorStatus.Unknown);
    }

    return builder;
};

/**
 * Get a resource with the given `name` from a path
 * If that path contains a package with multiple resources
 * then get only the one with the given `name`.
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
        const basePackagePaths = ['@hint/configuration-', 'hint-configuration-'];

        let result = total;

        for (const basePackagePath of basePackagePaths) {
            const packageName = `${basePackagePath}${configuration}`;

            try {
                const packagePath = path.dirname(require.resolve(packageName));

                const resourcePackages = globby.sync(`node_modules/{@hint/,hint-}${type}-${name}/package.json`, { absolute: true, cwd: packagePath }).map((pkg) => {
                    return path.dirname(pkg);
                });

                result = result.concat(resourcePackages);
            } catch (err) {
                debug(`Package ${packageName} not found`);
            }
        }

        return result;
    }, []);
};

/**
 * Looks for a hint resource with the given `name` and tries to load it.
 * If no valid resource is found, it throws an `Error`.
 *
 * By default, the priorities are:
 *
 * 1. core resource
 * 2. `@hint/` scoped package
 * 3. `hint-` prefixed package
 * 4. external hints
 *
 */
export const loadResource = (name: string, type: ResourceType, configurations: Array<string> = [], verifyVersion = false) => {
    debug(`Searching ${name}…`);
    const isSource = fs.existsSync(name); // eslint-disable-line no-sync
    const nameSplitted = name.split('/');

    const packageName = nameSplitted[0];
    const resourceName = isSource ?
        name :
        nameSplitted[1] || packageName;

    const key: string = isSource ?
        name :
        `${type}-${name}`;

    // When we check the version we ignore if there was a previous version loaded
    if (resources.has(key) && !verifyVersion) {
        return resources.get(key);
    }

    const configPathsToResources = generateConfigPathsToResources(configurations, packageName, type);
    const currentProcessDir = process.cwd();

    /*
     * We can't use the key for the Official packages neither for the Third party ones because
     * in case that we have a multi-hints packages, the key for the cache has to contain
     * the key for the specific hint, but we need to load the package that contains the hint.
     * i.e.
     * if we want to load the hint `hint-typescript-config/is-valid` the key for the cache
     * has to be `hint-typescript-config/is-valid`.
     * But we need to load the package `typescript-config`.
     */
    const sources: Array<string> = isSource ?
        [path.resolve(currentProcessDir, name)] : // If the name is direct path to the source we should only check that
        [
            `@hint/${type}-${packageName}`, // Officially supported package
            `hint-${type}-${packageName}`, // Third party package
            path.normalize(`${HINT_ROOT}/dist/src/lib/${type}s/${packageName}/${packageName}.js`), // Part of core. E.g.: built-in formatters, parsers, connectors
            path.normalize(currentProcessDir) // External hints.
            // path.normalize(`${path.resolve(HINT_ROOT, '..')}/${key}`) // Things under `/packages/` for when we are developing something official. E.g.: `/packages/hint-http-cache`
        ].concat(configPathsToResources);

    let resource;
    let loadedSource: string;
    let isValid: boolean = true;

    sources.some((source: string) => {
        const res = getResource(source, type, resourceName);

        if (res && isSource) {
            isValid = true;
            resource = res;
            loadedSource = source;

            return true;
        }

        if (res && !isSource) { // Paths to sources might not have packages and versioning doesn't apply
            debug(`${name} found in ${source}`);

            if (source === currentProcessDir) {
                try {
                    const packageConfig = getPackage(source);

                    if (!isNormalizedIncluded(packageConfig.name, packageName)) {
                        return false;
                    }
                } catch (e) {
                    return false;
                }
            }

            if (verifyVersion && !isVersionValid(source)) {
                debug(`Resource ${name} isn't compatible with current hint version`);

                isValid = false;

                return false;
            }

            isValid = true;
            resource = res;
            loadedSource = source;
        }

        return resource;
    });

    if (!isValid) {
        throw new ResourceError(`Resource ${name} isn't compatible with current hint version`, ResourceErrorStatus.NotCompatible);
    }

    if (!resource) {
        debug(`Resource ${name} not found`);
        throw new ResourceError(`Resource ${name} not found`, ResourceErrorStatus.NotFound);
    }

    if (type === ResourceType.configuration) {
        resource = Configuration.toAbsolutePaths(resource, require.resolve(loadedSource));
    }

    resources.set(key, resource);

    return resource;
};

const loadListOfResources = (list: Array<string> | Object = [], type: ResourceType, configurations: Array<string> = []): { incompatible: Array<string>, missing: Array<string>, resources: Array<any> } => {
    const missing: Array<string> = [];
    const incompatible: Array<string> = [];

    // In the case of hints, we get an object with hintname/priority, not an array
    const items = Array.isArray(list) ?
        list :
        Object.keys(list);

    const loadedResources = items.reduce((loaded, resourceId) => {
        try {
            const resource = loadResource(resourceId, type, configurations, true);

            loaded.push(resource);
        } catch (e) {
            if (e.status === ResourceErrorStatus.NotCompatible) {
                incompatible.push(`${type}-${resourceId}`);
            } else if (e.status === ResourceErrorStatus.NotFound) {
                missing.push(`${type}-${resourceId}`);
            } else {
                throw e;
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

export const loadHint = (hintId: string, configurations: Array<string>): IHintConstructor => {
    return loadResource(hintId, ResourceType.hint, configurations);
};

export const loadConfiguration = (configurationId: string) => {
    return loadResource(configurationId, ResourceType.configuration);
};

/** Returns all the resources from a `HintConfig` */
export const loadResources = (config: Configuration): HintResources => {
    // TODO: validate connector version is OK once all are extracted
    let connector = null;

    try {
        connector = loadResource(config.connector.name, ResourceType.connector, config.extends, true);
    } catch (e) {
        debug(e);

        if (e.status === ResourceErrorStatus.DependencyError) {
            throw e;
        }
    }

    const { incompatible: incompatibleHints, resources: hints, missing: missingHints } = loadListOfResources(config.hints, ResourceType.hint, config.extends);
    const { incompatible: incompatibleParsers, resources: parsers, missing: missingParsers } = loadListOfResources(config.parsers, ResourceType.parser, config.extends);
    const { incompatible: incompatibleFormatters, resources: formatters, missing: missingFormatters } = loadListOfResources(config.formatters, ResourceType.formatter, config.extends);
    const missing = [].concat(missingHints, missingParsers, missingFormatters);
    const incompatible = [].concat(incompatibleFormatters, incompatibleParsers, incompatibleHints);

    if (!connector) {
        missing.push(`${ResourceType.connector}-${config.connector.name || config.connector}`);
    }

    return {
        connector,
        formatters,
        hints,
        incompatible,
        missing,
        parsers
    };
};
