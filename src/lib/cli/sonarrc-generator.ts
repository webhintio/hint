/**
 * @fileoverview Generates a valid `.sonarrc` file based on user responses.
 */

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

import * as inquirer from 'inquirer';

import { debug as d } from '../utils/debug';
import { IConfig, IRuleBuilder } from '../types'; //eslint-disable-line no-unused-vars
import * as logger from '../utils/logging';
import * as resourceLoader from '../utils/resource-loader';

const debug = d(__filename);

/** Initiates a wizard to gnerate a valid `.sonarrc` file based on user responses. */
export const initSonarrc = async () => {
    debug('Initiating generator');

    const connectorKeys = resourceLoader.getCoreConnectors();
    const formattersKeys = resourceLoader.getCoreFormatters();
    const rulesIds = resourceLoader.getCoreRules();
    const rulesConfig = rulesIds.reduce((config, ruleId) => {
        config[ruleId] = 'warning';

        return config;
    }, {});

    const rules = resourceLoader.loadRules(rulesConfig);

    const sonarConfig = {
        browserslist: '',
        connector: {
            name: '',
            options: { waitFor: 1000 }
        },
        formatter: 'stylish',
        ignoredUrls: {},
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

    logger.log('Welcome to sonar configuration generator');

    const questions = [
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

    sonarConfig.connector.name = results.connector;
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

    return promisify(fs.writeFile)(filePath, JSON.stringify(sonarConfig, null, 4), 'utf8');
};
