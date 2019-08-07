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

import * as os from 'os';
import * as path from 'path';

import browserslist = require('browserslist'); // `require` used because `browserslist` exports a function
import mergeWith = require('lodash/mergeWith');

import { debug as d, fs as fsUtils, toAbsolutePaths } from '@hint/utils';
import { validate as schemaValidator } from '@hint/utils/dist/src/schema-validation/schema-validator';

import { UserConfig, IgnoredUrl, ConnectorConfig, HintsConfigObject, HintSeverity, CreateAnalyzerOptions } from './types';
import { validateConfig } from './config/config-validator';
import normalizeHints from './config/normalize-hints';
import { validate as validateHint, getSeverity } from './config/config-hints';
import * as resourceLoader from './utils/resource-loader';
import { ResourceType } from './enums';
import { IConnectorConstructor } from './types/connector';

const { isFile, loadJSFile, loadJSONFile} = fsUtils;

const debug: debug.IDebugger = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Private
 * ------------------------------------------------------------------------------
 */

const CONFIG_FILES = [
    '.hintrc',
    '.hintrc.js',
    '.hintrc.json',
    'package.json'
];

/** Loads a configuration from a package.json file. */
const loadPackageJSONConfigFile = (filePath: string): UserConfig => {

    debug(`Loading package.json config file: ${filePath}`);

    try {
        return loadJSONFile(filePath).hintConfig || null;
    } catch (e) {
        debug(`Error reading package.json file: ${filePath}`);
        e.message = `Cannot read config file: ${filePath}\nError: ${e.message}`;
        throw e;
    }
};

// ------------------------------------------------------------------------

/**
 * Calculates the final configuration taking into account any `extends` fields.
 * Configurations for `extends` are applied left to right.
 *
 */
const composeConfig = (userConfig: UserConfig, parentConfig = '') => {
    /*
     * If an `extends` property is defined, it represents a configuration package to use as
     * a "parent". Load the configuration and merge recursively.
     */

    debug('Composing configuration from extends');

    if (!userConfig.extends || !Array.isArray(userConfig.extends) || userConfig.extends.length === 0) {
        return userConfig;
    }

    const configurations = userConfig.extends.map((config) => {
        const loadedConfiguration = resourceLoader.loadConfiguration(config, [parentConfig]);

        if (!validateConfig(loadedConfiguration)) {
            throw new Error(`Configuration package "${config}" is not valid`);
        }

        return composeConfig(loadedConfiguration, config);
    });

    const finalConfig: UserConfig = mergeWith({}, ...configurations, userConfig, (objValue: any, srcValue: any) => {
        // Arrays need to be concatented, not merged.
        if (Array.isArray(objValue) && Array.isArray(srcValue)) {
            return objValue.concat(srcValue);
        }

        return void 0;
    });

    // The formatters defined by the user has to overwritte the one in the extends.
    finalConfig.formatters = userConfig.formatters ? userConfig.formatters : finalConfig.formatters;

    if (finalConfig.formatters) {
        finalConfig.formatters = Array.from(new Set(finalConfig.formatters));
    }

    // Otherwise the output could be double or we could trigger double events
    if (finalConfig.parsers) {
        finalConfig.parsers = Array.from(new Set(finalConfig.parsers));
    }

    return finalConfig;
};

const loadIgnoredUrls = (userConfig: UserConfig): Map<string, RegExp[]> => {
    debug('Initializing ignored urls');

    const ignoredUrls: Map<string, RegExp[]> = new Map();

    if (userConfig.ignoredUrls) {
        userConfig.ignoredUrls.forEach((ignoredUrl: IgnoredUrl) => {
            const { domain: urlRegexString, hints } = ignoredUrl;

            hints.forEach((hint: string) => {
                const hintName = hint === '*' ? 'all' : hint;

                const urlsInHint: RegExp[] | undefined = ignoredUrls.get(hintName);
                const urlRegex: RegExp = new RegExp(urlRegexString, 'i');

                if (!urlsInHint) {
                    ignoredUrls.set(hintName, [urlRegex]);
                } else {
                    urlsInHint.push(urlRegex);
                }
            });
        });
    }

    return ignoredUrls;
};

/**
 * Build and return a hints config object where the key is the hint name and the value is the severity
 */
const buildHintsConfigFromHintNames = (hintNames: string[], severity: HintSeverity): HintsConfigObject => {
    const hintConfig: HintsConfigObject = {};

    for (const hintName of hintNames) {
        hintConfig[hintName] = severity;
    }

    return hintConfig;
};

/**
 * Overrides the config values with values obtained from the CLI, if any
 */
const updateConfigWithOptionsValues = (config: UserConfig, options: CreateAnalyzerOptions = {}) => {
    debug('overriding config settings with values provided via CLI');

    // If formatters are provided, use them
    if (options.formatters) {
        config.formatters = options.formatters;
        debug(`Using formatters option provided from Analyzer options: ${options.formatters.join(', ')}`);
    }

    // If hints are provided, use them
    if (options.hints) {
        config.hints = buildHintsConfigFromHintNames(options.hints, 'error');
        debug(`Using hints option provided from command line: ${options.hints.join(', ')}`);
    }
};

