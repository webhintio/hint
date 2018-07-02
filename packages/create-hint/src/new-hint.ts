import { dirname, join } from 'path';
import { promisify } from 'util';

import { copy } from 'fs-extra';
import * as inquirer from 'inquirer';
import * as mkdirp from 'mkdirp';

import { Category } from 'hint/dist/src/lib/enums/category';
import { HintScope } from 'hint/dist/src/lib/enums/hintscope';
import * as logger from 'hint/dist/src/lib/utils/logging';
import isOfficial from 'hint/dist/src/lib/utils/packages/is-official';

import Handlebars, { compileTemplate, escapeSafeString } from 'hint/dist/src/lib/utils/handlebars-utils';
import normalizeStringByDelimiter from 'hint/dist/src/lib/utils/misc/normalize-string-by-delimeter';
import readFile from 'hint/dist/src/lib/utils/fs/read-file';
import toCamelCase from 'hint/dist/src/lib/utils/misc/to-camel-case';
import toPascalCase from 'hint/dist/src/lib/utils/misc/to-pascal-case';
import writeFileAsync from 'hint/dist/src/lib/utils/fs/write-file-async';

/*
 * ------------------------------------------------------------------------------
 * Types.
 * ------------------------------------------------------------------------------
 */

/** A map that matches usecases with events. */
const events: Map<string, Array<string>> = new Map([
    ['dom', ['ElementFound']],
    ['request', ['FetchStart', 'FetchEnd', 'FetchError']],
    ['thirdPartyService', ['FetchStart', 'FetchEnd']],
    ['jsInjection', ['ScanEnd']]
]);

/**  Usage categories that the new hint applies to */
export type UseCase = {
    [key: string]: any;
    /**  Hint applies to DOM */
    dom: boolean;
    /**  Hint applies to resource request */
    request: boolean;
    /**  Hint applies to third party service */
    thirdPartyService: boolean;
    /**  Hint applies to JS injection */
    jsInjection: boolean;
};

/** Generate a new hint */
export interface INewHint {
    /** Name of the new hint */
    name: string;
    /** Name of the hint normalized */
    normalizedName: string;
    /** Category of the new hint */
    category: Category;
    /** Description of the new hint */
    description: hbs.SafeString;
    /** Element type if `dom` is selected in useCase */
    elementType?: string;
    /** Events that should be subscribed to */
    events: string;
    /** Usage categories that the new hint applies to */
    useCase?: UseCase;
    /** If the hint works with local files */
    scope: HintScope;
    /** Parent name for multi hints packages */
    parentName: string;
}

export enum QuestionsType {
    /** Main questions to create a simple hints or a package with multiples hints */
    main = 'main',
    /** Questions to add more hints to the package */
    hint = 'hint'
}

/*
 * ------------------------------------------------------------------------------
 * Classes and dependencies.
 * ------------------------------------------------------------------------------
 */

/** Get all events associted with a particular use case. */
const getEventsByUseCase = (useCase: string): string => {
    const relatedEvents = events.get(useCase);

    /* istanbul ignore if */
    if (!relatedEvents) {
        return '';
    }

    return relatedEvents.join(', ');
};

class NewHint implements INewHint {
    public name: string;
    public normalizedName: string;
    public className: string;
    public category: Category;
    public description: hbs.SafeString;
    public elementType?: string;
    public events: string;
    public scope: HintScope;
    public isHint: Boolean = true;
    public parentName: string;
    public useCase: UseCase = {
        dom: false,
        jsInjection: false,
        request: false,
        thirdPartyService: false
    };

    public constructor(hintData: inquirer.Answers, parentName?: string) {
        this.name = hintData.name;
        this.normalizedName = normalizeStringByDelimiter(hintData.name, '-');
        this.className = `${parentName ? toPascalCase(parentName) : ''}${toPascalCase(this.normalizedName)}Hint`;
        this.category = hintData.category || Category.other;
        this.description = escapeSafeString(hintData.description);
        this.elementType = hintData.elementType;
        this.events = getEventsByUseCase(hintData.useCase);
        this.useCase[hintData.useCase] = true;
        this.scope = hintData.scope;
        this.parentName = parentName || '';
    }
}

class HintPackage {
    public name: string;
    public description: hbs.SafeString;
    public isMulti: boolean;
    public normalizedName: string;
    public official: boolean;
    public packageMain: string;
    public packageName: string;
    public hints: Array<INewHint>;
    public destination: string;
    public isHint: boolean = true;

