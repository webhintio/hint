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

import * as path from 'path';

import * as globby from 'globby';

import { debug as d, fs as fsUtils, packages } from '@hint/utils';

import { IHintConstructor, HintResources } from '../types';
import { Configuration } from '../config';
import { ResourceType } from '../enums/resource-type';
import { ResourceErrorStatus } from '../enums/error-status';
import { IConnectorConstructor } from '../types/connector';

export * from '@hint/utils/dist/src/packages/load-resource';

const { readFile } = fsUtils;
const {
    findNodeModulesRoot,
    findPackageRoot,
    hasMultipleResources,
    isFullPackageName,
    loadResource,
    requirePackage
} = packages;

const debug: debug.IDebugger = d(__filename);
const HINT_ROOT: string = findPackageRoot();
const NODE_MODULES_ROOT: string = (() => {
    const root: string = findNodeModulesRoot();

    return root;
})();

/** Cache of resources ids. */
const resourceIds: Map<string, string[]> = new Map<string, string[]>();

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

/** Returns a list with the ids of all the core resources of the given `type`. */
export const getCoreResources = (type: string): string[] => {
    if (resourceIds.has(type)) {
        return resourceIds.get(type)!;
    }

    const resourcesFiles: string[] = globby.sync(`dist/src/lib/${type}s/**/*.js`, { cwd: HINT_ROOT });
    const ids: string[] = resourcesFiles.reduce((list: string[], resourceFile: string) => {
        const resourceName: string = path.basename(resourceFile, '.js');

        if (path.dirname(resourceFile).includes(resourceName)) {
            list.push(resourceName);
        }

        return list;
    }, []);

    resourceIds.set(type, ids);

    return ids;
};

export const getInstalledResources = (type: ResourceType): string[] => {
    const installedType = `installed-${type}`;

    /* istanbul ignore if */
    if (resourceIds.has(installedType)) {
        return resourceIds.get(installedType)!;
    }

    const resourcesFiles: string[] = globby.sync(`${NODE_MODULES_ROOT.replace(/\\/g, '/')}/@hint/${type}-*/package.json`);

    const ids: string[] = resourcesFiles.reduce((list: string[], resourceFile: string) => {
        const resource = requirePackage(path.dirname(resourceFile));
        const packageName = JSON.parse(readFile(resourceFile)).name;
        const resourceName = packageName.substr(packageName.lastIndexOf('/') + 1).replace(`${type}-`, '');

        /* istanbul ignore else */
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

const loadListOfResources = (list: string[] | Object = [], type: ResourceType, configurations: string[] = []): { incompatible: string[]; missing: string[]; resources: any[] } => {
    const missing: string[] = [];
    const incompatible: string[] = [];

    // In the case of hints, we get an object with hintname/priority, not an array
    const items = Array.isArray(list) ?
        list :
        Object.keys(list);

    const loadedResources = items.reduce((loaded, resourceId) => {
        try {
            const resource = loadResource(resourceId, type, configurations, true);

            loaded.push(resource);
        } catch (e) {
            const name = isFullPackageName(resourceId, type) ? resourceId : `${type}-${resourceId}`;

            if (e.status === ResourceErrorStatus.NotCompatible) {
                incompatible.push(name);
            } else if (e.status === ResourceErrorStatus.NotFound) {
                missing.push(name);
            } else {
                throw e;
            }
        }

        return loaded;
    }, [] as any[]);

    return {
        incompatible,
        missing,
        resources: loadedResources
    };
};

export const loadHint = (hintId: string, configurations?: string[]): IHintConstructor => {
    return loadResource(hintId, ResourceType.hint, configurations);
};

export const loadConfiguration = (configurationId: string, configurations?: string[]) => {
    return loadResource(configurationId, ResourceType.configuration, configurations);
};

/** Returns all the resources from a `HintConfig` */
export const loadResources = (config: Configuration): HintResources => {
    // TODO: validate connector version is OK once all are extracted
    let connector: IConnectorConstructor | null = null;
    const connectorName = config.connector && config.connector.name || '';

    try {
        connector = loadResource(connectorName, ResourceType.connector, config.extends, true);
    } catch (e) {
        debug(e);

        if (e.status === ResourceErrorStatus.DependencyError) {
            throw e;
        }
    }

    const { incompatible: incompatibleHints, resources: hints, missing: missingHints } = loadListOfResources(config.hints, ResourceType.hint, config.extends);
    const { incompatible: incompatibleParsers, resources: parsers, missing: missingParsers } = loadListOfResources(config.parsers, ResourceType.parser, config.extends);
    const { incompatible: incompatibleFormatters, resources: formatters, missing: missingFormatters } = loadListOfResources(config.formatters, ResourceType.formatter, config.extends);
    const missing = ([] as string[]).concat(missingHints, missingParsers, missingFormatters);
    const incompatible = ([] as string[]).concat(incompatibleFormatters, incompatibleParsers, incompatibleHints);

    if (!connector) {
        missing.push(`${ResourceType.connector}-${connectorName || config.connector}`);
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
