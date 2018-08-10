import { promisify } from 'util';
import { URL } from 'url';
import * as path from 'path';

import * as async from 'async';
import * as ora from 'ora';
import * as boxen from 'boxen';
import * as chalk from 'chalk';
import * as isCI from 'is-ci';

import * as configStore from '../utils/configstore';
import { Configuration } from '../config';
import { Engine } from '../engine';
import { CLIOptions, ORA, Problem, Severity, UserConfig, HintResources } from '../types';
import { debug as d } from '../utils/debug';
import { getAsUris } from '../utils/network/as-uri';
import * as logger from '../utils/logging';
import askForConfirm from '../utils/misc/ask-question';
import cutString from '../utils/misc/cut-string';
import * as resourceLoader from '../utils/resource-loader';
import { installPackages } from '../utils/npm';
import * as insights from '../utils/appinsights';
import { FormatterOptions } from '../types/formatters';
import loadHintPackage from '../utils/packages/load-hint-package';

const each = promisify(async.each);
const debug: debug.IDebugger = d(__filename);
const configStoreKey: string = 'run';

/*
 * ------------------------------------------------------------------------------
 * Private
 * ------------------------------------------------------------------------------
 */

const printFrame = (message: string) => {
    logger.log(boxen(message, {
        align: 'center',
        margin: 1,
        padding: 1
    }));
};

/**
 * Prints a message asking user to accept send telemetry data.
 */
const showTelemetryMessage = () => {
    const message: string = `Help us improve webhint
by sending limited usage information
(no personal information or URLs will be sent).

To know more about what information will be sent please
visit ${chalk.default.green('https://webhint.io/docs/user-guide/telemetry')}`;

    printFrame(message);
};

/**
 * Prints a message asking user to configure the telemetry.
 */
const showCITelemetryMessage = () => {
    const message: string = `Help us improve webhint
by sending limited usage information
(no personal information or URLs will be sent).

To know more about what information will be sent please
visit ${chalk.default.green('https://webhint.io/docs/user-guide/telemetry')}

Please configure it using
the environment variable HINT_TRACKING to 'on' or 'off'
or set the flag --tracking=on|off`;

    printFrame(message);
};

/** Ask user if he wants to activate the telemetry or not. */
const askForTelemetryConfirmation = async (config: Configuration) => {
    if (insights.isConfigured()) {
        return;
    }

    if (isCI) {
        if (!insights.isConfigured()) {
            showCITelemetryMessage();
        }

        return;
    }

    const alreadyRun: boolean = configStore.get(configStoreKey);

    if (!alreadyRun) { /* This is the first time, don't ask anything. */
        configStore.set(configStoreKey, true);

        return;
    }

    showTelemetryMessage();

    const message: string = `Do you want to opt-in?`;

    debug(`Prompting telemetry permission.`);

    const confirm: boolean = await askForConfirm(message);

    if (confirm) {
        insights.enable();

        insights.trackEvent('SecondRun');
        insights.trackEvent('analyze', config);

        return;
    }

    insights.disable();
};

const askUserToUseDefaultConfiguration = async (): Promise<boolean> => {
    const question: string = `A valid configuration file can't be found. Do you want to use the default configuration? To know more about the default configuration see: https://webhint.io/docs/user-guide/#default-configuration`;
    const confirmation: boolean = await askForConfirm(question);

    return confirmation;
};

/** Prints the list of missing and incompatible resources found. */
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

    const question: string = `There ${dependencies.length === 1 ? 'is a package' : 'are packages'} from your .hintrc file not installed or with an incompatible version. Do you want us to try to install/update them?`;

    const answer: boolean = await askForConfirm(question);

    return answer;
};

/**
 * Prints a message telling the user a valid configuration couldn't be found and the
 * defaults will be used.
 */
const showDefaultMessage = () => {
    const defaultMessage = `${chalk.default.yellow(`Couldn't find any valid configuration`)}

Running hint with the default configuration.

Learn more about how to create your own configuration at:

${chalk.default.green('https://webhint.io/docs/user-guide/')}`;

    printFrame(defaultMessage);
};

/**
 * Prints a message to the screen alerting the user the defautl configuration
 * will be used and returns the default configuration.
 */
const getDefaultConfiguration = () => {
    showDefaultMessage();

    return { extends: ['web-recommended'] };
};

const getUserConfig = (actions?: CLIOptions): UserConfig => {
    const configPath: string = (actions && actions.config) || Configuration.getFilenameForDirectory(process.cwd());

    if (!configPath) {
        return getDefaultConfiguration();
    }

    debug(`Loading configuration file from ${configPath}.`);
    try {
        const resolvedPath: string = path.resolve(process.cwd(), configPath);

        const config: UserConfig = Configuration.loadConfigFile(resolvedPath);

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

/** Asks the users if they want to create a new configuration file or use the default one. */
const getDefaultOrCreateConfig = async (actions: CLIOptions): Promise<Configuration> => {
    const useDefault = await askUserToUseDefaultConfiguration();
    let userConfig: UserConfig;

    if (useDefault) {
        userConfig = getDefaultConfiguration();
    } else {
        logger.error(`Unable to find a valid configuration file. Please create a valid .hintrc file using 'npm init hintrc'.`);

        return null;
    }

    return Configuration.fromConfig(userConfig, actions);
};

/**
 * Returns the configuration to use for the current execution.
 * Depending on the user, the configuration could be read from a file,
 * could be a new created one, or use the defaults.
 */
const getHintConfiguration = async (userConfig: UserConfig, actions: CLIOptions): Promise<Configuration> => {
    if (!userConfig) {
        return getDefaultOrCreateConfig(actions);
    }

    let config: Configuration;

    try {
        config = Configuration.fromConfig(userConfig, actions);
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
    const config: Configuration = await getHintConfiguration(userConfig, actions);

    if (!config) {
        return false;
    }

    let resources = resourceLoader.loadResources(config);

    insights.trackEvent('analyze', config);

    if (resources.missing.length > 0 || resources.incompatible.length > 0) {
        if (resources.missing.length > 0) {
            insights.trackEvent('missing', resources.missing);
        }

        if (resources.incompatible.length > 0) {
            insights.trackEvent('incompatible', resources.incompatible);
        }

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

    const invalidConfigHints = Configuration.validateHintsConfig(config).invalid;

    if (invalidConfigHints.length > 0) {
        logger.error(`Invalid hint configuration in .hintrc: ${invalidConfigHints.join(', ')}.`);

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

    const print = async (reports: Array<Problem>, target: string, scanTime: number): Promise<void> => {
        const formatterOptions: FormatterOptions = {
            config: userConfig,
            scanTime,
            version: loadHintPackage().version
        };

        await each(engine.formatters, async (formatter) => {
            await formatter.format(reports, target, formatterOptions);
        });
    };

    engine.on('print', print);

    for (const target of targets) {
        try {
            const scanStart = Date.now();
            const results: Array<Problem> = await engine.executeOn(target);
            const scanEnd = Date.now();

            if (hasError(results)) {
                exitCode = 1;
            }

            endSpinner(exitCode ? 'fail' : 'succeed');

            await askForTelemetryConfirmation(config);
            await print(results, target.href, scanEnd - scanStart);
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
