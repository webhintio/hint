/**
 * @fileoverview Loads the configuration file
 *
 * Based on ESLint's config-file
 * https://github.com/eslint/eslint/blob/master/lib/config/config-file.js
 */

/* eslint no-use-before-define: 0 */

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

import * as fs from 'fs';
import * as path from 'path';

import * as inquirer from 'inquirer';
import * as pify from 'pify';
import * as shell from 'shelljs';

import { debug as d } from './utils/debug';
import { IConfig } from './types'; //eslint-disable-line no-unused-vars
import * as logger from './utils/logging';
import { loadJSFile, loadJSONFile } from './utils/file-loader';
import * as resourceLoader from './utils/resource-loader';

const debug = d(__filename);

// ------------------------------------------------------------------------------
// Private
// ------------------------------------------------------------------------------

const CONFIG_FILES = [
    '.sonarrc',
    '.sonarrc.js',
    '.sonarrc.json',
    'package.json'
];

/** Loads a configuration from a package.json file. */
const loadPackageJSONConfigFile = (filePath: string): IConfig => {

    debug(`Loading package.json config file: ${filePath}`);

    try {
        return loadJSONFile(filePath).sonarConfig || null;
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

    let config;

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
    const directory = process.cwd();
    const files = CONFIG_FILES.reduce((total, configFile) => {
        const filename = path.join(directory, configFile);

        if (shell.test('-f', filename)) {
            total.push(filename);
        }

        return total;
    }, []);

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const tmpConfig = loadConfigFile(file);

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

    const resolvedPath = path.resolve(process.cwd(), filePath);
    const config = loadConfigFile(resolvedPath);

    if (!config) {
        throw new Error(`Couldn't find any valid configuration`);
    }

    if (!config.browserslist) {
        loadBrowsersList(config);
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

export const generate = async () => {
    const collectorKeys = [...resourceLoader.getCollectors().keys()];
    const formattersKeys = [...resourceLoader.getFormatters().keys()];
    const rules = resourceLoader.getRules();
    const rulesKeys = [];
    const sonarConfig = {
        browserslist: '',
        collector: {
            name: '',
            options: {}
        },
        formatter: 'json',
        ignoredUrls: {},
        rules: {}
    };

    for (const [key, rule] of rules) {
        rulesKeys.push({
            name: `${key} - ${rule.meta.docs.description}`,
            value: key
        });
    }

    logger.log('Welcome to Sonar configuration generator');

    const questions = [
        {
            choices: collectorKeys,
            message: 'What collector do you want to use?',
            name: 'collector',
            type: 'list'
        },
        {
            choices: formattersKeys,
            message: 'What formatter do you want to use?',
            name: 'formatter',
            type: 'list'
        },
        {
            choices: [{
                name: 'Yes',
                value: true
            },
            {
                name: 'No',
                value: false
            }],
            message: 'Do you want to use the recommended rules configuration?',
            name: 'default',
            type: 'list'
        },
        {
            choices: rulesKeys,
            message: 'Choose the rules you want to add to your configuration',
            name: 'rules',
            pageSize: 15,
            type: 'checkbox',
            when: (answers) => {
                return !answers.default;
            }
        }
    ];

    const results = await inquirer.prompt(questions);

    sonarConfig.collector.name = results.collector;
    sonarConfig.formatter = results.formatter;

    if (results.default) {
        logger.log('Using recommended rules');
        rules.forEach((rule, key) => {
            if (rule.meta.recommended) {
                sonarConfig.rules[key] = 'error';
            } else {
                sonarConfig.rules[key] = 'off';
            }
        });
    } else {
        rules.forEach((rule, key) => {
            if (results.rules.includes(key)) {
                sonarConfig.rules[key] = 'error';
            } else {
                sonarConfig.rules[key] = 'off';
            }
        });
    }

    const filePath = path.join(process.cwd(), '.sonarrc');

    return pify(fs.writeFile)(filePath, JSON.stringify(sonarConfig, null, 4), 'utf8');
};
