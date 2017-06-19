/**
 * @fileoverview Rule generator
 */

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';

import * as inquirer from 'inquirer';
import * as Handlebars from 'handlebars';
import * as rimraf from 'rimraf';
import * as _ from 'lodash';

import { debug as d } from '../utils/debug';
import * as logger from '../utils/logging';
import { normalizeStringByDelimiter as normalize, findPackageRoot as packageRoot } from '../utils/misc';
import * as resourceLoader from '../utils/resource-loader';

const debug = d(__filename);
const dir = packageRoot();

const ruleTemplateDir = './templates';
const ruleScriptDir = 'src/lib/rules';
const ruleDocDir = 'docs/user-guide/rules';
const ruleTestDir = 'tests/lib/rules';
const ruleDistScriptDir = `dist/${ruleScriptDir}`;

// ------------------------------------------------------------------------------
// Private
// ------------------------------------------------------------------------------

/** A map that matches usecases with events. */
const events: Map<string, Array<string>> = new Map([
    ['dom', ['IElementFound']],
    ['request', ['IFetchStart', 'IFetchEnd', 'IFetchError']],
    ['thirdPartyService', ['IFetchStart', 'IFetchEnd']],
    ['jsInjection', ['IScanEnd']]
]);

/**  Usage categories that the new rule applies to */
export type UseCase = {
    /**  Rule applies to DOM */
    dom: boolean,
    /**  Rule applies to resource request */
    request: boolean,
    /**  Rule applies to third party service */
    thirdPartyService: boolean,
    /**  Rule applies to JS injection */
    jsInjection: boolean
};

