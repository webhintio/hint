/**
 * @fileoverview Loads the configuration file
 * @author Anton Molleda (based on ESLint code: https://github.com/eslint/eslint/blob/master/lib/config/config-file.js)
 */

/* eslint no-use-before-define: 0 */

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

const fs = require('fs'),
    path = require('path');

const shell = require('shelljs'),
    stripBom = require('strip-bom'),
    stripComments = require('strip-json-comments'),
    // stringify = require('json-stable-stringify'),
    requireUncached = require('require-uncached');

const debug = require('debug')('eslint:config-file');

// ------------------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------------------

/**
 * Determines sort order for object keys for json-stable-stringify
 *
 * see: https://github.com/substack/json-stable-stringify#cmp
 *
 * @param   {Object} a The first comparison object ({key: akey, value: avalue})
 * @param   {Object} b The second comparison object ({key: bkey, value: bvalue})
 * @returns {number}   1 or -1, used in stringify cmp method
 */
// function sortByKey(a, b) {
//     return a.key > b.key ? 1 : -1;
// }

// ------------------------------------------------------------------------------
// Private
// ------------------------------------------------------------------------------

const CONFIG_FILES = [
    '.sonarrc.js',
    '.sonarrc.yaml',
    '.sonarrc.yml',
    '.sonarrc.json',
    'package.json'
];

/**
 * Convenience wrapper for synchronously reading file contents.
 * @param {string} filePath The filename to read.
 * @returns {string} The file contents.
 * @private
 */
const readFile = (filePath) => {
    return stripBom(fs.readFileSync(filePath, 'utf8')); // eslint-disable-line no-sync
};

/**
 * Determines if a given string represents a filepath or not using the same
 * conventions as require(), meaning that the first character must be nonalphanumeric
 * and not the @ sign which is used for scoped packages to be considered a file path.
 * @param {string} filePath The string to check.
 * @returns {boolean} True if it's a filepath, false if not.
 * @private
 */
// function isFilePath(filePath) {
//     return path.isAbsolute(filePath) || !(/\w|@/).test(filePath.charAt(0));
// }

/**
 * Loads a YAML configuration from a file.
 * @param {string} filePath The filename to load.
 * @returns {Object} The configuration object from the file.
 * @throws {Error} If the file cannot be read.
 * @private
 */
const loadYAMLConfigFile = (filePath) => {
    debug(`Loading YAML config file: ${filePath}`);

    // lazy load YAML to improve performance when not used
    const yaml = require('js-yaml');

    try {
        // empty YAML file can be null, so always use
        return yaml.safeLoad(readFile(filePath)) || {};
    } catch (e) {
        debug(`Error reading YAML file: ${filePath}`);
        e.message = `Cannot read config file: ${filePath}\nError: ${e.message}`;
        throw e;
    }
};

/**
 * Loads a JSON configuration from a file.
 * @param {string} filePath The filename to load.
 * @returns {Object} The configuration object from the file.
 * @throws {Error} If the file cannot be read.
 * @private
 */
const loadJSONConfigFile = (filePath) => {
    debug(`Loading JSON config file: ${filePath}`);

    try {
        return JSON.parse(stripComments(readFile(filePath)));
    } catch (e) {
        debug(`Error reading JSON file: ${filePath}`);
        e.message = `Cannot read config file: ${filePath}\nError: ${e.message}`;
        throw e;
    }
};

/**
 * Loads a JavaScript configuration from a file.
 * @param {string} filePath The filename to load.
 * @returns {Object} The configuration object from the file.
 * @throws {Error} If the file cannot be read.
 * @private
 */
const loadJSConfigFile = (filePath) => {
    debug(`Loading JS config file: ${filePath}`);
    try {
        return requireUncached(filePath);
    } catch (e) {
        debug(`Error reading JavaScript file: ${filePath}`);
        e.message = `Cannot read config file: ${filePath}\nError: ${e.message}`;
        throw e;
    }
};

/**
 * Loads a configuration from a package.json file.
 * @param {string} filePath The filename to load.
 * @returns {Object} The configuration object from the file.
 * @throws {Error} If the file cannot be read.
 * @private
 */
const loadPackageJSONConfigFile = (filePath) => {
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
 * @param {Object} file The path to the configuration.
 * @returns {Object} The configuration information.
 * @private
 */
const loadConfigFile = (filePath) => {
    let config;

    switch (path.extname(filePath)) {
        case '.js':
            config = loadJSConfigFile(filePath);
            break;

        case '.json':
            if (path.basename(filePath) === 'package.json') {
                config = loadPackageJSONConfigFile(filePath);
                if (config === null) {
                    return null;
                }
            } else {
                config = loadJSONConfigFile(filePath);
            }
            break;

        case '.yaml':
        case '.yml':
            config = loadYAMLConfigFile(filePath);
            break;

        default:
            config = {};
    }

    return config;
};

/**
 * Loads a configuration file from the given file path.
 * @param {string} filePath The filename or package name to load the configuration
 *      information from.
 * @param {boolean} [applyEnvironments=false] Set to true to merge in environment settings.
  * @returns {Object} The configuration information.
 * @private
 */
const load = (filePath) => {
    const resolvedPath = path.resolve(process.cwd(), filePath),
        config = loadConfigFile(resolvedPath);

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

    return config;
};

// ------------------------------------------------------------------------------
// Public Interface
// ------------------------------------------------------------------------------

module.exports = {
    CONFIG_FILES,
    /**
     * Retrieves the configuration filename for a given directory. It loops over all
     * of the valid configuration filenames in order to find the first one that exists.
     * @param {string} directory The directory to check for a config file.
     * @returns {?string} The filename of the configuration file for the directory
     *      or null if there is no configuration file in the directory.
     */
    getFilenameForDirectory(directory) {
        for (let i = 0, len = CONFIG_FILES.length; i < len; i++) {
            const filename = path.join(directory, CONFIG_FILES[i]);

            if (shell.test('-f', filename)) {
                return filename;
            }
        }

        return null;
    },
    load
};
