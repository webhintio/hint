/**
 * @fileoverview Generates a valid `.sonarwhalrc` file based on user responses.
 */

/*
 * ------------------------------------------------------------------------------
 * Requirements
 * ------------------------------------------------------------------------------
 */

import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

import * as inquirer from 'inquirer';

import { CLIOptions, UserConfig } from '../types';
import { debug as d } from '../utils/debug';
import * as logger from '../utils/logging';
import { getInstalledResources, getCoreResources } from '../utils/resource-loader';
import { ResourceType } from '../enums/resourcetype';
import { generateBrowserslistConfig } from './browserslist';
import { getOfficialPackages, installPackages } from '../utils/npm';
import { NpmPackage } from '../types';

const debug: debug.IDebugger = d(__filename);
const defaultFormatter = 'summary';

/** Validates if the given array is not empty and if so, prints an error message. */
const anyResources = (resources: Array<any>, type: string) => {
    if (resources.length > 0) {
        return true;
    }

    logger.error(`Couldn't find any installed ${type}s. Visit https://www.npmjs.com/search?q=%40sonarwhal%2F${type}.`);

    return false;
};


/** Shwos the user a list of official configuration packages available in npm to install. */
const extendConfig = async (): Promise<UserConfig> => {
    const configPackages: Array<NpmPackage> = await getOfficialPackages(ResourceType.configuration);

    if (!anyResources(configPackages, ResourceType.configuration)) {
        return null;
    }

    const choices = configPackages.map((pkg) => {
        return pkg.name;
    });

    const questions: inquirer.Questions = [{
        choices,
        message: 'Choose the configuration you want to extend from',
        name: 'configuration',
        pageSize: 15,
        type: 'list'
    }];

    const answers: inquirer.Answers = await inquirer.prompt(questions);
    const sonarwhalConfig = { extends: [answers.configuration] };
    const installed = await installPackages([answers.configuration]);

    // Maybe there was an error during the installation, the error and message output is handled in the npm package
    if (!installed) {
        return null;
    }

    return sonarwhalConfig;
};

/** Prompts a series of questions to create a new configuration object based on the installed packages. */
const customConfig = async (): Promise<UserConfig> => {
    const connectorKeys: Array<inquirer.ChoiceType> = getInstalledResources(ResourceType.connector).concat(getCoreResources(ResourceType.connector));
    const formattersKeys: Array<inquirer.ChoiceType> = getInstalledResources(ResourceType.formatter).concat(getCoreResources(ResourceType.formatter));
    const parsersKeys: Array<inquirer.ChoiceType> = getInstalledResources(ResourceType.parser).concat(getCoreResources(ResourceType.parser));
    const rulesKeys: Array<inquirer.ChoiceType> = getInstalledResources(ResourceType.rule).concat(getCoreResources(ResourceType.rule));

    if (!anyResources(connectorKeys, ResourceType.connector) ||
        !anyResources(formattersKeys, ResourceType.formatter) ||
        !anyResources(rulesKeys, ResourceType.rule)) {

        return null;
    }

    const customQuestions: inquirer.Questions = [
        {
            choices: connectorKeys,
            message: 'What connector do you want to use?',
            name: 'connector',
            type: 'list'
        },
        {
            choices: formattersKeys,
            default: defaultFormatter,
            message: 'What formatter do you want to use?',
            name: 'formatter',
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

    // Parsers are not mandatory
    if (parsersKeys.length > 0) {
        customQuestions.push({
            choices: parsersKeys,
            message: 'What parsers do you want to use?',
            name: 'parsers',
            pageSize: 15,
            type: 'checkbox'
        });
    }

    const results: inquirer.Answers = await inquirer.prompt(customQuestions);

    const sonarwhalConfig = {
        browserslist: [],
        connector: {
            name: '',
            options: { waitFor: 1000 }
        },
        extends: [],
        formatters: [defaultFormatter],
        ignoredUrls: [],
        rules: {},
        rulesTimeout: 120000
    };

    sonarwhalConfig.connector.name = results.connector;
    sonarwhalConfig.formatters = [results.formatter];

    results.rules.forEach((rule) => {
        sonarwhalConfig.rules[rule] = 'error';
    });

    sonarwhalConfig.browserslist = await generateBrowserslistConfig();

    return sonarwhalConfig;
};

/**
 * Initiates a wizard to generate a valid `.sonarwhalrc` file based on:
 * * an existing published configuration package
 * * the installed resources
 */
export const initSonarwhalrc = async (options: CLIOptions): Promise<boolean> => {
    if (!options.init) {
        return false;
    }

    debug('Starting --init');

    logger.log('Welcome to sonarwhal configuration generator');

    const initialQuestion: inquirer.Questions = [{
        choices: ['predefined', 'custom'],
        default: 'predefined',
        message: 'Do you want to use a predefined configuration or create your own based on your installed packages?',
        name: 'configType',
        type: 'list'
    }];

    const initialAnswer: inquirer.Answers = await inquirer.prompt(initialQuestion);

    const sonarwhalConfig = initialAnswer.configType === 'predefined' ?
        await extendConfig() :
        await customConfig();

    // No resources installed or no configuration packages available, we have to quit
    if (!sonarwhalConfig) {
        return true;
    }

    const filePath: string = path.join(process.cwd(), '.sonarwhalrc');

    await promisify(fs.writeFile)(filePath, JSON.stringify(sonarwhalConfig, null, 4), 'utf8');

    return true;
};
