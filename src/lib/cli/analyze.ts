import * as inquirer from 'inquirer';
import * as ora from 'ora';

import * as Config from '../config';
import { Sonar } from '../sonar';
import { CLIOptions, IConfig, IFormatter, IORA, IProblem, Severity, URL } from '../types';
import { debug as d } from '../utils/debug';
import { getAsUris } from '../utils/get-as-uri';
import * as logger from '../utils/logging';
import { cutString } from '../utils/misc';
import * as resourceLoader from '../utils/resource-loader';
import { initSonarrc } from './init';

const debug: debug.IDebugger = d(__filename);

// ------------------------------------------------------------------------------
// Private
// ------------------------------------------------------------------------------

const confirmLaunchInit = (): inquirer.Answers => {
    debug(`Initiating launch init confirm.`);

    const question: Array<object> = [{
        message: `A valid configuration file can't be found. Do you want to create a new one?`,
        name: 'confirm',
        type: 'confirm'
    }];

    return inquirer.prompt(question);
};

const askUserToCreateConfig = async (actions: CLIOptions) => {
    const launchInit: inquirer.Answers = await confirmLaunchInit();

    if (!launchInit.confirm) {
        return false;
    }

    await initSonarrc(actions);
    logger.log(`Configuration file .sonarrc was created.`);

    return true;
};

const tryToLoadConfig = async (actions: CLIOptions) => {
    let config: IConfig;
    const configPath: string = actions.config || Config.getFilenameForDirectory(process.cwd());

    debug(`Loading configuration file from ${configPath}.`);
    try {
        config = Config.load(configPath);
    } catch (e) {
        logger.log(`Couldn't load a valid configuration file in ${configPath}.`);
        const created = await askUserToCreateConfig(actions);

        if (created) {
            config = await tryToLoadConfig(actions);
        }
    }

    return config;
};

const messages = {
    'fetch::end': '%url% downloaded',
    'fetch::start': 'Downloading %url%',
    'manifestfetch::end': '%url% downloaded',
    'manifestfetch::start': 'Downloading %url%',
    'scan::end': 'Finishing...',
    'scan::start': 'Analyzing %url%',
    'targetfetch::end': '%url% downloaded',
    'targetfetch::start': 'Downloading %url%',
    'traverse::down': 'Traversing the DOM',
    'traverse::end': 'Traversing finished',
    'traverse::start': 'Traversing the DOM',
    'traverse::up': 'Traversing the DOM'
};

const setUpUserFeedback = (sonarInstance: Sonar, spinner: IORA) => {
    sonarInstance.prependAny((event: string, value: { resource: string }) => {
        const message: string = messages[event];

        if (!message) {
            return;
        }

        spinner.text = message.replace('%url%', cutString(value.resource));
    });
};

const format = (formatterName: string, results: IProblem[]) => {
    const formatter: IFormatter = resourceLoader.loadFormatter(formatterName) || resourceLoader.loadFormatter('json');

    formatter.format(results);
};

// ------------------------------------------------------------------------------
// Public
// ------------------------------------------------------------------------------

// HACK: we need this to correctly test the messages in tests/lib/cli.ts.
export let sonar: Sonar = null;

/** Analyzes a website if indicated by `actions`. */
export const analyze = async (actions: CLIOptions): Promise<boolean> => {
    if (!actions._) {
        return false;
    }

    const targets: Array<URL> = getAsUris(actions._);

    if (targets.length === 0) {
        return false;
    }

    const config: IConfig = await tryToLoadConfig(actions);

    if (!config) {
        logger.log(`Unable to find a valid configuration file. Please add a .sonarrc file by running 'sonar --init'. `);

        return false;
    }

    sonar = new Sonar(config);
    const start: number = Date.now();
    const spinner: IORA = ora({ spinner: 'line' });
    let exitCode: number = 0;

    if (!actions.debug) {
        spinner.start();
        setUpUserFeedback(sonar, spinner);
    }

    const endSpinner = (method: string) => {
        if (!actions.debug) {
            spinner[method]();
        }
    };

    for (const target of targets) {
        try {
            const results: Array<IProblem> = await sonar.executeOn(target); // eslint-disable-line no-await-in-loop
            const hasError: boolean = results.some((result: IProblem) => {
                return result.severity === Severity.error;
            });

            if (hasError) {
                exitCode = 1;
                endSpinner('fail');
            } else {
                endSpinner('succeed');
            }

            sonar.formatters.forEach((formatter) => {
                format(formatter, results);
            });
        } catch (e) {
            exitCode = 1;
            endSpinner('fail');
            debug(`Failed to analyze: ${target.href}`);
            debug(e);
        }
    }

    await sonar.close();

    debug(`Total runtime: ${Date.now() - start}ms`);

    return exitCode === 0;
};
