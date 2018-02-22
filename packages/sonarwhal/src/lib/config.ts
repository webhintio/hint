/**
 * @fileoverview Loads the configuration file
 *
 * Based on ESLint's config-file
 * https://github.com/eslint/eslint/blob/master/lib/config/config-file.js
 */

/* eslint no-use-before-define: 0 */

/*
 * ------------------------------------------------------------------------------
 * Requirements
 * ------------------------------------------------------------------------------
 */

import * as path from 'path';

import * as shell from 'shelljs';
import * as _ from 'lodash';

import { debug as d } from './utils/debug';
import { IConfig, IFormatter, Parser } from './types';
import { loadJSFile, loadJSONFile } from './utils/misc';
import { validateConfig } from './config/config-validator';
import * as resourceLoader from './config/resource-loader';

const debug: debug.IDebugger = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Private
 * ------------------------------------------------------------------------------
 */

const CONFIG_FILES = [
    '.sonarwhalrc',
    '.sonarwhalrc.js',
    '.sonarwhalrc.json',
    'package.json'
];

/** Loads a configuration from a package.json file. */
const loadPackageJSONConfigFile = (filePath: string): IConfig => {

    debug(`Loading package.json config file: ${filePath}`);

    try {
        return loadJSONFile(filePath).sonarwhalConfig || null;
    } catch (e) {
        debug(`Error reading package.json file: ${filePath}`);
        e.message = `Cannot read config file: ${filePath}\nError: ${e.message}`;
        throw e;
    }
};

/**
 * Loads a configuration file regardless of the source. Inspects the file path
 * to determine the correctly way to load the config file.
 */
const loadConfigFile = (filePath: string): IConfig => {

    let config: IConfig;

    switch (path.extname(filePath)) {
        case '':
        case '.json':
            if (path.basename(filePath) === 'package.json') {
                config = loadPackageJSONConfigFile(filePath);
            } else {
                config = loadJSONFile(filePath);
            }
            break;

        case '.js':
            config = loadJSFile(filePath);
            break;

        default:
            config = null;
    }

    return config;
};

const loadBrowsersList = (config: IConfig): void => {
    const directory: string = process.cwd();
    const files: Array<string> = CONFIG_FILES.reduce((total, configFile) => {
        const filename: string = path.join(directory, configFile);

        if (shell.test('-f', filename)) {
            total.push(filename);
        }

        return total;
    }, []);

    for (let i = 0; i < files.length; i++) {
        const file: string = files[i];
        const tmpConfig: IConfig = loadConfigFile(file);

        if (tmpConfig && tmpConfig.browserslist) {
            config.browserslist = tmpConfig.browserslist;
            break;
        }

        if (file.endsWith('package.json')) {
            const packagejson = loadJSONFile(file);

            config.browserslist = packagejson.browserslist;
        }
    }
};

/** Loads a configuration file from the given file path. */
export const load = (filePath: string): IConfig => {

    const resolvedPath: string = path.resolve(process.cwd(), filePath);
    const config: IConfig = loadConfigFile(resolvedPath);

    if (!config || !validateConfig(config)) {
        throw new Error(`Couldn't find any valid configuration`);
    }

    if (!config.browserslist) {
        loadBrowsersList(config);
    }

    /*
     * If an `extends` property is defined, it represents a configuration file to use as
     * a "parent". Load the referenced file and merge the configuration recursively.
     */

    /*
     * if (configOptions.extends) {
     *     configOptions = applyExtends(configOptions, filePath, dirname);
     * }
     *
     * if (configOptions.env && applyEnvironments) {
     *     // Merge in environment-specific globals and parserOptions.
     *     configOptions = ConfigOps.applyEnvironments(configOptions);
     * }
     */

    return config;
};

/**
 * Retrieves the configuration filename for a given directory. It loops over all
 * of the valid configuration filenames in order to find the first one that exists.
 */
export const getFilenameForDirectory = (directory: string): string | null => {

    for (let i = 0, len = CONFIG_FILES.length; i < len; i++) {
        const filename: string = path.join(directory, CONFIG_FILES[i]);

        if (shell.test('-f', filename)) {
            return filename;
        }
    }

    return null;
};

