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
import * as url from 'url';

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
    async format(messages: Array<IProblem>, option: string) {
        debug('Formatting results');

        if (_.defaultTo(messages.length, 0) === 0) {
            return;
        }

        /** Group the problems by the category they belong to. */
        const groupByCategory = (msgs): _.Dictionary<Array<IProblem>> => {
            return _.groupBy(msgs, (msg) => {
                const { ruleId } = msg;

                return loadRule(ruleId).meta.docs.category;
            });
        };

        /** Group the problems by the domain the resources belong to. */
        const groupByDomain = (msgs): _.Dictionary<Array<IProblem>> => {
            return _.groupBy(msgs, (msg) => {
                const { resource } = msg;

                return url.parse(resource).host;
            });
        };

        /** A collection of group methods. */
        const groups = {
            category: groupByCategory,
            domain: groupByDomain
        };

        /** Print msgs under each group. */
        const print = (groupedProblems) => {
            if (!Object.keys(groupedProblems)) {
                return;
            }

            _.forEach(groupedProblems, (problems: Array<IProblem>, groupKey: string) => {
                let warnings: number = 0;
                let errors: number = 0;
                const sortedProblems: Array<IProblem> = _.sortBy(problems, ['location.line', 'location.column']);

                logger.log('');
                logger.log(chalk.magenta(`${groupKey}:`));

                _.forEach(sortedProblems, (msg: IProblem) => {
                    const stats = printMessageByResource(msg);

                    warnings += stats.totalWarnings;
                    errors += stats.totalErrors;
                });


                reportSummary(errors, warnings);
            });
        };

        /** Ask user to select the groups of interest. */
        const askAndDisplay = async (groupedProblems: _.Dictionary<Array<IProblem>>, formattedRows: Array<string>, groupKeys: Array<string>, checkedGroupKeys?: inquirer.Answers) => {
            const choices: Array<inquirer.ChoiceType> = _.map(formattedRows, (row: string, index: number) => {
                const groupKey: string = groupKeys[index];
                const choice: inquirer.objects.ChoiceOption = {
                    checked: checkedGroupKeys && checkedGroupKeys.includes(groupKey) || false,
                    name: row,
                    value: groupKey
                };

                return choice;
            });

            const questions: inquirer.Questions = [{
                choices,
                message: `Select the items that you'd like to expand:`,
                name: 'expanded',
                type: 'checkbox'
            }];

            const selected: inquirer.Answers = await inquirer.prompt(questions);
            const selectedGroupedProblems = _.pickBy(groupedProblems, (results, category) => {
                return selected.expanded.includes(category);
            });

            print(selectedGroupedProblems);

            const askNext: inquirer.Questions = [{
                message: 'Go back to the menu to select other results?',
                name: 'menu',
                type: 'confirm'
            }];

            const next: inquirer.Answers = await inquirer.prompt(askNext);

            if (next.menu) {
                return askAndDisplay(groupedProblems, formattedRows, groupKeys, selected.expanded);
            }

            return null; // exit.
        };

        const groupMethod = groups[option] || groupByCategory;
        const groupedProblems: _.Dictionary<Array<IProblem>> = groupMethod(messages);
        const { tableData, ids, totalErrors, totalWarnings }: ISummaryResult = getSummary(groupedProblems);
        const formattedRows: Array<string> = table(tableData).split('\n');

        reportSummary(totalErrors, totalWarnings);

        await askAndDisplay(groupedProblems, formattedRows, ids);
    }
};

export default formatter;
