import * as path from 'path';

import * as Handlebars from 'handlebars';

import { Category } from '../../enums/category';
import { debug as d } from '../../utils/debug';
import { findPackageRoot as packageRoot, normalizeStringByDelimiter, readFile, readFileAsync } from '../../utils/misc';

export const normalize = normalizeStringByDelimiter;
export const coreRuleTemplateDir = './templates/core-rule';
export const commonTemplateDir = './templates/common';
export const coreRuleScriptDir = 'src/lib/rules';
export const coreRuleDocDir = 'docs/user-guide/rules';
export const coreRuleTestDir = 'tests/lib/rules';
export const coreRuleDistScriptDir = `dist/${coreRuleScriptDir}`;
export const packageDir = packageRoot();
export const processDir = process.cwd();
export const sonarwhalPackage = JSON.parse(readFile(path.join(packageDir, 'package.json')));

const debug = d(__filename);
const partialEventCode = readFile(path.join(__dirname, 'templates', 'common', 'partial-event-code.hbs'));

/** Check if a rule exists. */
export const ruleExists = (ruleName: string, currentRules: Array<string>): boolean => {
    return currentRules.includes(normalize(ruleName, '-'));
};

/**
 * Use `escapeSafeString` function instead of triple curly brace in the templates
 * to escape the backticks (`) in the user's input.
 * Example:
 * ```
 * description: `This is a \`important\` rule that has 'single' and "double" quotes.`
 * ```
 */
export const escapeSafeString = (str: string): hbs.SafeString => {
    const result = str.replace(/(`)/g, '\\$1');

    return new Handlebars.SafeString(result);
};


Handlebars.registerHelper('dependencyVersion', (packageName, defaultVersion): string => {
    return sonarwhalPackage.dependencies[packageName] || sonarwhalPackage.devDependencies[packageName] || defaultVersion;
});

Handlebars.registerPartial('event-code', partialEventCode);

export const compileTemplate = async (filePath: string, data): Promise<string> => {
    let templateContent;

    try {
        templateContent = await readFileAsync(filePath);
    } catch (err) {
        debug(`Error reading file: ${filePath}`);
        throw (err);
    }

    const template = Handlebars.compile(templateContent);

    return template(data);
};

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
    dom: boolean;
    /**  Rule applies to resource request */
    request: boolean;
    /**  Rule applies to third party service */
    thirdPartyService: boolean;
    /**  Rule applies to JS injection */
    jsInjection: boolean;
};

/** Generate a new rule */
export interface INewRule {
    /** Name of the new rule */
    name: string;
    /** Name of the rule normalized */
    normalizedName: string;
    /** Category of the new rule */
    category: Category;
    /** Description of the new rule */
    description: hbs.SafeString;
    /** Element type if `dom` is selected in useCase */
    elementType?: string;
    /** Events that should be subscribed to */
    events: string;
    /** If the new rule is core */
    isRecommended: boolean;
    /** Usage categories that the new rule applies to */
    useCase?: UseCase;
    /** Path prefix for dependencies */
    prefix: string;
    /** If the rule works with local files */
    worksWithLocalFiles: Boolean;
    /** If a rule is external */
    external: Boolean;
}

export enum QuestionsType {
    /** Questions for core rules */
    core = 'core',
    /** Main questions for external rules or package with multiple rules */
    external = 'external',
    /** Questions rules in packages with multiple rules */
    externalRule = 'externalRule'
}

/** List rule categories. */
const categories = [];

for (const enumValue in Category) {
    if (Category.hasOwnProperty(enumValue) && enumValue !== Category.other) {
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
export const questions = (type: QuestionsType) => {
    return [{
        message: `Is this a package with multiple rules? (yes)`,
        name: 'multi',
        type: 'confirm',
        when: () => {
            return type === QuestionsType.external;
        }
    },
    {
        default(answers) {
            return answers.multi ? 'newPackage' : 'newRule';
        },
        message(answers) {
            return `What's the name of this new ${answers.multi ? 'package' : 'rule'}?`;
        },
        name: 'name',
        type: 'input'
    },
    {
        default(answers) {
            return `Description for ${answers.name}`;
        },
        message(answers) {
            return `What's the description of this new ${answers.multi ? 'package' : 'rule'} '${answers.name}'?`;
        },
        name: 'description',
        type: 'input'
    },
    {
        default() {
            return type === QuestionsType.core;
        },
        message: 'Is it a recommended rule',
        name: 'recommended',
        type: 'confirm',
        when(answers) {
            return !answers.multi;
        }
    },
    {
        choices: categories,
        default: Category.interoperability,
        message: 'Please select the category of this new rule:',
        name: 'category',
        type: 'list',
        when() {
            return type === QuestionsType.core;
        }
    },
    {
        choices: useCases,
        default: 'dom',
        message: 'Please select the category of use case:',
        name: 'useCase',
        type: 'list',
        when(answers) {
            return !answers.multi;
        }
    },
    {
        default: 'div',
        message: 'What DOM element does the rule need access to?',
        name: 'elementType',
        type: 'input',
        when: (answers) => {
            return answers.useCase === 'dom';
        }
    },
    {
        default: true,
        message: 'Want to add more rules (yes)?',
        name: 'again',
        type: 'confirm',
        when: () => {
            return type === QuestionsType.externalRule;
        }
    }];
};

/** Get all events associted with a particular use case. */
const getEventsByUseCase = (useCase: string): string => {
    return events.get(useCase).join(', ');
};

export class NewRule implements INewRule {
    public name: string;
    public normalizedName: string;
    public category: Category;
    public description: hbs.SafeString;
    public elementType?: string;
    public events: string;
    public isRecommended: boolean;
    public useCase?: UseCase;
    public prefix: string;
    public worksWithLocalFiles: Boolean;
    public external: Boolean;
    public constructor(ruleData, type: QuestionsType) {
        this.name = ruleData.name;
        this.normalizedName = normalize(ruleData.name, '-');
        this.category = type === QuestionsType.core ? ruleData.category : Category.other;
        this.description = escapeSafeString(ruleData.description);
        this.elementType = ruleData.elementType;
        this.events = getEventsByUseCase(ruleData.useCase);
        this.isRecommended = ruleData.recommended || false;
        this.useCase = {
            dom: false,
            jsInjection: false,
            request: false,
            thirdPartyService: false
        };
        this.useCase[ruleData.useCase] = true;
        this.prefix = type === QuestionsType.core ? '../../' : 'sonarwhal/dist/src/lib/';
        this.worksWithLocalFiles = type !== QuestionsType.core;
        this.external = type !== QuestionsType.core;
    }
}
