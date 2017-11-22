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

const debug: debug.IDebugger = d(__filename);

/** Initiates a wizard to gnerate a valid `.sonarwhalrc` file based on user responses. */
export const initSonarwhalrc = async (options: CLIOptions): Promise<boolean> => {
    if (!options.init) {
        return false;
    }

    debug('Initiating generator');

    const connectorKeys: Array<inquirer.ChoiceType> = resourceLoader.getCoreConnectors().concat(resourceLoader.getInstalledConnectors());
    const formattersKeys: Array<inquirer.ChoiceType> = resourceLoader.getCoreFormatters();
    const rulesIds = resourceLoader.getCoreRules();
    const rulesConfig = rulesIds.reduce((config, ruleId) => {
        config[ruleId] = 'warning';

        return config;
    }, {});

    const rules = resourceLoader.loadRules(rulesConfig);

    const sonarwhalConfig = {
        browserslist: [],
        connector: {
            name: '',
            options: { waitFor: 1000 }
        },
        formatters: ['stylish'],
        ignoredUrls: [],
        rules: {},
        rulesTimeout: 120000
    };

    const rulesKeys = [];

    for (const [key, rule] of rules) {
        rulesKeys.push({
            name: `${key} - ${rule.meta.docs.description}`,
            value: key
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
        rules.forEach((rule, key) => {
            if (rule.meta.recommended) {
                sonarwhalConfig.rules[key] = 'error';
            } else {
                sonarwhalConfig.rules[key] = 'off';
            }
        });
    } else {
        rules.forEach((rule, key) => {
            if (results.rules.includes(key)) {
                sonarwhalConfig.rules[key] = 'error';
            } else {
                sonarwhalConfig.rules[key] = 'off';
            }
        });
    }

    sonarwhalConfig.browserslist = await generateBrowserslistConfig();

    const filePath: string = path.join(process.cwd(), '.sonarwhalrc');

    await promisify(fs.writeFile)(filePath, JSON.stringify(sonarwhalConfig, null, 4), 'utf8');

    return true;
};
