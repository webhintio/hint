/**
 * @fileoverview Generates a valid `.hintrc` file based on user responses.
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

import { UserConfig } from '../../types';
import { debug as d } from '../../utils/debug';
import * as logger from '../../utils/logging';
import { getInstalledResources, getCoreResources } from '../../utils/resource-loader';
import { ResourceType } from '../../enums/resourcetype';
import { generateBrowserslistConfig } from '../browserslist';
import { getOfficialPackages, installPackages } from '../../utils/npm';
import { NpmPackage } from '../../types';

const debug: debug.IDebugger = d(__filename);
const defaultFormatter = 'summary';

type InitUserConfig = {
    config: UserConfig;
    packages?: Array<string>;
};

/** Validates if the given array is not empty and if so, prints an error message. */
const anyResources = (resources: Array<any>, type: string) => {
    if (resources.length > 0) {
        return true;
    }

    logger.error(`Couldn't find any installed ${type}s. Visit https://www.npmjs.com/search?q=%hint%2F${type}.`);

    return false;
};

const getConfigurationName = (pkgName: string): string => {
    const nameSplitted = pkgName.split('/');

    return nameSplitted[1].replace('configuration-', '');
};

/** Shwos the user a list of official configuration packages available in npm to install. */
const extendConfig = async (): Promise<InitUserConfig> => {
    const configPackages: Array<NpmPackage> = await getOfficialPackages(ResourceType.configuration);

    if (!anyResources(configPackages, ResourceType.configuration)) {
        return null;
    }

    const choices = configPackages.map((pkg) => {
        return {
            name: getConfigurationName(pkg.name),
            value: pkg.name
        };
    });

    const questions: inquirer.Questions = [{
        choices,
        message: 'Choose the configuration you want to extend from',
        name: 'configuration',
        pageSize: 15,
        type: 'list'
    }];

    const answers: inquirer.Answers = await inquirer.prompt(questions);
    const hintConfig = { extends: [getConfigurationName(answers.configuration)] };

    return {
        config: hintConfig,
        packages: [answers.configuration]
    };
};

/** Prompts a series of questions to create a new configuration object based on the installed packages. */
const customConfig = async (): Promise<InitUserConfig> => {
    const connectorKeys: Array<inquirer.ChoiceType> = getInstalledResources(ResourceType.connector).concat(getCoreResources(ResourceType.connector));
    const formattersKeys: Array<inquirer.ChoiceType> = getInstalledResources(ResourceType.formatter).concat(getCoreResources(ResourceType.formatter));
    const parsersKeys: Array<inquirer.ChoiceType> = getInstalledResources(ResourceType.parser).concat(getCoreResources(ResourceType.parser));
    const hintsKeys: Array<inquirer.ChoiceType> = getInstalledResources(ResourceType.hint).concat(getCoreResources(ResourceType.hint));

    if (!anyResources(connectorKeys, ResourceType.connector) ||
        !anyResources(formattersKeys, ResourceType.formatter) ||
        !anyResources(hintsKeys, ResourceType.hint)) {

        return null;
    }

    const customQuestions: Array<inquirer.Question> = [
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
            name: 'formatters',
            pageSize: 15,
            type: 'checkbox'
        },
        {
            choices: hintsKeys,
            message: 'Choose the hints you want to add to your configuration',
            name: 'hints',
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

    const hintConfig = {
        browserslist: [],
        connector: {
            name: '',
            options: { waitFor: 1000 }
        },
        extends: [],
        formatters: [defaultFormatter],
        hints: {},
        hintsTimeout: 120000,
        ignoredUrls: []
    };

    hintConfig.connector.name = results.connector;
    hintConfig.formatters = results.formatters;

    results.hints.forEach((hint) => {
        hintConfig.hints[hint] = 'error';
    });

    hintConfig.browserslist = await generateBrowserslistConfig();

    return { config: hintConfig };
};

/**
 * Initiates a wizard to generate a valid `.hintrc` file based on:
 * * an existing published configuration package
 * * the installed resources
 */
export default async (): Promise<boolean> => {

    debug('Starting --init');

    logger.log('Welcome to hint configuration generator');

    const initialQuestion: inquirer.Questions = [{
        choices: ['predefined', 'custom'],
        default: 'predefined',
        message: 'Do you want to use a predefined configuration or create your own based on your installed packages?',
        name: 'configType',
        type: 'list'
    }];

    const initialAnswer: inquirer.Answers = await inquirer.prompt(initialQuestion);

    const result = initialAnswer.configType === 'predefined' ?
        await extendConfig() :
        await customConfig();

    if (!result) {
        return false;
    }

    const filePath: string = path.join(process.cwd(), '.hintrc');

    await promisify(fs.writeFile)(filePath, JSON.stringify(result.config, null, 4), 'utf8');

    if (Array.isArray(result.packages) && result.packages.length > 0) {
        const isInstalled = getInstalledResources(ResourceType.configuration).includes(getConfigurationName(result.packages[0]));

        if (isInstalled) {
            return true;
        }

        await installPackages(result.packages);
    }

    return true;
};
