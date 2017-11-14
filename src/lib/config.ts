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

import { debug as d } from './utils/debug';
import { IConfig } from './types';
import { loadJSFile, loadJSONFile } from './utils/misc';
import { validateConfig } from './config/config-validator';

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
