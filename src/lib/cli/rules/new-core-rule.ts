import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';

import * as Handlebars from 'handlebars';
import * as inquirer from 'inquirer';
import * as _ from 'lodash';
import * as mkdirp from 'mkdirp';

import { Category } from '../../enums/category';
import { CLIOptions } from '../../types';
import { debug as d } from '../../utils/debug';
import * as logger from '../../utils/logging';
import * as resourceLoader from '../../utils/resource-loader';
import {
    processDir, packageDir, normalize,
    NewRule,
    ruleDocDir, ruleExists, ruleScriptDir, ruleTemplateDir, ruleTestDir
} from './common';

const debug = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Private
 * ------------------------------------------------------------------------------
 */

/** A map that matches usecases with events. */
const events: Map<string, Array<string>> = new Map([
    ['dom', ['IElementFound']],
    ['request', ['IFetchStart', 'IFetchEnd', 'IFetchError']],
    ['thirdPartyService', ['IFetchStart', 'IFetchEnd']],
    ['jsInjection', ['IScanEnd']]
]);

/**
 * Use `escapeSafeString` function instead of triple curly brace in the templates
 * to escape the backticks (`) in the user's input.
 * Example:
 * ```
 * description: `This is a \`important\` rule that has 'single' and "double" quotes.`
 * ```
 */
const escapeSafeString = (str: string): hbs.SafeString => {
    const result = str.replace(/(`)/g, '\\$1');

    return new Handlebars.SafeString(result);
};

/** Loads a template from a `filePath` and interpolates the values with the given `data`. */
const loadPopulatedTemplate = async (filePath: string, data: Object): Promise<string> => {
    let content;

    try {
        content = await util.promisify(fs.readFile)(filePath, 'utf8');
    } catch (e) {
        debug(`Error reading file: ${filePath}`);
        throw (e);
    }

    const template = Handlebars.compile(content);

    return template(data);
};

/** Creates a `subfolder` in the given path, and then creates a new `file` in the subfolder with the given `content` */
const createFolderAndFile = async (file: string, content: string): Promise<void> => {
    const filePath = path.dirname(file);

    await util.promisify(mkdirp)(filePath);
    await util.promisify(fs.writeFile)(file, content, 'utf8');
};

/** Loads generated sample test content with a given `rule`. */
const loadRuleContent = (rule: NewRule, type: string): Promise<string> => {
    const templatePath = path.join(__dirname, ruleTemplateDir, `rule-${type}.hbs`);

    return loadPopulatedTemplate(templatePath, rule);
};

/** Creates the code, doc and test files for the new rule. */
const generateRuleContent = async (rule: NewRule): Promise<void> => {
    const entries = [
        {
            file: path.join(packageDir, ruleScriptDir, rule.name, `${rule.name}.ts`),
            type: 'script'
        }, {
            file: path.join(packageDir, ruleDocDir, `${rule.name}.md`),
            type: 'doc'
        }, {
            file: path.join(packageDir, ruleTestDir, rule.name, 'tests.ts'),
            type: 'test'
        }];

    const actions = entries.map(async (file) => {
        const content: string = await loadRuleContent(rule, file.type);

        await createFolderAndFile(file.file, content);
    });

    await Promise.all(actions);
};

/** Adds a new rule to the index page. */
const updateRuleIndex = async (rule: NewRule): Promise<void> => {
    const indexPath = path.join(packageDir, ruleDocDir, 'index.md');
    let text;

    try {
        text = await util.promisify(fs.readFile)(indexPath, 'utf8');
    } catch (e) {
        debug(`Error reading file: ${indexPath}`);
        throw (e);
    }

    text = _.trim(text);

    const lines = text.split(/\r\n\r\n|\n\n/gi);
    const currentItemsIndex = lines.indexOf(`## ${rule.category}`) + 1;
    const currentItems = lines[currentItemsIndex];

    const newItem = `* [\`${rule.name}\`](${rule.name}.md)`;

    text = text.replace(currentItems, `${currentItems}\n${newItem}`);

    return util.promisify(fs.writeFile)(indexPath, `${text}\n`, 'utf8');
};

/** Get all events associted with a particular use case. */
const getEventsByUseCase = (useCase: string): string => {
    return events.get(useCase).join(', ');
};

/** List rule categories. */
const categories = [];

for (const enumValue in Category) {
    if (Category.hasOwnProperty(enumValue)) {
        categories.push({ name: Category[enumValue] });
    }
}

/** List of different use cases of a rule. */
const useCases = [
    {
        name: 'DOM',
        value: 'dom'
    },
    {
        name: 'Resource Request',
        value: 'request'
    },
    {
        name: 'Third Party Service',
        value: 'thirdPartyService'
    },
    {
        name: 'JS injection',
        value: 'jsInjection'
    }
];

/** List of questions to prompt the user. */
const questions = [
    {
        default: 'newRule',
        message: `What's the name of this new rule?`,
        name: 'name',
        type: 'input'
    },
    {
        default: 'new awesome rule',
        message: `What's the description of this new rule?`,
        name: 'description',
        type: 'input'
    },
    {
        default: true,
        message: 'Is it a recommended rule',
        name: 'recommended',
        type: 'confirm'
    },
    {
        choices: categories,
        default: Category.interoperability,
        message: 'Please select the category of this new rule:',
        name: 'category',
        type: 'list'
    },
    {
        choices: useCases,
        default: 'dom',
        message: 'Please select the category of use case:',
        name: 'useCase',
        type: 'list'
    },
    {
        default: 'div',
        message: 'What DOM element does the rule need access to?',
        name: 'elementType',
        type: 'input',
        when: (answers) => {
            return answers.useCase === 'dom';
        }
    }
];

/** Generates a new core rule based on user input. */
export const newRule = async (actions: CLIOptions): Promise<boolean> => {
    if (!actions.newRule) {
        return false;
    }

    if (packageDir !== processDir) {
        return false;
    }

    const rule: NewRule = {
        category: null,
        description: { string: '' },
        elementType: '',
        events: '',
        isRecommended: false,
        name: '',
        useCase: {
            dom: false,
            jsInjection: false,
            request: false,
            thirdPartyService: false
        }
    };

    logger.log('Creating a core sonarwhal rule');
    const results = await inquirer.prompt(questions);
    const currentRules: Array<string> = resourceLoader.getCoreRules();

    rule.name = normalize(results.name, '-');
    rule.description = escapeSafeString(results.description);
    rule.category = results.category;
    rule.isRecommended = results.recommended || false;
    rule.useCase[results.useCase] = true;
    rule.events = getEventsByUseCase(results.useCase);

    if (results.elementType) {
        rule.elementType = results.elementType;
    }

    if (!rule.name) {
        throw new Error(`Rule name can't be empty.`);
    }

    if (ruleExists(rule.name, currentRules)) {
        throw new Error(`This rule already exists!`);
    }

    await generateRuleContent(rule);
    await updateRuleIndex(rule);
    logger.log(`New rule ${rule.name} created and added to the index.`);

    return true;
};
