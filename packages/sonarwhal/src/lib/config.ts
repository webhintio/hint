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

import * as browserslist from 'browserslist';
import * as shell from 'shelljs';
import * as _ from 'lodash';

import { debug as d } from './utils/debug';
import { UserConfig, IgnoredUrl, CLIOptions, ConnectorConfig, RulesConfigObject } from './types';
import { loadJSFile, loadJSONFile } from './utils/misc';
import { validateConfig } from './config/config-validator';
import normalizeRules from './config/normalize-rules';
import { validate as validateRule } from './config/config-rules';
import * as resourceLoader from './utils/resource-loader';

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
const loadPackageJSONConfigFile = (filePath: string): UserConfig => {

    debug(`Loading package.json config file: ${filePath}`);

    try {
        return loadJSONFile(filePath).sonarwhalConfig || null;
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
const composeConfig = (userConfig: UserConfig) => {
    /*
     * If an `extends` property is defined, it represents a configuration package to use as
     * a "parent". Load the configuration and merge recursively.
     */

    debug('Composing configuration from extends');

    if (!userConfig.extends || !Array.isArray(userConfig.extends) || userConfig.extends.length === 0) {
        return userConfig;
    }

    const configurations = userConfig.extends.map((config) => {
        const loadedConfiguration = resourceLoader.loadConfiguration(config);

        if (!validateConfig(loadedConfiguration)) {
            throw new Error(`Configuration package "${config}" is not valid`);
        }

        return composeConfig(loadedConfiguration);
    });

    const finalConfig = _.merge({}, ...configurations, userConfig);

    return finalConfig;
};

const loadIgnoredUrls = (userConfig: UserConfig): Map<string, RegExp[]> => {
    debug('Initializing ignored urls');

    const ignoredUrls: Map<string, RegExp[]> = new Map();

    if (userConfig.ignoredUrls) {
        userConfig.ignoredUrls.forEach((ignoredUrl: IgnoredUrl) => {
            const { domain: urlRegexString, rules } = ignoredUrl;

            rules.forEach((rule: string) => {
                const ruleName = rule === '*' ? 'all' : rule;

                const urlsInRule: Array<RegExp> = ignoredUrls.get(ruleName);
                const urlRegex: RegExp = new RegExp(urlRegexString, 'i');

                if (!urlsInRule) {
                    ignoredUrls.set(ruleName, [urlRegex]);
                } else {
                    urlsInRule.push(urlRegex);
                }
            });
        });
    }

    return ignoredUrls;
};

/**
 * Build and return a rules config object where the key is the rule name and the value is the severity
 */
const buildRulesConfigFromRuleNames = (ruleNames: string[], severity: string): RulesConfigObject => {
    const ruleConfig: RulesConfigObject = {};

    for (const ruleName of ruleNames) {
        ruleConfig[ruleName] = severity;
    }

    return ruleConfig;
};

/**
 * Overrides the config values with values obtained from the CLI, if any
 */
const updateConfigWithCommandLineValues = (config: UserConfig, actions: CLIOptions) => {
    debug('overriding config settings with values provided via CLI');

    // If formatters are provided, use them
    if (actions && actions.formatters) {
        config.formatters = actions.formatters.split(',');
        debug(`Using formatters option provided from command line: ${actions.formatters}`);
    }

    // If rules are provided, use them
    if (actions && actions.rules) {
        const ruleNames = actions.rules.split(',');

        config.rules = buildRulesConfigFromRuleNames(ruleNames, 'error');
        debug(`Using rules option provided from command line: ${actions.rules}`);
    }
};

export class SonarwhalConfig {
    public readonly browserslist: Array<string>;
    public readonly connector: ConnectorConfig;
    public readonly formatters: Array<string>;
    public readonly ignoredUrls;
    public readonly parsers: Array<string>;
    public readonly rules: RulesConfigObject;
    public readonly rulesTimeout: number;
    public readonly extends: Array<string>;

    private constructor(userConfig: UserConfig, browsers: Array<string>, ignoredUrls, rules: RulesConfigObject) {
        this.browserslist = browsers;
        this.formatters = userConfig.formatters;
        this.ignoredUrls = ignoredUrls;
        this.parsers = userConfig.parsers;
        this.rules = rules;
        this.extends = userConfig.extends;

        this.rulesTimeout = userConfig.rulesTimeout || 60000;

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
     * Generates the list of browsers to target using the `browserslist` property
     * of the `sonarwhal` configuration or `package.json` or uses the default one
     */
    public static loadBrowsersList(config: UserConfig) {
        const directory: string = process.cwd();
        const files: Array<string> = CONFIG_FILES.reduce((total, configFile) => {
            const filename: string = path.join(directory, configFile);

            if (shell.test('-f', filename)) {
                total.push(filename);
            }

            return total;
        }, []);

        if (!config.browserslist) {
            for (let i = 0; i < files.length; i++) {
                const file: string = files[i];
                const tmpConfig: UserConfig = SonarwhalConfig.loadConfigFile(file);

                if (tmpConfig && tmpConfig.browserslist) {
                    config.browserslist = tmpConfig.browserslist;
                    break;
                }

                if (file.endsWith('package.json')) {
                    const packagejson = loadJSONFile(file);

                    config.browserslist = packagejson.browserslist;
                }
            }
        }

        if (!config.browserslist || config.browserslist.length === 0) {
            return browserslist();
        }

        return browserslist(config.browserslist);
    }


    /**
     * Loads a configuration file regardless of the source. Inspects the file path
     * to determine the correctly way to load the config file.
     */
    public static loadConfigFile(filePath: string): UserConfig {
        let config: UserConfig;

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
    }

    public static fromConfig(config: UserConfig, actions?: CLIOptions): SonarwhalConfig {

        if (!config) {
            throw new Error(`Couldn't find a configuration file`);
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

        // In case the user uses the --watch flag when running sonarwhal
        if (actions && actions.watch) {
            userConfig.connector.options.watch = actions.watch;
        }

        updateConfigWithCommandLineValues(userConfig, actions);

        if (userConfig.formatters && !Array.isArray(userConfig.formatters)) {
            userConfig.formatters = [userConfig.formatters];
        }

        const browsers = browserslist(config.browserslist);
        const ignoredUrls = loadIgnoredUrls(userConfig);
        const rules = normalizeRules(userConfig.rules);

        return new SonarwhalConfig(userConfig, browsers, ignoredUrls, normalizeRules(rules));
    }

    /**
     * Separate rules based on if the rule configs are valid.
     * @param config
     */
    public static validateRulesConfig(config: SonarwhalConfig) {
        const rules = Object.keys(config.rules);
        const validateResult = rules.reduce((result, rule) => {
            const Rule = resourceLoader.loadRule(rule, config.extends);
            const valid: boolean = validateRule(Rule.meta, config.rules[rule], rule);

            if (!valid) {
                result.invalid.push(rule);
            } else {
                result.valid.push(rule);
            }

            return result;
        }, { invalid: [], valid: [] });

        return validateResult;
    }

    /**
     * Loads a configuration file regardless of the source. Inspects the file path
     * to determine the correctly way to load the config file.
     */
    public static fromFilePath(filePath: string, actions: CLIOptions): SonarwhalConfig {
        /**
         * 1. Load the file from the HD
         * 2. Validate it's OK
         * 3. Read extends and validate they are OK
         * 4. Apply extends
         * 6. Return final configuration object with defaults if needed
         */

        // 1
        const resolvedPath: string = path.resolve(process.cwd(), filePath);
        const userConfig = SonarwhalConfig.loadConfigFile(resolvedPath);
        const config = this.fromConfig(userConfig, actions);

        userConfig.browserslist = userConfig.browserslist || SonarwhalConfig.loadBrowsersList(userConfig);

        return config;
    }

    /**
     * Retrieves the configuration filename for a given directory. It loops over all
     * of the valid configuration filenames in order to find the first one that exists.
     * If no valid file is found in that directory, it will look into `os.homedir()`.
     */
    public static getFilenameForDirectory = (directory: string): string | null => {

        for (let i = 0, len = CONFIG_FILES.length; i < len; i++) {
            const filename: string = path.join(directory, CONFIG_FILES[i]);

            if (shell.test('-f', filename)) {
                return filename;
            }
        }

        const homedir = os.homedir();

        // If we reach this point we've tested in the original directory and homedir
        if (directory === homedir) {
            return null;
        }

        return SonarwhalConfig.getFilenameForDirectory(homedir);
    };
}
