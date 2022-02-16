/**
 * @fileoverview Generates a valid browserslist config.
 */

/*
 * ------------------------------------------------------------------------------
 * Requirements
 * ------------------------------------------------------------------------------
 */

import * as inquirer from 'inquirer';
import { logger } from '@hint/utils';
import { debug as d } from '@hint/utils-debug';

const browserslist = require('browserslist'); // `require` used because `browserslist` exports a function
const debug: debug.IDebugger = d(__filename);

/** Prompts the user about browsers usage and generates a valid browserslist configuration. */
export const generateBrowserslistConfig = (): Promise<string[]> => {
    debug('Initiating browserslist config generator');

    const addBrowsersListOptions: inquirer.ChoiceCollection = [
        { name: 'Default (last 2 versions of each browser, and browsers with globaly usage over 1%, plus Firefox ESR)', value: 'default' },
        { name: 'Custom (use browserslist format:  https://github.com/ai/browserslist#queries)', value: 'custom' }
    ];

    const browsersListQuestions: inquirer.QuestionCollection = [
        {
            choices: addBrowsersListOptions,
            message: 'What browsers are you targeting?',
            name: 'targetBy',
            type: 'list'
        },
        {
            message: 'Please enter the queries you want to specify (Use comma as the separator if you have more than one query):',
            name: 'customQueries',
            when: (answers: inquirer.Answers) => {
                return answers.targetBy === 'custom';
            }
        }
    ];

    const askAndValidate = async (): Promise<string[]> => {
        const results: inquirer.Answers = await inquirer.prompt(browsersListQuestions);

        if (results.targetBy === 'default') {
            return [];
        }

        const customQueries: string[] = results.customQueries.split(',').map((query: string) => {
            return query.trim();
        });

        try {
            browserslist(customQueries);

            return customQueries;
        } catch (err) {
            // The query format is invalid.
            logger.log(`${(err as Error).message}.`);
            logger.log('Please try again.');

            return askAndValidate();
        }
    };

    return askAndValidate();
};
