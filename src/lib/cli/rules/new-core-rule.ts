import * as path from 'path';
import { promisify } from 'util';

import * as inquirer from 'inquirer';
import * as _ from 'lodash';
import * as mkdirp from 'mkdirp';

import { CLIOptions } from '../../types';
import { debug as d } from '../../utils/debug';
import * as logger from '../../utils/logging';
import * as resourceLoader from '../../utils/resource-loader';
import { readFileAsync, writeFileAsync } from '../../utils/misc';
import {
    compileTemplate, questions,
    processDir, packageDir,
    INewRule, NewRule, QuestionsType,
    coreRuleDocDir, ruleExists, commonTemplateDir, coreRuleScriptDir, coreRuleTemplateDir, coreRuleTestDir
} from './common';

const debug = d(__filename);

const mkdirpAsync = promisify(mkdirp);

/*
 * ------------------------------------------------------------------------------
 * Private
 * ------------------------------------------------------------------------------
 */

/** Creates a `subfolder` in the given path, and then creates a new `file` in the subfolder with the given `content` */
const createFolderAndFile = async (file: string, content: string): Promise<void> => {
    const filePath = path.dirname(file);

    await mkdirpAsync(filePath);
    await writeFileAsync(file, content);
};

/** Loads generated sample test content with a given `rule`. */
const loadRuleContent = (rule: NewRule, type: string): Promise<string> => {
    const filePath = type === 'doc' ? coreRuleTemplateDir : commonTemplateDir;

    const templatePath = path.join(__dirname, filePath, `rule-${type}.hbs`);

    return compileTemplate(templatePath, rule);
};

/** Creates the code, doc and test files for the new rule. */
const generateRuleContent = async (rule: NewRule): Promise<void> => {
    const entries = [
        {
            content: null,
            file: path.join(packageDir, coreRuleScriptDir, rule.normalizedName, `${rule.normalizedName}.ts`),
            type: 'script'
        }, {
            content: null,
            file: path.join(packageDir, coreRuleDocDir, `${rule.normalizedName}.md`),
            type: 'doc'
        }, {
            content: null,
            file: path.join(packageDir, coreRuleTestDir, rule.normalizedName, 'tests.ts'),
            type: 'test'
        }];

    const loadActions = entries.map(async (entry, i) => {
        const content = await loadRuleContent(rule, entry.type);

        entries[i].content = content;
    });

    await Promise.all(loadActions);

    const createActions = entries.map(async (entry) => {
        await createFolderAndFile(entry.file, entry.content);
    });

    await Promise.all(createActions);
};

/** Adds a new rule to the index page. */
const updateRuleIndex = async (rule: NewRule): Promise<void> => {
    const indexPath = path.join(packageDir, coreRuleDocDir, 'index.md');
    let text;

    try {
        text = await readFileAsync(indexPath);
    } catch (e) {
        debug(`Error reading file: ${indexPath}`);
        throw (e);
    }

    text = _.trim(text);

    const lines = text.split(/\r\n\r\n|\n\n/gi);
    const currentTitleIndex = lines.findIndex((line) => {
        return line.toLowerCase() === `## ${rule.category}`.toLowerCase();
    });
    const currentItemsIndex = currentTitleIndex + 1;
    const currentItems = lines[currentItemsIndex];

    const newItem = `* [\`${rule.normalizedName}\`](${rule.normalizedName}.md)`;

    text = text.replace(currentItems, `${currentItems}\n${newItem}`);

    return writeFileAsync(indexPath, `${text}\n`);
};

/** Generates a new core rule based on user input. */
export const newRule = async (actions: CLIOptions): Promise<boolean> => {
    if (!actions.newRule) {
        return false;
    }

    if (packageDir !== processDir) {
        return false;
    }

    logger.log('Creating a core sonarwhal rule');
    const results = await inquirer.prompt(questions(QuestionsType.core));
    const currentRules: Array<string> = resourceLoader.getCoreRules();

    const rule: INewRule = new NewRule(results, QuestionsType.core);

    if (!rule.name) {
        throw new Error(`Rule name can't be empty.`);
    }

    if (ruleExists(rule.normalizedName, currentRules)) {
        throw new Error(`This rule already exists!`);
    }

    await generateRuleContent(rule);
    await updateRuleIndex(rule);
    logger.log(`New rule ${rule.name} created and added to the index.`);

    return true;
};