/** Generate a new rule */
export type NewRule = {
    /** Name of the new rule */
    name: string,
    /** Category of the new rule */
    category: string,
    /** Description of the new rule */
    description: string,
    /** Element type if `dom` is selected in useCase */
    elementType?: string,
    /** Extension of the new rule file*/
    extension?: string,
    /** Events that should be subscribed to */
    events: string,
    /** If the new rule is core */
    isCore: boolean,
    /**  Usage categories that the new rule applies to */
    useCase: UseCase
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

/** Loads generated sample script content with a given rule. */
const loadRuleScriptContent = (rule: NewRule): Promise<string> => {
    if (!rule.extension) {
        rule.extension = 'ts';
    }
    const templatePath = path.join(__dirname, ruleTemplateDir, `rule-script-${rule.extension}.hbs`);

    return loadPopulatedTemplate(templatePath, rule);
};

/** Loads generated sample documentation content with a given `rule`. */
const loadRuleDocContent = (rule: NewRule): Promise<string> => {
    const templatePath = path.join(__dirname, ruleTemplateDir, 'rule-doc.hbs');

    return loadPopulatedTemplate(templatePath, rule);
};

/** Loads generated sample test content with a given `rule`. */
const loadRuleTestContent = (rule: NewRule): Promise<string> => {
    const templatePath = path.join(__dirname, ruleTemplateDir, 'rule-test.hbs');

    return loadPopulatedTemplate(templatePath, rule);
};

/** Creates a `subfolder` in the given path, and then creates a new `file` in the subfolder with the given `content` */
const createFolderAndFile = async (folder: string, subfolder: string, file: string, content: string): Promise<void> => {
    const folderPath = path.join(folder, subfolder);
    const filePath = path.join(folderPath, file);

    if (subfolder) {
        await util.promisify(fs.mkdir)(folderPath);
    }
    await util.promisify(fs.writeFile)(filePath, content, 'utf8');
};

/** Loads sample script content and create a new script with a given `rule`*/
const generateRuleScript = async (rule: NewRule): Promise<void> => {
    const folderPath = path.join(dir, ruleScriptDir);
    const ruleScriptContent = await loadRuleScriptContent(rule);

    return createFolderAndFile(folderPath, rule.name, `${rule.name}.${rule.extension}`, ruleScriptContent);
};

/** Loads sample documentation content and create a new documentation with a given `rule` */
const generateRuleDoc = async (rule: NewRule): Promise<void> => {
    const folderPath = path.join(dir, ruleDocDir);
    const ruleDocContent = await loadRuleDocContent(rule);

    return createFolderAndFile(folderPath, '', `${rule.name}.md`, ruleDocContent);
};

/** Loads sample test content and create a new test file with a given `rule` */
const generateRuleTest = async (rule: NewRule): Promise<void> => {
    const folderPath = path.join(dir, ruleTestDir);
    const ruleTestContent = await loadRuleTestContent(rule);

    return createFolderAndFile(folderPath, rule.name, 'tests.ts', ruleTestContent);
};

/** Adds a new rule to the index page. */
const updateRuleIndex = async (rule: NewRule): Promise<void> => {
    const indexPath = path.join(dir, ruleDocDir, 'index.md');
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

/** Get all events associted with a particular use case. */
const getEventsByUseCase = (useCase: string): string => {
    return events.get(useCase).join(', ');
};

/** Check if a rule exists. */
const ruleExists = (ruleName: string, currentRules: Array<string>): boolean => {
    return currentRules.includes(normalize(ruleName, '-'));
};

/** Generates a new rule */
export const newRule = async (): Promise<void> => {
    // const fileTypes = ['ts', 'js'];
    const rule: NewRule = {
        category: '',
        description: '',
        elementType: '',
        events: '',
        extension: '',
        isCore: false,
        name: '',
        useCase: {
            dom: false,
            jsInjection: false,
            request: false,
            thirdPartyService: false
        }
    };

    const categories = [
        { name: 'Accessibility' },
        { name: 'Interoperability' },
        { name: 'Performance' },
        { name: 'PWAs' },
        { name: 'Security' }
    ];

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

    const questions = [
        {
            default: 'newRule',
            message: 'What\'s the name of this new rule?',
            name: 'name',
            type: 'input'
        },
        {
            choices: categories,
            default: 'Interoperability',
            message: 'Please select the category of this new rule:',
            name: 'category',
            type: 'list'
        },
        {
            default: 'new awesome rule',
            message: 'What\'s the description of this new rule?',
            name: 'description',
            type: 'input'
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
        // TODO: Install sonar as an dependency and add rules. Users will then be provided
        // with the following options: create a core or non-core rule, create a typescript or javascript file.
        // {
        //     choices: [{
        //         name: 'Yes',
        //         value: true
        //     },
        //     {
        //         name: 'No',
        //         value: false
        //     }],
        //     default: false,
        //     message: 'Is this going to be a core rule?',
        //     name: 'isCore',
        //     type: 'list'
        // }
        // {
        //     choices: fileTypes,
        //     default: 'ts',
        //     message: 'Do you want TypeScript or JavaScript?',
        //     name: 'extension',
        //     type: 'list',
        //     when: (answers) => {
        //         return !answers.isCore;
        //     }
        // }
    ];

    logger.log('Welcome to Sonar rule generator');
    const results = await inquirer.prompt(questions);
    const currentRules: Array<string> = resourceLoader.getCoreRules();

    rule.name = normalize(results.name, '-');
    rule.description = results.description;
    rule.category = results.category;
    rule.isCore = results.isCore || true;
    rule.extension = results.extension || 'ts';
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

    // if (newRule.isCore && newRule.extension === 'js') {
    //     throw new Error(`The core rule can't be a 'js' file.`);
    // }

    await generateRuleScript(rule);

    logger.log(`Script ${rule.name}.${rule.extension} was created.`);

    if (rule.isCore) {
        await generateRuleDoc(rule);
        logger.log(`Documentation file ${rule.name}.md was created.`);

        await generateRuleTest(rule);
        logger.log(`Test file for rule ${rule.name} was created.`);

        await updateRuleIndex(rule);
        logger.log(`Rule ${rule.name} was added to the list of rules.`);
    }
};

/** Removes an existing rule. */
export const removeRule = async (): Promise<void> => {
    const questions = [
        {
            message: 'What\'s the file name of this rule to be removed? (No file extension needed)',
            name: 'name',
            type: 'input'
        }
    ];
    const rimrafAsync = util.promisify(rimraf);

    logger.log('Welcome to Sonar rule remover');
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
};