    public constructor(data: inquirer.Answers) {
        this.name = data.name;
        this.isMulti = data.multi;
        this.normalizedName = normalizeStringByDelimiter(data.name, '-');
        this.description = escapeSafeString(data.description);
        this.official = data.official;
        this.packageMain = `dist/src/index.js`; // package.json#main

        const prefix = this.official ? '@hint/hint' : 'hint'; // package.json#name

        this.packageName = `${prefix}-${this.normalizedName}`;
        this.hints = [];

        if (this.isMulti) {
            (data.hints as Array<inquirer.Answers>).forEach((hint) => {
                this.hints.push(new NewHint(hint, this.normalizedName));
            });
        } else {
            this.hints.push(new NewHint(data));
        }

        this.destination = join(process.cwd(), `hint-${this.normalizedName}`);
    }
}

/*
 * ------------------------------------------------------------------------------
 * Constants and Private functions.
 * ------------------------------------------------------------------------------
 */

const mkdirpAsync = promisify(mkdirp);
/** Name of the package to use as a template. */
const TEMPLATE_PATH = './templates';
const SHARED_TEMPLATE_PATH = './shared-templates';
const partialEventCode = readFile(join(__dirname, 'templates', 'partial-event-code.hbs'));

Handlebars.registerPartial('event-code', partialEventCode);
Handlebars.registerHelper('toCamelCase', toCamelCase);

/** List hint categories. */
const categories: Array<any> = [];

for (const [, value] of Object.entries(Category)) {
    if (value !== 'other') {
        categories.push({ name: value });
    }
}

/** List of scopes */
const scopes: Array<any> = [];

for (const [, value] of Object.entries(HintScope)) {
    /* istanbul ignore else */
    if (value !== 'other') {
        scopes.push({ name: value });
    }
}

/** List of different use cases of a hint. */
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
    /* istanbul ignore next */
    const notEmpty = (value: string) => {
        return value.trim() !== '';
    };

    /* istanbul ignore next */
    return [{
        message: `Is this a package with multiple hints? (yes)`,
        name: 'multi',
        type: 'confirm',
        when: () => {
            return type === QuestionsType.main;
        }
    },
    {
        default(answers: inquirer.Answers) {
            return answers.multi ? 'newPackage' : 'newHint';
        },
        message(answers: inquirer.Answers) {
            return `What's the name of this new ${answers.multi ? 'package' : 'hint'}?`;
        },
        name: 'name',
        type: 'input',
        validate: notEmpty
    },
    {
        default(answers: inquirer.Answers) {
            return `Description for ${answers.name}`;
        },
        message(answers: inquirer.Answers) {
            return `What's the description of this new ${answers.multi ? 'package' : 'hint'} '${answers.name}'?`;
        },
        name: 'description',
        type: 'input',
        validate: notEmpty
    },
    {
        choices: categories,
        default: Category.interoperability,
        message: 'Please select the category of this new hint:',
        name: 'category',
        type: 'list',
        when(answers: inquirer.Answers) {
            return !answers.multi;
        }
    },
    {
        choices: useCases,
        default: 'dom',
        message: 'Please select the category of use case:',
        name: 'useCase',
        type: 'list',
        when(answers: inquirer.Answers) {
            return !answers.multi;
        }
    },
    {
        default: 'div',
        message: 'What DOM element does the hint need access to?',
        name: 'elementType',
        type: 'input',
        validate: notEmpty,
        when: (answers: inquirer.Answers) => {
            return answers.useCase === 'dom';
        }
    },
    {
        choices: scopes,
        default: HintScope.any,
        message: 'Please select the scope of this new hint:',
        name: 'scope',
        type: 'list',
        when(answers: inquirer.Answers) {
            return !answers.multi;
        }
    },
    {
        default: true,
        message: 'Want to add more hints (yes)?',
        name: 'again',
        type: 'confirm',
        when: () => {
            return type === QuestionsType.hint;
        }
    }];
};

/** Copies the required files for no official hints. */
const copyFiles = async (origin: string, destination: string) => {

    logger.log(`Creating new hint in ${destination}`);
    await copy(origin, destination);
    logger.log('External files copied');
};

