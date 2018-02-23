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
import { promisify } from 'util';

import * as globby from 'globby';
import * as npm from 'npm';
import * as esearch from 'npm/lib/search/esearch';
import * as inquirer from 'inquirer';

import { findNodeModulesRoot, findPackageRoot, readFile } from './misc';
import { debug as d } from './debug';
import { IConnectorBuilder, IFormatter, NpmPackage, Parser, Resource, IRuleBuilder } from '../types';
import { validate as validateRule } from '../config/config-rules';
import { installPackages } from './npm';

const debug: debug.IDebugger = d(__filename);
const SONARWHAL_ROOT: string = findPackageRoot();
const NODE_MODULES_ROOT: string = findNodeModulesRoot();
const npmLoadAsync = promisify(npm.load);

/** Cache of resource builders, indexex by resource Id. */
const resources: Map<string, Resource> = new Map<string, Resource>();

/** Cache of resources ids. */
const resourceIds: Map<string, Array<string>> = new Map<string, Array<string>>();

/** The type of resource */
export const TYPE = {
    connector: 'connector',
    formatter: 'formatter',
    parser: 'parser',
    rule: 'rule'
};

/** Returns a list with the ids of all the core resources of the given `type`. */
const getCoreResources = (type: string): Array<string> => {
    if (resourceIds.has(type)) {
        return resourceIds.get(type);
    }

    const resourcesFiles: Array<string> = globby.sync(`dist/src/lib/${type}s/**/*.js`, { cwd: SONARWHAL_ROOT });

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
        case TYPE.parser:
            // In a simple parser, the property default should exists.
            return !resource.default && typeof resource !== 'function';
        default:
            return false;
    }
};

/**
 * Get a resource with the given `name` from a path
 * If that path contains a package with multiple resources
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
            return (value as any).default || value;
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

    const packageName = name.includes('/') ? name.split('/')[0] : name;
    const resourceName = name.includes('/') ? name.split('/')[1] : name;

    const key: string = `${type}-${packageName}`;

    if (resources.has(key)) {
        return resources.get(key);
    }

    const sources: Array<string> = [
        `@sonarwhal/${key}`, // Officially supported package
        `sonarwhal-${key}`, // Third party package
        path.normalize(`${SONARWHAL_ROOT}/dist/src/lib/${type}s/${packageName}/${packageName}.js`), // Part of core. E.g.: built-in formatters, parsers, connectors
        path.normalize(`${path.resolve(SONARWHAL_ROOT, '..')}/${key}`) // Things under `/packages/` for when we are developing something official. E.g.: `/packages/rule-http-cache`
    ];

    let resource: any;

    sources.some((source: string) => {
        resource = getResource(source, type, resourceName);
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
    // This needs to be merged with https://github.com/sonarwhal/sonarwhal/pull/785
    return getCoreResources(TYPE.rule);
};

export const getCoreFormatters = (): Array<string> => {
    // This needs to be merged with https://github.com/sonarwhal/sonarwhal/pull/785
    return getCoreResources(TYPE.formatter);
};

export const getCoreConnectors = (): Array<string> => {
    // This needs to be merged with https://github.com/sonarwhal/sonarwhal/pull/785
    return getCoreResources(TYPE.connector);
};

export const getCoreParsers = (): Array<string> => {
    // This needs to be merged with https://github.com/sonarwhal/sonarwhal/pull/785
    return getCoreResources(TYPE.parser);
};

export const getInstalledConnectors = (): Array<string> => {
    return getInstalledResources(TYPE.connector);
};

/**
 * Searches all the packages in npm given `searchTerm`.
 */
const searchNpmPackages = (searchTerm: string): Promise<Array<NpmPackage>> => {
    return new Promise((resolve, reject) => {
        const results = [];

        const searchOptions = {
            description: true,
            excluded: [],
            include: [searchTerm],
            limit: 1000,
            staleness: 900,
            unicode: false
        };

        esearch(searchOptions)
            .on('data', (data) => {
                results.push(data);
            })
            .on('error', (err) => {
                reject(err);
            })
            .on('end', () => {
                resolve(results);
            });
    });
};

const loadNpm = () => {
    return npmLoadAsync({ loaded: false });
};

/** Filters the packages that `startsWith` `initTerm`. */
const filterPackages = (packages: Array<NpmPackage>, initTerm: string) => {
    return packages.filter((pkg) => {
        return pkg.name.startsWith(initTerm);
    });
};

/** Get packages from npm. */
export const getNpmPackages = async (searchTerm: string = 'sonarwhal'): Promise<Array<NpmPackage>> => {
    await loadNpm();

    return searchNpmPackages(searchTerm);
};

/** Get core packages from npm. */
const getCorePackages = async (type: string): Promise<Array<NpmPackage>> => {
    const rules = await getNpmPackages(`@sonarwhal/${type}`);

    /*
     * We need to filter the results because the search can
     * include other packages that doesn't start with `@sonarwhal/{type}`.
     */
    return filterPackages(rules, `@sonarwhal/${type}`);
};

/** Get external packages from npm. */
const getExternalPackages = async (type: string): Promise<Array<NpmPackage>> => {
    const rules = await getNpmPackages(`sonarwhal-${type}`);

    /*
     * We need to filter the results because the search can
     * include other packages that doesn't start with `sonarwhal-{type}`.
     */
    return filterPackages(rules, `sonarwhal-${type}`);
};

/** Get external rules from npm. */
export const getExternalRulesFromNpm = () => {
    return getExternalPackages(TYPE.rule);
};

/** Get core rules from npm. */
export const getCoreRulesFromNpm = () => {
    return getCorePackages(TYPE.rule);
};

/** Get external connectors from npm. */
export const getExternalConnectorsFromNpm = () => {
    return getExternalPackages(TYPE.connector);
};

