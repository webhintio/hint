import * as fs from 'fs';
import * as path from 'path';

import * as globby from 'globby';
import * as semver from 'semver';

import { cwd, loadJSONFile } from '../fs';
import { debug as d } from '../debug';
import { isFullPackageName } from './is-full-package-name';
import { ResourceType } from '../types/resource-type';
import { loadPackage } from './load-package';
import { loadHintPackage } from './load-hint-package';
import { requirePackage } from './require-package';
import { hasMultipleResources } from './has-multiple-resources';
import { normalizeIncludes } from '../misc';
import { toAbsolutePaths } from '../config/to-absolute-paths';
import { ResourceErrorStatus } from '../types/resource-error-status';
import { ResourceError } from '../types/resource-error';

const debug: debug.IDebugger = d(__filename);

/** Cache of resource builders, indexex by resource Id. */
const resources: Map<string, any> = new Map<string, any>();
const moduleNameRegex: RegExp = /[^']*'([^']*)'/g;

/**
 * Validates if a given package can be used with the current `hint` version
 * by looking at its `peerDependencies`
 */
const isVersionValid = (resourcePath: string): boolean => {
    try {
        const pkg = loadPackage(resourcePath);
        const hintPkg = loadHintPackage();

        return semver.satisfies(hintPkg.version, pkg.peerDependencies.hint);
    } catch (e) {
        // We failed to load the package.json so it's a core resource
        debug(e);

        return true;
    }
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

        const resource = requirePackage(resourcePath);

        builder = resource.default || resource;
    } catch (e) {
        debug(`Can't require ${resourcePath}`);

        /* istanbul ignore else */
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

// If we are using bundling with webpack we need to "hide" all the requires
const resolvePackage = (modulePath: string): string => {
    let pkgPath;

    /* istanbul ignore if */
    if (process.env.webpack) { // eslint-disable-line no-process-env
        pkgPath = eval(`require.resolve("${modulePath}")`); // eslint-disable-line no-eval
    } else {
        pkgPath = require.resolve(modulePath);
    }

    return pkgPath;
};

/**
 * Looks inside the configurations looking for resources.
 */
const generateConfigPathsToResources = (configurations: string[], name: string, type: ResourceType) => {
    return configurations.reduce((total: string[], configuration: string) => {
        const basePackagePaths = isFullPackageName(configuration, ResourceType.configuration) ?
            [''] :
            ['@hint/configuration-', 'webhint-configuration-'];

        let result = total;

        for (const basePackagePath of basePackagePaths) {
            const packageName = `${basePackagePath}${configuration}`;

            try {
                const packagePath = path.dirname(resolvePackage(packageName));
                const resourceGlob = isFullPackageName(name, type) ?
                    name :
                    `{@hint/,webhint-}${type}-${name}`;

                const resourcePackages = globby.sync(`node_modules/${resourceGlob}/package.json`, { absolute: true, cwd: packagePath }).map((pkg) => {
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
 * Accepts:
 * * Relative paths (./foo)
 * * Unix-style absolute paths (/foo)
 * * Windows-style absolute paths (c:/foo)
 */
const isFilesystemPath = (filename: string) => {
    return filename[0] === '.' || filename[0] === '/' || filename[1] === ':';
};

/**
 * Looks for a hint resource with the given `name` and tries to load it.
 * If no valid resource is found, it throws an `Error`.
 *
 * By default, the priorities are:
 *
 * 1. core resource
 * 2. `@hint/` scoped package
 * 3. `webhint-` prefixed package
 * 4. external hints
 *
 */
export const loadResource = (name: string, type: ResourceType, configurations: string[] = [], verifyVersion = false) => {
    debug(`Searching ${name}…`);
    const isSource = isFilesystemPath(name) && fs.existsSync(name); // eslint-disable-line no-sync
    const isPackage = isFullPackageName(name, type);
    const nameParts = name.split('/');

    let scope = '';
    let unscopedNameParts = nameParts;

    if (isPackage && nameParts[0].startsWith('@')) {
        scope = `${nameParts[0]}/`;
        unscopedNameParts = nameParts.slice(1);
    }

    const packageName = `${scope}${unscopedNameParts[0]}`;
    const resourceName = isSource ?
        name : unscopedNameParts[1] || packageName;

    const key = isPackage || isSource ?
        name :
        `${type}-${name}`;

    // When we check the version we ignore if there was a previous version loaded
    if (resources.has(key) && !verifyVersion) {
        return resources.get(key);
    }

    const configPathsToResources = generateConfigPathsToResources(configurations, packageName, type);
    const currentProcessDir = cwd();

    /*
     * We can't use the key for the Official packages neither for the Third party ones because
     * in case that we have a multi-hints packages, the key for the cache has to contain
     * the key for the specific hint, but we need to load the package that contains the hint.
     * i.e.
     * if we want to load the hint `hint-typescript-config/is-valid` the key for the cache
     * has to be `hint-typescript-config/is-valid`.
     * But we need to load the package `hint-typescript-config`.
     */
    let sources: string[];

    if (isSource) {
        sources = [path.resolve(currentProcessDir, name)]; // If the name is direct path to the source we should only check that.
    } else if (isPackage) {
        sources = [packageName].concat(configPathsToResources); // If the name is a full package name we should only check that, but look for it in config paths as well.
    } else {
        sources = [
            `@hint/${type}-${packageName}`, // Officially supported package
            `webhint-${type}-${packageName}`, // Third party package
            path.normalize(currentProcessDir) // External hints.
        ].concat(configPathsToResources);
    }

    let resource: any;
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
                    const packageConfig = loadPackage(source);

                    if (!normalizeIncludes(packageConfig.name, packageName)) {
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
        resource = toAbsolutePaths(resource, resolvePackage(loadedSource!));
    }

    resources.set(key, resource);

    return resource;
};
