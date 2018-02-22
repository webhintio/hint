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

import { CLIOptions } from '../types';
import { debug as d } from '../utils/debug';
import * as logger from '../utils/logging';
import * as resourceLoader from '../utils/resource-loader';
import { generateBrowserslistConfig } from './browserslist';
import { NpmPackage } from '../types';
import { installCoreRules } from '../utils/npm';

const debug: debug.IDebugger = d(__filename);
const defaultFormatter = 'summary';

const installNPMRules = (rules) => {
    const rulesIds: Array<string> = [];

    for (const [key, value] of Object.entries(rules)) {
        if (value !== 'off') {
            rulesIds.push(key);
        }
    }

    return installCoreRules(rulesIds);
};

/** Initiates a wizard to generate a valid `.sonarwhalrc` file based on user responses. */
export const initSonarwhalrc = async (options: CLIOptions): Promise<boolean> => {
    if (!options.init) {
        return false;
    }

    debug('Initiating generator');

    const connectorKeys: Array<inquirer.ChoiceType> = resourceLoader.getCoreConnectors().concat(resourceLoader.getInstalledConnectors());
    const formattersKeys: Array<inquirer.ChoiceType> = resourceLoader.getCoreFormatters();
    const npmRules: Array<NpmPackage> = await resourceLoader.getCoreRulesFromNpm();
    const rules = npmRules.map((rule) => {
        return {
            description: rule.description,
            id: rule.name.replace('@sonarwhal/rule-', ''),
            recommended: rule.keywords.includes('sonarwhal-recommended')
        };
    });

    const sonarwhalConfig = {
        browserslist: [],
        connector: {
            name: '',
            options: { waitFor: 1000 }
        },
        formatters: [defaultFormatter],
        ignoredUrls: [],
        rules: {},
        rulesTimeout: 120000
    };

    const rulesKeys = [];

    for (const { description, id } of rules) {
        rulesKeys.push({
            name: `${id} - ${description}`,
            value: id
        });
    }

    logger.log('Welcome to sonarwhal configuration generator');

    const questions: inquirer.Questions = [
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
            message: 'Do you want to use the recommended rules configuration?',
            name: 'default',
            type: 'confirm'
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

    const results: inquirer.Answers = await inquirer.prompt(questions);

    sonarwhalConfig.connector.name = results.connector;
    sonarwhalConfig.formatters = [results.formatter];

    if (results.default) {
        logger.log('Using recommended rules');
        rules.forEach((rule) => {
            if (rule.recommended) {
                sonarwhalConfig.rules[rule.id] = 'error';
            }
        });
    } else {
        rules.forEach((rule) => {
            if (results.rules.includes(rule.id)) {
                sonarwhalConfig.rules[rule.id] = 'error';
            } else {
                sonarwhalConfig.rules[rule.id] = 'off';
            }
        });
    }

    sonarwhalConfig.browserslist = await generateBrowserslistConfig();

    const filePath: string = path.join(process.cwd(), '.sonarwhalrc');

    await promisify(fs.writeFile)(filePath, JSON.stringify(sonarwhalConfig, null, 4), 'utf8');

    installNPMRules(sonarwhalConfig.rules);

    return true;
};
