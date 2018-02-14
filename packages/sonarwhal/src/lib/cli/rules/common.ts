import * as path from 'path';

import * as Handlebars from 'handlebars';

import { Category } from '../../enums/category';

import { findPackageRoot as packageRoot, normalizeStringByDelimiter, readFile, toCamelCase } from '../../utils/misc';
import { escapeSafeString } from '../../utils/handlebars';

export const normalize = normalizeStringByDelimiter;
export const commonTemplateDir = './templates/common';
export const packageDir = packageRoot();
export const processDir = process.cwd();

const partialEventCode = readFile(path.join(__dirname, 'templates', 'new-rule', 'partial-event-code.hbs'));

Handlebars.registerPartial('event-code', partialEventCode);
Handlebars.registerHelper('toCamelCase', toCamelCase);

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
    /** Usage categories that the new rule applies to */
    useCase?: UseCase;
    /** If the rule works with local files */
    worksWithLocalFiles: Boolean;
    /** If a rule is external */
    external: Boolean;
}

export enum QuestionsType {
    /** Main questions for external rules or package with multiple rules */
    external = 'external',
    /** Questions rules in packages with multiple rules */
    externalRule = 'externalRule'
}

/** List rule categories. */
const categories = [];

for (const [, value] of Object.entries(Category)) {
    if (value !== 'other') {
        categories.push({ name: value });
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
    const noEmpty = (value) => {
        return value.trim() !== '';
    };

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
        type: 'input',
        validate: noEmpty
    },
    {
        default(answers) {
            return `Description for ${answers.name}`;
        },
        message(answers) {
            return `What's the description of this new ${answers.multi ? 'package' : 'rule'} '${answers.name}'?`;
        },
        name: 'description',
        type: 'input',
        validate: noEmpty
    },
    {
        choices: categories,
        default: Category.interoperability,
        message: 'Please select the category of this new rule:',
        name: 'category',
        type: 'list',
        when(answers) {
            return !answers.multi;
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
        validate: noEmpty,
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
    public useCase?: UseCase;
    public prefix: string;
    public worksWithLocalFiles: Boolean;
    public external: Boolean;
    public constructor(ruleData) {
        this.name = ruleData.name;
        this.normalizedName = normalize(ruleData.name, '-');
        this.category = ruleData.category || Category.other;
        this.description = escapeSafeString(ruleData.description);
        this.elementType = ruleData.elementType;
        this.events = getEventsByUseCase(ruleData.useCase);
        this.useCase = {
            dom: false,
            jsInjection: false,
            request: false,
            thirdPartyService: false
        };
        this.useCase[ruleData.useCase] = true;
        this.worksWithLocalFiles = true;
    }
}