/** Get core connectors from npm. */
export const getCoreConnectorsFromNpm = () => {
    return getCorePackages(TYPE.connector);
};

/** Get external parsers from npm. */
export const getExternalParsersFromNpm = () => {
    return getExternalPackages(TYPE.parser);
};

/** Get core parsers from npm. */
export const getCoreParsersFromNpm = () => {
    return getCorePackages(TYPE.parser);
};

/** Get external formatters from npm. */
export const getExternalFormattersFromNpm = () => {
    return getExternalPackages(TYPE.formatter);
};

/** Get core formatters from npm. */
export const getCoreFormattersFromNpm = () => {
    return getCorePackages(TYPE.formatter);
};

const getPackagesToInstall = async (packagesIds: Array<string>, type: string) => {
    let promise: Promise<[Array<NpmPackage>, Array<NpmPackage>]>;

    switch (type) {
        case TYPE.connector:
            promise = Promise.all([getCoreConnectorsFromNpm(), getExternalConnectorsFromNpm()]);
            break;
        case TYPE.formatter:
            promise = Promise.all([getCoreFormattersFromNpm(), getExternalFormattersFromNpm()]);
            break;
        case TYPE.parser:
            promise = Promise.all([getCoreParsersFromNpm(), getExternalParsersFromNpm()]);
            break;
        case TYPE.rule:
            promise = Promise.all([getCoreRulesFromNpm(), getExternalRulesFromNpm()]);
            break;
        default:
            throw new Error(`Type ${type} unknown`);
    }

    const [npmCorePackages, npmExternalPackages] = await promise;
    const npmPackages: Array<string> = npmCorePackages
        .concat(npmExternalPackages)
        .filter((npmPackage) => {
            return packagesIds.includes(npmPackage.name.replace(`@sonarwhal/${type}-`, '').replace(`sonarwhal-${type}-`, ''));
        })
        .map((npmPackage) => {
            return npmPackage.name;
        });
    const notExists: Array<string> = [];

    for (const packageId of packagesIds) {
        if (!npmPackages.includes(`@sonarwhal/${type}-${packageId}`) && !npmPackages.includes(`sonarwhal-${type}-${packageId}`)) {
            notExists.push(packageId);
        }
    }

    if (notExists.length > 0) {
        throw new Error(`${type.charAt(0).toUpperCase()}${type.slice(1)}s ${notExists.join(' ')} not found. Please, review your configuration.`);
    }

    return npmPackages;
};

const installMissingPackages = async (ids: Array<string>, type: string) => {
    // Check if the missing package exists in NPM.
    const packages = await getPackagesToInstall(ids, type);

    console.log(`The following ${type}s are not installed:`);
    console.log(packages.join(' '));

    // Ask user if he wants to install the packages.
    const result = await inquirer.prompt([{
        default: true,
        message: `Do you want to install the missing ${type}s?`,
        name: 'ok',
        type: 'confirm'
    }]) as any;

    if (!result.ok) {
        throw new Error(`${type.charAt(0).toUpperCase()}${type.slice(1)}s ${packages.join(' ')} not found. Please, install them.`);
    }

    // Install Packages
    installPackages(packages);
};

const loadResources = async (ids: Array<string>, type: string): Promise<[Map<string, any>, Array<string>]> => {
    const load = (idsToLoad: Array<string>, resourceType: string): [Map<string, IRuleBuilder>, Array<string>] => {
        const notFound: Array<string> = [];
        const found: Map<string, IRuleBuilder> = new Map<string, IRuleBuilder>();

        for (const ruleId of idsToLoad) {
            let rule: IRuleBuilder;

            try {
                rule = loadResource(ruleId, resourceType);
            } catch (err) {
                notFound.push(ruleId);
            }

            if (!rule) {
                continue;
            }

            found.set(ruleId, rule);
        }

        return [found, notFound];
    };

    let [resourcesFound, resourcesNotFound]: [Map<string, IRuleBuilder>, Array<string>] = load(ids, type);
    let installedResources: Map<string, IRuleBuilder>;

    if (resourcesNotFound.length > 0) {
        await installMissingPackages(resourcesNotFound, type);

        [installedResources, resourcesNotFound] = load(resourcesNotFound, type);
    }

    resourcesFound = installedResources ? new Map([...resourcesFound, ...installedResources]) : resourcesFound;

    return [resourcesFound, resourcesNotFound];
};

export const loadRules = async (config: Object): Promise<Map<string, IRuleBuilder>> => {
    const rulesIds: Array<string> = Object.keys(config);

    const [rules, rulesNotFound]: [Map<string, IRuleBuilder>, Array<string>] = await loadResources(rulesIds, TYPE.rule);

    if (rulesNotFound.length > 0) {
        throw new Error(`Rule${rulesNotFound.length > 1 ? 's' : ''} ${rulesNotFound.join(' ')} not found.`);
    }

    for (const [ruleId, rule] of rules) {
        const valid: boolean = validateRule(rule, config[ruleId], ruleId);

        if (!valid) {
            throw new Error(`Rule ${ruleId} doesn't have a valid configuration`);
        }
    }

    return rules;
};

export const loadParsers = async (parsersIds: Array<string>): Promise<Map<string, Parser>> => {
    const [parsers, parsersNotFound]: [Map<string, Parser>, Array<string>] = await loadResources(parsersIds, TYPE.parser);

    if (parsersNotFound.length > 0) {
        throw new Error(`Parser${parsersNotFound.length > 1 ? 's' : ''} ${parsersNotFound.join(' ')} not found.`);
    }

    return parsers;
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

export const loadParser = (parserId: string): Parser => {
    return loadResource(parserId, TYPE.parser);
};
