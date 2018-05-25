import * as path from 'path';
import { promisify } from 'util';

import * as fs from 'fs-extra';
import * as inquirer from 'inquirer';
import * as mkdirp from 'mkdirp';

import { CLIOptions } from '../../types';
import * as logger from '../../utils/logging';
import { isOfficial, normalizeStringByDelimiter as normalize, writeFileAsync } from '../../utils/misc';
import { escapeSafeString, compileTemplate, sonarwhalPackage } from '../../utils/handlebars';

/*
 * ------------------------------------------------------------------------------
 * Types.
 * ------------------------------------------------------------------------------
 */
/** Type for questions about the events in the parser. */
type EventType = {
    again: boolean;
    element: string;
    event: string;
};

/** Type for questions about the parser. */
type QuestionsType = {
    again: boolean;
    description: string;
    eventsSelected: Array<EventType>;
    name: string;
    isOfficial: boolean;
};

/** Type for events in the parser. */
type ParserEventType = {
    event: string;
    handler: string;
    type: string;
    varName: string;
};

/*
 * ------------------------------------------------------------------------------
 * Classes and dependencies.
 * ------------------------------------------------------------------------------
 */
const events = {
    'element::': 'ElementFound',
    'fetch::end::*': 'FetchEnd',
    'fetch::end::html': 'FetchEnd',
    'fetch::error': 'FetchError',
    'fetch::start': 'FetchStart',
    'scan::end': 'ScanEnd',
    'scan::start': 'ScanStart',
    'traverse::down': 'TraverseDown',
    'traverse::end': 'TraverseEnd',
    'traverse::start': 'TraverseStart',
    'traverse::up': 'TraverseUp'
};

/**
 * Convert a string to a capitalized one.
 * i.e.: my-awesome parser -> MyAwesomeParser
 */
const capitalize = (str: string): string => {
    if (str === '*') {
        return '';
    }

    const splittedText: Array<string> = normalize(str, ' ').split(' ');

    const result = splittedText.reduce((total, text) => {
        if (!text) {
            return total;
        }

        return `${total}${text.charAt(0).toUpperCase()}${text.slice(1)}`;
    }, '');

    return result;
};

class NewParser {
    public name: string;
    public normalizedName: string;
    public capitalizedName: string;
    public description: hbs.SafeString;
    public events: Array<ParserEventType> = [];
    public eventTypes: Array<string>;
    public packageDir: string;
    public processDir: string;
    public destination: string;
    public packageMain: string;
    public packageName: string;
    public version: string;
    public official: boolean;
    public isParser: boolean = true;

    public constructor(parserData: QuestionsType) {
        this.name = parserData.name;
        this.normalizedName = normalize(parserData.name, '-');
        this.capitalizedName = capitalize(parserData.name);
        this.description = escapeSafeString(parserData.description);

        // Using `Set` to avoid duplicates.
        const eventTypesSet: Set<string> = new Set();

        parserData.eventsSelected.forEach((event: EventType) => {
            const isElement = event.event === 'element::';
            const type: string = events[event.event];
            const eventSplit = event.event.split('::');
            const handler: string = `on${capitalize(eventSplit[0])}${capitalize(isElement ? event.element : eventSplit[1])}${eventSplit[2] ? capitalize(eventSplit[2]) : ''}`;
            const varName: string = `${type.charAt(0).toLowerCase()}${type.substr(1)}`;

            this.events.push({
                event: isElement ? event.event + event.element : event.event,
                handler,
                type,
                varName
            });

            eventTypesSet.add(type);
        });

        this.official = parserData.isOfficial;

        const prefix = this.official ? '@sonarwhal/' : 'sonarwhal-';

        this.version = sonarwhalPackage.version;
        this.packageMain = `dist/src/index.js`; // package.json#main
        this.packageName = `${prefix}parser-${this.normalizedName}`; // package.json#name
        this.destination = path.join(process.cwd(), `parser-${this.normalizedName}`);
        this.processDir = process.cwd();
        // Handlebars doesn't support 'Set' by default.
        this.eventTypes = [...eventTypesSet];
    }
}

/*
 * ------------------------------------------------------------------------------
 * Constants and Private functions.
 * ------------------------------------------------------------------------------
 */
const mkdirpAsync = promisify(mkdirp);
const eventList: Array<string> = Object.keys(events);
const TEMPLATE_PATH: string = './templates/new-parser';
const SHARED_TEMPLATE_PATH = './shared-templates';

