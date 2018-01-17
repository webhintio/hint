/**
 * @fileoverview The summary formatter, it outputs the aggregation of all the rule results in a table format.
 */

/*
 * ------------------------------------------------------------------------------
 * Requirements
 * ------------------------------------------------------------------------------
 */

import chalk from 'chalk';
import * as _ from 'lodash';
import * as inquirer from 'inquirer';
import * as table from 'text-table';

import { debug as d } from '../../utils/debug';
import { getSummary, printMessageByResource, reportSummary } from '../utils/common';
import { ISummaryResult } from '../utils/types';
import { loadRule } from '../../utils/resource-loader';
import { IFormatter, IProblem } from '../../types';
import * as logger from '../../utils/logging';

const debug = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Formatter
 * ------------------------------------------------------------------------------
 */

const formatter: IFormatter = {
    /** Format the problems grouped by `category` name and allow users to view categories selectively. */
    async format(messages: Array<IProblem>) {
        debug('Formatting results');

        if (_.defaultTo(messages.length, 0) === 0) {
            return;
        }

        const groupByCategory = (msgs): _.Dictionary<Array<IProblem>> => {
            return _.groupBy(msgs, (msg) => {
                const { ruleId } = msg;

                return loadRule(ruleId).meta.docs.category;
            });
        };

        const printCategories = (categories) => {
            if (!Object.keys(categories)) {
                return;
            }

            _.forEach(categories, (msgs: Array<IProblem>, category: string) => {
                let warnings: number = 0;
                let errors: number = 0;
                const sortedMessages: Array<IProblem> = _.sortBy(msgs, ['location.line', 'location.column']);

                logger.log('');
                logger.log(chalk.magenta(`${category}:`));

                _.forEach(sortedMessages, (msg: IProblem) => {
                    const stats = printMessageByResource(msg);

                    warnings += stats.totalWarnings;
                    errors += stats.totalErrors;
                });


                reportSummary(errors, warnings);
            });
        };

        const askAndDisplay = async (categories: _.Dictionary<Array<IProblem>>, formattedRows: Array<string>, categoryIds: Array<string>, checkedCategories?: inquirer.Answers) => {
            const choices: Array<inquirer.ChoiceType> = _.map(formattedRows, (row: string, index: number) => {
                const categoryId: string = categoryIds[index];
                const choice: inquirer.objects.ChoiceOption = {
                    checked: checkedCategories && checkedCategories.includes(categoryId) || false,
                    name: row,
                    value: categoryId
                };

                return choice;
            });

            const questions: inquirer.Questions = [{
                choices,
                message: 'Select the categories that you\'d like to expand:',
                name: 'expanded',
                type: 'checkbox'
            }];

            const selected: inquirer.Answers = await inquirer.prompt(questions);
            const selectedCategories = _.pickBy(categories, (results, category) => {
                return selected.expanded.includes(category);
            });

            printCategories(selectedCategories);

            const askNext: inquirer.Questions = [{
                message: 'Go back to the menu to select other results?',
                name: 'menu',
                type: 'confirm'
            }];

            const next: inquirer.Answers = await inquirer.prompt(askNext);

            if (next.menu) {
                return askAndDisplay(categories, formattedRows, categoryIds, selected.expanded);
            }

            return null; // exit.
        };

        const categories: _.Dictionary<Array<IProblem>> = groupByCategory(messages);
        const { tableData, ids, totalErrors, totalWarnings }: ISummaryResult = getSummary(categories);
        const formattedRows: Array<string> = table(tableData).split('\n');

        reportSummary(totalErrors, totalWarnings);

        await askAndDisplay(categories, formattedRows, ids);
    }
};

export default formatter;
