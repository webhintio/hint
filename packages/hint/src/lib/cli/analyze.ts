import { promisify } from 'util';
import { URL } from 'url';
import * as path from 'path';

import * as async from 'async';
import * as inquirer from 'inquirer';
import * as ora from 'ora';
import * as boxen from 'boxen';
import * as chalk from 'chalk';

import { HintConfig } from '../config';
import { Engine } from '../engine';
import { CLIOptions, ORA, Problem, Severity, UserConfig, HintResources } from '../types';
import { debug as d } from '../utils/debug';
import { getAsUris } from '../utils/network/as-uri';
import * as logger from '../utils/logging';
import cutString from '../utils/misc/cut-string';
import * as resourceLoader from '../utils/resource-loader';
import { installPackages } from '../utils/npm';

const each = promisify(async.each);
const debug: debug.IDebugger = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Private
 * ------------------------------------------------------------------------------
 */

const askForConfirm = (question: string): inquirer.Answers => {
    debug(`Asking for confirmation`);

    const questions: inquirer.Questions = [{
        message: question,
        name: 'confirm',
        type: 'confirm'
    }];

    return inquirer.prompt(questions);
};

const askUserToCreateConfig = async (): Promise<boolean> => {
    const question: string = `Do you want to create a new configuration?`;
    const launchInit: inquirer.Answers = await askForConfirm(question);

    if (!launchInit.confirm) {
        return false;
    }

    const { default: initHintrc } = await import('./wizards/init');

    const hintrcCreated = await initHintrc();

    if (!hintrcCreated) {
        return false;
    }

    logger.log(`Configuration file .hintrc was created.`);

    return true;
};

const askUserToUseDefaultConfiguration = async (): Promise<boolean> => {
    const question: string = `A valid configuration file can't be found. Do you want to use the default configuration? To know more about the default configuration see: https://webhint.io/docs/user-guide/#default-configuration`;
    const confirmation: inquirer.Answers = await askForConfirm(question);

    return confirmation.confirm;
};

const showMissingAndIncompatiblePackages = (resources: HintResources) => {
    if (resources.missing.length > 0) {
        logger.log(`The following ${resources.missing.length === 1 ? 'package is' : 'packages are'} missing:
    ${resources.missing.join(', ')}`);
    }

    if (resources.incompatible.length > 0) {
        logger.log(`The following ${resources.incompatible.length === 1 ? 'package is' : 'packages are'} incompatible:
    ${resources.incompatible.join(', ')}`);
    }
};

const askUserToInstallDependencies = async (resources: HintResources): Promise<boolean> => {
    showMissingAndIncompatiblePackages(resources);

    const dependencies: Array<string> = resources.incompatible.concat(resources.missing);

    const question: Array<object> = [{
        message: `There ${dependencies.length === 1 ? 'is a package' : 'are packages'} from your .hintrc file not installed or with an incompatible version. Do you want us to try to install/update them?`,
        name: 'confirm',
        type: 'confirm'
    }];

    const answer: inquirer.Answers = await inquirer.prompt(question);

    return answer.confirm;
};