/** Configure questions depending on what we need. */
const questions = (repeat: boolean = false) => {
    return [
        {
            default: 'newParser',
            message: `What's the name of this new parser?`,
            name: 'name',
            type: 'input',
            when() {
                return !repeat;
            }
        },
        {
            default(answers) {
                return `Description for ${answers.name}`;
            },
            message(answers) {
                return `What's the description of this new parser '${answers.name}'?`;
            },
            name: 'description',
            type: 'input',
            when() {
                return !repeat;
            }
        },
        {
            choices: eventList,
            default: 'fetch::end::*',
            message: 'Please select an event to subscribe in the parser',
            name: 'event',
            type: 'list',
            when() {
                return repeat;
            }
        },
        {
            default: 'div',
            message: `What's the element for the event?`,
            name: 'element',
            type: 'input',
            when(answers) {
                return answers.event === 'element::';
            }
        },
        {
            default: true,
            message: 'Want to add more events (yes)?',
            name: 'again',
            type: 'confirm',
            when() {
                return repeat;
            }
        }
    ];
};

const copyFiles = async (data: NewParser) => {
    const files = path.join(__dirname, 'files');
    const noOfficialFiles = path.join(__dirname, 'no-official-files');

    logger.log(`Creating new rule in ${data.destination}`);
    if (!data.official) {
        await fs.copy(noOfficialFiles, data.destination);
    }
    await fs.copy(files, data.destination);
    logger.log('Files copied');
};

const generateFiles = async (data: NewParser) => {
    const files = [
        {
            destination: path.join(data.destination, 'src', `${data.normalizedName}.ts`),
            path: path.join(__dirname, TEMPLATE_PATH, 'script.hbs')
        },
        {
            destination: path.join(data.destination, 'tests', `${data.normalizedName}.ts`),
            path: path.join(__dirname, TEMPLATE_PATH, 'tests.hbs')
        },
        {
            destination: path.join(data.destination, 'src', `index.ts`),
            path: path.join(__dirname, TEMPLATE_PATH, 'index.hbs')
        },
        {
            destination: path.join(data.destination, 'README.md'),
            path: path.join(__dirname, TEMPLATE_PATH, 'doc.hbs')
        },
        {
            destination: path.join(data.destination, 'tsconfig.json'),
            path: path.join(__dirname, SHARED_TEMPLATE_PATH, 'tsconfig.json.hbs')
        },
        {
            destination: path.join(data.destination, 'package.json'),
            path: path.join(__dirname, SHARED_TEMPLATE_PATH, 'package.hbs')
        }
    ];

    if (!data.official) {
        files.push({
            destination: path.join(data.destination, '.sonarwhalrc'),
            path: path.join(__dirname, SHARED_TEMPLATE_PATH, 'config.hbs')
        });
    }

    for (const file of files) {
        const { destination: dest, path: filePath } = file;

        const fileContent = await compileTemplate(filePath, data);

        await mkdirpAsync(path.dirname(dest));
        await writeFileAsync(dest, fileContent);
    }
};

/*
 * ------------------------------------------------------------------------------
 * Public functions.
 * ------------------------------------------------------------------------------
 */
/** Generate a new parser. */
export default async (actions: CLIOptions): Promise<boolean> => {
    if (!actions.newParser) {
        return false;
    }

    const results: QuestionsType = (await inquirer.prompt(questions()) as QuestionsType);
    const eventsSelected: Array<EventType> = [];

    results.isOfficial = await isOfficial();

    if (!results.name) {
        throw new Error(`Name can't be empty`);
    }

    const askEvents = async () => {
        const event: EventType = (await inquirer.prompt(questions(true)) as EventType);

        if (event.event !== 'element::') {
            eventList.splice(eventList.indexOf(event.event), 1);
            eventsSelected.push(event);
        } else {
            const elementExists = eventsSelected.find((ev) => {
                return ev.element === event.element;
            });

            if (!elementExists) {
                eventsSelected.push(event);
            }
        }

        if (event.again) {
            await askEvents();
        }

        return;
    };

    await askEvents();

    results.eventsSelected = eventsSelected;

    const parserData = new NewParser(results);

    await copyFiles(parserData);
    await generateFiles(parserData);

    logger.log(`
New parser created in ${parserData.destination}

--------------------------------------
----          How to use          ----
--------------------------------------`);

    if (parserData.official) {
        logger.log(`1. Run 'yarn' to install the dependencies.
2. Go to the folder '${parserData.destination}'.
3. Run 'yarn build' to build the project.
4. Go to the folder 'packages/sonarwhal'.
5. Add your parser to '.sonarwhalrc'.
6. Run 'yarn sonarwhal https://YourUrl' to analyze your site.`);
    } else {
        logger.log(`1. Go to the folder '${parserData.destination}'.
2. Run 'npm run init' to install all the dependencies and build the project.
3. Run 'npm run sonarwhal -- https://YourUrl' to analyze you site.`);
    }

    return true;
};