export class Configuration {
    public readonly browserslist: string[];
    public readonly connector: ConnectorConfig | undefined;
    public readonly formatters: string[] | undefined;
    public readonly ignoredUrls: Map<string, RegExp[]>;
    public readonly parsers: string[] | undefined;
    public readonly hints: HintsConfigObject;
    public readonly hintsTimeout: number;
    public readonly extends: string[] | undefined;
    public readonly language: string | undefined;

    private constructor(userConfig: UserConfig, browsers: string[], ignoredUrls: Map<string, RegExp[]>, hints: HintsConfigObject) {
        this.browserslist = browsers;
        this.formatters = userConfig.formatters;
        this.ignoredUrls = ignoredUrls;
        this.parsers = userConfig.parsers;
        this.hints = hints;
        this.extends = userConfig.extends;
        this.language = userConfig.language;

        this.hintsTimeout = userConfig.hintsTimeout || 60000;

        if (typeof userConfig.connector === 'string') {
            this.connector = {
                name: userConfig.connector,
                options: {}
            };
        } else {
            this.connector = userConfig.connector;
        }
    }

    /**
     * Removes all the deactivated hints.
     */
    private static cleanHints(hints: HintsConfigObject): HintsConfigObject {
        return Object.entries(hints).reduce((total, [key, value]) => {
            if (getSeverity(value)) {
                total[key] = value;
            }

            return total;
        }, {} as HintsConfigObject);
    }

    /**
     * Loads a configuration file regardless of the source. Inspects the file path
     * to determine the correctly way to load the config file.
     */
    public static loadConfigFile(filePath: string): UserConfig | null {
        let config: UserConfig | null;

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

        config = this.toAbsolutePaths(config, filePath);

        return config;
    }

    /**
     * Transforms any relative paths in the configuration to absolute using
     * the value of `configPath`. `configPath` needs to be a folder.
     * The values that can be changed are:
     * * `connector`'s value: `{ "connector": "./myconnector" }`
     * * `connector.name` value: `{ "connector": { "name": "./myconnector"} }`
     * * `formatter`s and `parser`s  values: `{ "formatters": ["./myformatter"] }`
     * * `hint`s keys: `{ "hints: { "./myhint": "warning" } }`
     */
    public static toAbsolutePaths(config: UserConfig | null, configRoot: string): UserConfig | null {
        return toAbsolutePaths(config, configRoot);
    }

    public static fromConfig(config: UserConfig | null, options?: CreateAnalyzerOptions): Configuration {

        if (!config) {
            throw new Error(`Couldn't find a configuration`);
        }

        if (!validateConfig(config)) {
            throw new Error(`Couldn't find any valid configuration`);
        }

        // 3, 4
        const userConfig = composeConfig(config);

        if (typeof userConfig.connector === 'string') {
            userConfig.connector = {
                name: userConfig.connector,
                options: {}
            };
        }

        // In case the user uses the --watch flag when running hint
        if (options && options.watch && userConfig.connector && userConfig.connector.options) {
            userConfig.connector.options.watch = options.watch;
        }

        updateConfigWithOptionsValues(userConfig, options);

        if (userConfig.formatters && !Array.isArray(userConfig.formatters)) {
            userConfig.formatters = [userConfig.formatters];
        }

        const browsers = browserslist(config.browserslist);
        const ignoredUrls = loadIgnoredUrls(userConfig);
        const hints = Configuration.cleanHints(normalizeHints(userConfig.hints!)); // `userConfig.hints` should not be `null` due to `validateConfig` check above

        return new Configuration(userConfig, browsers, ignoredUrls, hints);
    }

    public static validateConnectorConfig(config: Configuration) {
        const connectorId = config.connector!.name;

        debug(`Validating ${connectorId} connector`);

        const Connector = resourceLoader.loadResource(connectorId, ResourceType.connector) as IConnectorConstructor;

        debug(`Connector schema:`);
        debug(Connector.schema);
        debug(`User configuration:`);
        debug(config.connector!.options!);

        return schemaValidator(Connector.schema, config.connector!.options!).valid;
    }

    /**
     * Separate hints based on if the hint configs are valid.
     * @param config
     */
    public static validateHintsConfig(config: Configuration) {
        const hints = Object.keys(config.hints);
        const validateResult = hints.reduce((result, hint) => {
            const Hint = resourceLoader.loadHint(hint, config.extends);
            const valid: boolean = validateHint(Hint.meta, config.hints[hint], hint);

            if (!valid) {
                result.invalid.push(hint);
            } else {
                result.valid.push(hint);
            }

            return result;
        }, { invalid: [] as string[], valid: [] as string[] });

        return validateResult;
    }

    /**
     * Retrieves the configuration filename for a given directory. It loops over all
     * of the valid configuration filenames in order to find the first one that exists.
     * If no valid file is found in that directory, it will look into `os.homedir()`.
     */
    public static getFilenameForDirectory = (directory: string): string | null => {

        for (let i = 0, len = CONFIG_FILES.length; i < len; i++) {
            const filename: string = path.join(directory, CONFIG_FILES[i]);

            if (isFile(filename)) {
                return filename;
            }
        }

        const homedir = os.homedir();

        // If we reach this point we've tested in the original directory and homedir
        if (directory === homedir) {
            return null;
        }

        return Configuration.getFilenameForDirectory(homedir);
    };
}