const showDefaultMessage = () => {
    const defaultMessage = `${chalk.default.yellow(`Couldn't find any valid configuration`)}

Running hint with the default configuration.

Learn more about how to create your own configuration at:

${chalk.default.green('https://webhint.io/docs/user-guide/')}`;

    logger.log(boxen(defaultMessage, {
        align: 'center',
        margin: 1,
        padding: 1
    }));
};

const getDefaultConfiguration = () => {
    showDefaultMessage();

    return { extends: ['web-recommended'] };
};

const getUserConfig = (actions?: CLIOptions): UserConfig => {
    const configPath: string = (actions && actions.config) || HintConfig.getFilenameForDirectory(process.cwd());

    if (!configPath) {
        return getDefaultConfiguration();
    }

    debug(`Loading configuration file from ${configPath}.`);
    try {
        const resolvedPath: string = path.resolve(process.cwd(), configPath);

        const config: UserConfig = HintConfig.loadConfigFile(resolvedPath);

        return config || getDefaultConfiguration();
    } catch (e) {
        logger.error(e);

        return null;
    }
};

const messages = {
    'fetch::end': '%url% downloaded',
    'fetch::start': 'Downloading %url%',
    'scan::end': 'Finishing...',
    'scan::start': 'Analyzing %url%',
    'traverse::down': 'Traversing the DOM',
    'traverse::end': 'Traversing finished',
    'traverse::start': 'Traversing the DOM',
    'traverse::up': 'Traversing the DOM'
};

const getEvent = (event: string) => {
    if (event.startsWith('fetch::end')) {
        return 'fetch::end';
    }

    return event;
};

const setUpUserFeedback = (engine: Engine, spinner: ORA) => {
    engine.prependAny((event: string, value: { resource: string }) => {
        const message: string = messages[getEvent(event)];

        if (!message) {
            return;
        }

        spinner.text = message.replace('%url%', cutString(value.resource));
    });
};

const getDefaultOrCreateConfig = async (actions: CLIOptions): Promise<HintConfig> => {
    const useDefault = await askUserToUseDefaultConfiguration();
    let userConfig: UserConfig;

    if (useDefault) {
        showDefaultMessage();
        userConfig = { extends: ['web-recommended'] };
    } else {
        const created = await askUserToCreateConfig();

        if (created) {
            // Because the configuration was created using the wizard, the configuration file will be in process.cwd()
            userConfig = await getUserConfig();
        } else {
            logger.error(`Unable to find a valid configuration file. Please create a valid .hintrc file using 'hint --init'. `);

            return null;
        }
    }

    return HintConfig.fromConfig(userConfig, actions);
};

const getHintConfiguration = async (userConfig: UserConfig, actions: CLIOptions): Promise<HintConfig> => {
    if (!userConfig) {
        return getDefaultOrCreateConfig(actions);
    }

    let config: HintConfig;

    try {
        config = HintConfig.fromConfig(userConfig, actions);
    } catch (err) {
        logger.error(err.message);

        config = await getDefaultOrCreateConfig(actions);
    }

    return config;
};

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

// HACK: we need this to correctly test the messages in tests/lib/cli.ts.

export let engine: Engine = null;

/** Analyzes a website if indicated by `actions`. */
export default async (actions: CLIOptions): Promise<boolean> => {

    const targets: Array<URL> = getAsUris(actions._);

    if (targets.length === 0) {
        return false;
    }

    // userConfig will be null if an error occurred loading the user configuration (error parsing a JSON)
    const userConfig: UserConfig = await getUserConfig(actions);
    const config: HintConfig = await getHintConfiguration(userConfig, actions);

    if (!config) {
        return false;
    }

    let resources = resourceLoader.loadResources(config);

    if (resources.missing.length > 0 || resources.incompatible.length > 0) {
        const missingPackages = resources.missing.map((name) => {
            return `@hint/${name}`;
        });

        const incompatiblePackages = resources.incompatible.map((name) => {
            // If the packages are incompatible, we need to force to install the latest version.
            return `@hint/${name}@latest`;
        });

        if (!(await askUserToInstallDependencies(resources) &&
            await installPackages(missingPackages) &&
            await installPackages(incompatiblePackages))) {

            // The user doesn't want to install the dependencies or something went wrong installing them
            return false;
        }

        // After installing all the packages, we need to load the resources again.
        resources = resourceLoader.loadResources(config);
    }

    const invalidConfigRules = HintConfig.validateRulesConfig(config).invalid;

    if (invalidConfigRules.length > 0) {
        logger.error(`Invalid rule configuration in .hintrc: ${invalidConfigRules.join(', ')}.`);

        return false;
    }

    engine = new Engine(config, resources);

    const start: number = Date.now();
    const spinner: ORA = ora({ spinner: 'line' });
    let exitCode: number = 0;

    if (!actions.debug) {
        spinner.start();
        setUpUserFeedback(engine, spinner);
    }

    const endSpinner = (method: string) => {
        if (!actions.debug && spinner[method]) {
            spinner[method]();
        }
    };

    const hasError = (reports: Array<Problem>): boolean => {
        return reports.some((result: Problem) => {
            return result.severity === Severity.error;
        });
    };

    const print = async (reports: Array<Problem>, target: string): Promise<void> => {
        if (hasError(reports)) {
            endSpinner('fail');
        } else {
            endSpinner('succeed');
        }

        await each(engine.formatters, async (formatter) => {
            await formatter.format(reports, target);
        });
    };

    engine.on('print', print);

    for (const target of targets) {
        try {
            const results: Array<Problem> = await engine.executeOn(target);

            if (hasError(results)) {
                exitCode = 1;
            }

            await print(results, target.href);
        } catch (e) {
            exitCode = 1;
            endSpinner('fail');
            debug(`Failed to analyze: ${target.href}`);
            debug(e);
        }
    }

    await engine.close();

    debug(`Total runtime: ${Date.now() - start}ms`);

    return exitCode === 0;
};