// ------------------------------------------------------------------------

/**
 * Calculates the final configuration taking into account any `extends` fields.
 * Configurations for `extends` are applied left to right.
 *
 */
const composeConfig = (userConfig: IConfig) => {
    if (!userConfig.extends || !Array.isArray(userConfig.extends) || userConfig.extends.length === 0) {
        return userConfig;
    }

    const configurations = userConfig.extends.map((config) => {
        const loadedConfiguration = resourceLoader.loadConfiguration(config);

        if(!validateConfig(loadedConfiguration)){
            throw new Error(`Configuration package "${config}" is not valid`);
        }

        return composeConfig(loadedConfiguration);
    });

    const finalConfig = _.merge({}, ...configurations, userConfig);

    return finalConfig;
};


export class SonarwhalConfig {

    private _connector;
    private _formatters: Array<IFormatter>;
    private _browserslist: Array<string> = [];
    private _rules;
    private parsers: Array<Parser>
    private _timeout: number = 60000;

    private constructor(userConfig: IConfig) {
        this._timeout = userConfig.rulesTimeout || this._timeout;

        return this;
    }

    /**
     * Loads a configuration file regardless of the source. Inspects the file path
     * to determine the correctly way to load the config file.
     */
    public static async loadFromPath(filePath: string) {
        /**
         * 1. Load the file from the HD
         * 2. Validate it's OK
         * 3. Read extends and validate they are OK
         * 4. Apply extends
         * 5. Load resources
         * 6. Return final configuration object with resources loaded
         */

        // 1
        const resolvedPath: string = path.resolve(process.cwd(), filePath);
        let userConfig: IConfig = loadConfigFile(resolvedPath);

        // 2
        if (!userConfig) {
            throw new Error(`Couldn't find a configuration file`);
        }

        if (!validateConfig(userConfig)) {
            throw new Error(`Couldn't find any valid configuration`);
        }

        // 3, 4
        userConfig = composeConfig(userConfig);

        if (!userConfig.browserslist) {
            loadBrowsersList(userConfig);
        }

        debug('Loading configuration');

        debug('Loading connector');

        if (!userConfig.connector) {
            throw new Error(`Connector not found in the configuration`);
        }

        if (typeof userConfig.connector === 'string') {
            this.connectorId = userConfig.connector;
            this.connectorConfig = {};
        } else {
            this.connectorId = userConfig.connector.name;
            this.connectorConfig = userConfig.connector.options;
        }

        this.connectorConfig = Object.assign(this.connectorConfig, { watch: userConfig.watch });

        debug('Loading supported browsers');
        if (!userConfig.browserslist || userConfig.browserslist.length === 0) {
            this.browserslist = browserslist();
        } else {
            this.browserslist = browserslist(userConfig.browserslist);
        }

        debug('Setting the selected formatters');
        if (Array.isArray(userConfig.formatters)) {
            this._formatters = userConfig.formatters;
        } else {
            this._formatters = [userConfig.formatters];
        }

        debug('Initializing ignored urls');
        this.ignoredUrls = new Map();
        if (userConfig.ignoredUrls) {
            userConfig.ignoredUrls.forEach((ignoredUrl: IgnoredUrl) => {
                const { domain: urlRegexString, rules } = ignoredUrl;

                rules.forEach((rule: string) => {
                    const ruleName = rule === '*' ? 'all' : rule;

                    const urlsInRule: Array<RegExp> = this.ignoredUrls.get(ruleName);
                    const urlRegex: RegExp = new RegExp(urlRegexString, 'i');

                    if (!urlsInRule) {
                        this.ignoredUrls.set(ruleName, [urlRegex]);
                    } else {
                        urlsInRule.push(urlRegex);
                    }
                });
            });
        }

        const connectorBuilder: IConnectorBuilder = resourceLoader.loadConnector(this.connectorId);

        if (!connectorBuilder) {
            throw new Error(`Connector "${this.connectorId}" not found`);
        }

        this.connector = connectorBuilder(this, this.connectorConfig);
        this.initParsers(userConfig);
        this.initRules(userConfig);

        return new SonarwhalConfig(userConfig);
    }
}
