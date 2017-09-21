import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';

import { CLIOptions } from '../../types';
import { debug as d } from '../../utils/debug';
import * as inquirer from 'inquirer';
import * as rimraf from 'rimraf';

import { dir, normalize, ruleDistScriptDir, ruleDocDir, ruleExists, ruleScriptDir, ruleTestDir } from './common';
import * as logger from '../../utils/logging';
import * as resourceLoader from '../../utils/resource-loader';

const debug = d(__filename);

/** Removes a given rule from the index page. */
const removeFromRuleIndex = async (ruleName: string): Promise<void> => {
    const indexPath = path.join(dir, ruleDocDir, 'index.md');
    let text;

    try {
        text = await util.promisify(fs.readFile)(indexPath, 'utf8');
    } catch (e) {
        debug(`Error reading file: ${indexPath}`);
        throw (e);
    }

    const itemToDelete = `* [\`${ruleName}\`](${ruleName}.md)`;

    text = text.replace(`\n${itemToDelete}`, '');

    return util.promisify(fs.writeFile)(indexPath, text, 'utf-8');
};

/** List of questions to ask the user. */
const questions = [
    {
        message: `What's the file name of this rule to be removed? (No file extension needed)`,
        name: 'name',
        type: 'input'
    }
];

/** Removes an existing rule files and any references in the documentation. */
export const deleteRule = async (actions: CLIOptions): Promise<boolean> => {
    if (!actions.removeRule) {
        return false;
    }

    const rimrafAsync = util.promisify(rimraf);

    logger.log('Starting core sonar rule remover.');
    const results = await inquirer.prompt(questions);
    const currentRules: Array<string> = resourceLoader.getCoreRules();

    const normalizedName = normalize(results.name, '-');
    const scriptPath = path.join(dir, ruleScriptDir, normalizedName);
    const docPath = path.join(dir, ruleDocDir, `${normalizedName}.md`);
    const testPath = path.join(dir, ruleTestDir, normalizedName);
    const distScriptPath = path.join(dir, ruleDistScriptDir, normalizedName);

    if (!ruleExists(normalizedName, currentRules)) {
        throw new Error(`This rule doesn't exist!`);
    }

    const removePromises = [rimrafAsync(scriptPath), rimrafAsync(docPath), rimrafAsync(testPath), rimrafAsync(distScriptPath), removeFromRuleIndex(normalizedName)];

    await Promise.all(removePromises);
    logger.log(`Rule "${results.name}" was removed.`);

    return true;
};