/** Copies and processes the required files for a hint package (multi or not). */
const generateHintFiles = async (destination: string, data: any) => {
    const commonFiles = [
        {
            destination: join(destination, 'src', `index.ts`),
            path: join(__dirname, TEMPLATE_PATH, 'index.ts.hbs')
        },
        {
            destination: join(destination, 'README.md'),
            path: join(__dirname, TEMPLATE_PATH, 'readme.md.hbs')
        },
        {
            destination: join(destination, 'tsconfig.json'),
            path: join(__dirname, SHARED_TEMPLATE_PATH, 'tsconfig.json.hbs')
        },
        {
            destination: join(destination, 'package.json'),
            path: join(__dirname, SHARED_TEMPLATE_PATH, 'package.hbs')
        }];

    if (!data.official) {
        commonFiles.push({
            destination: join(destination, '.hintrc'),
            path: join(__dirname, SHARED_TEMPLATE_PATH, 'config.hbs')
        });
    }

    const hintFile = {
        destination: join(destination, 'src'),
        path: join(__dirname, TEMPLATE_PATH, 'hint.ts.hbs')
    };
    const testFile = {
        destination: join(destination, 'tests'),
        path: join(__dirname, TEMPLATE_PATH, 'tests.ts.hbs')
    };
    const docFile = {
        destination: join(destination, 'docs'),
        path: join(__dirname, TEMPLATE_PATH, 'hint-doc.hbs')
    };

    for (const file of commonFiles) {
        const { destination: dest, path: p } = file;

        const fileContent = await compileTemplate(p, data);

        await mkdirpAsync(dirname(dest));
        await writeFileAsync(dest, fileContent);
    }

    for (const hint of data.hints) {
        const [hintContent, testContent] = await Promise.all([compileTemplate(hintFile.path, hint), compileTemplate(testFile.path, hint)]);

        // e.g.: hint-ssllabs/src/ssllabs.ts
        const hintPath = join(hintFile.destination, `${hint.normalizedName}.ts`);
        // e.g.: hint-ssllabs/tests/ssllabs.ts
        const testPath = join(testFile.destination, `${hint.normalizedName}.ts`);
        // e.g.: hint-typescript-config/docs/is-valid.ts
        const docPath = join(docFile.destination, `${hint.normalizedName}.md`);

        await Promise.all([mkdirpAsync(dirname(hintPath)), mkdirpAsync(dirname(testPath))]);

        await Promise.all([writeFileAsync(hintPath, hintContent), writeFileAsync(testPath, testContent)]);

        if (data.isMulti) {
            const docContent = await compileTemplate(docFile.path, hint);

            await mkdirpAsync(dirname(docPath));
            await writeFileAsync(docPath, docContent);
        }
    }
};

/** Initializes a wizard to create a new hint */
export default async (): Promise<boolean> => {
    try {
        const results = await inquirer.prompt(questions(QuestionsType.main));
        const hints: Array<inquirer.Answers> = [];

        results.official = await isOfficial();

        const askHints = async () => {
            const hint = await inquirer.prompt(questions(QuestionsType.hint));

            hints.push(hint);

            if (hint.again) {
                await askHints();
            }
        };

        if (results.multi) {
            await askHints();
        }

        results.hints = hints;

        const hintPackage = new HintPackage(results);
        const noOfficialOrigin: string = join(__dirname, 'no-official-files');
        const files: string = join(__dirname, 'files');

        if (!hintPackage.official) {
            await copyFiles(noOfficialOrigin, hintPackage.destination);
        }
        await copyFiles(files, hintPackage.destination);
        await generateHintFiles(hintPackage.destination, hintPackage);

        logger.log(`
New ${hintPackage.isMulti ? 'package' : 'hint'} ${hintPackage.name} created in ${hintPackage.destination}

--------------------------------------
----          How to use          ----
--------------------------------------`);

        if (hintPackage.official) {
            logger.log(`1. Run 'yarn' to install the dependencies.
2. Go to the folder 'packages/hint-${hintPackage.normalizedName}'.
3. Run 'yarn build' to build the project.
4. Go to the folder 'packages/hint'.
5. Add your hint to '.hintrc'.
6. Run 'yarn hint https://YourUrl' to analyze your site.`);
        } else {
            logger.log(`1. Go to the folder 'hint-${hintPackage.normalizedName}'.
2. Run 'npm run init' to install all the dependencies and build the project.
3. Run 'npm run hint -- https://YourUrl' to analyze you site.`);
        }

        return true;
    } catch (e) {
        /* istanbul ignore next */{ // eslint-disable-line no-lone-blocks
            logger.error('Error trying to create new hint');
            logger.error(e);

            return false;
        }
    }
};
