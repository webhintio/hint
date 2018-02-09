/**
 * @fileoverview The interactive formatter, it groups the rule results by category or domain name
 * and displays the selected group based on user's choice.
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
import { getSummary, printMessageByResource, reportTotal } from '../utils/common';
import { ISummaryResult, IGroupedProblems } from '../utils/types';
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
    /** Group the problems grouped by `category` or `domain` name and allow users to view the selected group. */
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
        const print = (groupedProblems: IGroupedProblems) => {
            if (_.isEmpty(groupedProblems)) {
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

                reportTotal(errors, warnings);
            });

            logger.log('');
        };

        /** Label pre-selected choices. */
        const preCheckCopy = (questions: inquirer.Questions, preSelectedKey?: inquirer.Answers) => {
            const preCheckedCopy = _.cloneDeep(questions);

            if (preSelectedKey && preSelectedKey.length) {
                preCheckedCopy[0].default = preSelectedKey;
            }

            return preCheckedCopy;
        };

        /** Generate questions from tableData */
        const generateQuestions = (tableData, groupKeys: Array<string>) => {
            const formattedRows: Array<string> = table(tableData).split('\n');
            let choices: Array<inquirer.ChoiceType> = _.map(formattedRows, (row: string, index: number) => {
                const groupKey: string = groupKeys[index];
                const choice: inquirer.objects.ChoiceOption = {
                    name: row,
                    value: groupKey
                };

                return choice;
            });

            const all = { name: chalk.cyan('SHOW ALL'), value: 'all' };
            const exit = { name: chalk.red('EXIT'), value: 'exit' };
            const optionText = ['domain', 'category'].includes(option) ? option : 'category';

            choices = choices.concat([all, exit]);


            const questions: inquirer.Questions = [{
                choices,
                message: `Select the ${optionText} that you'd like to expand or exit:`,
                name: 'expanded',
                type: 'list'
            }];

            return questions;
        };

        /** Ask user to select the groups of interest. */
        const askAndDisplay = async (groupedProblems: IGroupedProblems, questions: inquirer.Questions, preSelectedkey?: inquirer.Answers) => {
            const preCheckedQuestions = preCheckCopy(questions, preSelectedkey);
            const selected: inquirer.Answers = await inquirer.prompt(preCheckedQuestions);

            if (selected.expanded === 'exit') {
                return null;
            }

            const selectedGroup = selected.expanded === 'all' ? groupedProblems : _.pickBy(groupedProblems, (results, category) => {
                return selected.expanded === category;
            });

            try {

                print(selectedGroup);
            } catch (error) {
                console.log(error);
            }

            return askAndDisplay(groupedProblems, questions, selected.expanded);
        };

        const groupMethod = groups[option] || groupByCategory;
        const groupedProblems: _.Dictionary<Array<IProblem>> = groupMethod(messages);
        const { tableData, sequence, totalErrors, totalWarnings }: ISummaryResult = getSummary(groupedProblems);
        const questions: inquirer.Questions = generateQuestions(tableData, sequence);

        reportTotal(totalErrors, totalWarnings);

        await askAndDisplay(groupedProblems, questions);
    }
};

export default formatter;
