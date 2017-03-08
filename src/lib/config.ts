/**
 * @fileoverview Loads the configuration file
 * @author Anton Molleda (based on ESLint code: https://github.com/eslint/eslint/blob/master/lib/config/config-file.js)
 */

/* eslint no-use-before-define: 0 */

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

import * as fs from 'fs';
import * as path from 'path';

import * as shell from 'shelljs';
import * as stripBom from 'strip-bom';
import * as stripComments from 'strip-json-comments';
// stringify = require('json-stable-stringify'),
import * as requireUncached from 'require-uncached';

const debug = require('debug')('eslint:config-file');

interface Config {
    sonarConfig?
}

// ------------------------------------------------------------------------------
// Private
// ------------------------------------------------------------------------------

const CONFIG_FILES = [
    '.sonarrc',
    '.sonarrc.js',
    '.sonarrc.json',
    'package.json'
];

/** Convenience wrapper for synchronously reading file contents. */
const readFile = (filePath: string): Config => {
    return stripBom(fs.readFileSync(filePath, 'utf8')); // eslint-disable-line no-sync
};

/** Loads a JSON configuration from a file. */
const loadJSONConfigFile = (filePath: string): Config => {
    debug(`Loading JSON config file: ${filePath}`);

    try {
        return JSON.parse(stripComments(readFile(filePath)));
    } catch (e) {
        debug(`Error reading JSON file: ${filePath}`);
        e.message = `Cannot read config file: ${filePath}\nError: ${e.message}`;
        throw e;
    }
};

/** Loads a JavaScript configuration from a file. */
const loadJSConfigFile = (filePath: string): Config => {
    debug(`Loading JS config file: ${filePath}`);
    try {
        return requireUncached(filePath);
    } catch (e) {
        debug(`Error reading JavaScript file: ${filePath}`);
        e.message = `Cannot read config file: ${filePath}\nError: ${e.message}`;
        throw e;
    }
};

/** Loads a configuration from a package.json file. */
const loadPackageJSONConfigFile = (filePath: string): Config => {
    debug(`Loading package.json config file: ${filePath}`);
    try {
        return loadJSONConfigFile(filePath).sonarConfig || null;
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
const loadConfigFile = (filePath: string): Config => {
    let config;

    switch (path.extname(filePath)) {
        case '':
        case '.json':
            if (path.basename(filePath) === 'package.json') {
                config = loadPackageJSONConfigFile(filePath);
            } else {
                config = loadJSONConfigFile(filePath);
            }
            break;

        case '.js':
            config = loadJSConfigFile(filePath);
            break;

        default:
            config = {};
    }

    return config;
};

/** Loads a configuration file from the given file path. */
export const load = (filePath: string): Config => {
    const resolvedPath = path.resolve(process.cwd(), filePath);
    const config = loadConfigFile(resolvedPath);

    if (!config) {
        throw new Error(`Couldn't find any valid configuration`);
    }

    /*
     * If an `extends` property is defined, it represents a configuration file to use as
     * a "parent". Load the referenced file and merge the configuration recursively.
     */
    // if (configOptions.extends) {
    //     configOptions = applyExtends(configOptions, filePath, dirname);
    // }

    // if (configOptions.env && applyEnvironments) {
    //     // Merge in environment-specific globals and parserOptions.
    //     configOptions = ConfigOps.applyEnvironments(configOptions);
    // }

    // We load the default configuration so we have something to get started.
    const defaultConfig = loadJSConfigFile('./config/config-default.json');

    return Object.assign({}, config, defaultConfig);
};

/**
 * Retrieves the configuration filename for a given directory. It loops over all
 * of the valid configuration filenames in order to find the first one that exists.
 */
export const getFilenameForDirectory = (directory: string): string | null => {
    for (let i = 0, len = CONFIG_FILES.length; i < len; i++) {
        const filename = path.join(directory, CONFIG_FILES[i]);

        if (shell.test('-f', filename)) {
            return filename;
        }
    }

    return null;
};
