import { promisify } from 'util';
import { URL } from 'url';
import * as path from 'path';

import * as async from 'async';
import * as inquirer from 'inquirer';
import * as ora from 'ora';
import * as pluralize from 'pluralize';

import { SonarwhalConfig } from '../config';
import { Sonarwhal } from '../sonarwhal';
import { CLIOptions, ORA, Problem, Severity, UserConfig, SonarwhalResources } from '../types';
import { debug as d } from '../utils/debug';
import { getAsUris } from '../utils/get-as-uri';
import * as logger from '../utils/logging';
import { cutString } from '../utils/misc';
import * as resourceLoader from '../utils/resource-loader';
import { installPackages } from '../utils/npm';

const each = promisify(async.each);
const debug: debug.IDebugger = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Private
 * ------------------------------------------------------------------------------
 */

const confirmLaunchInit = (): inquirer.Answers => {
    debug(`Initiating launch init confirm.`);

    const question: Array<object> = [{
        message: `A valid configuration file can't be found. Do you want to create a new one?`,
        name: 'confirm',
        type: 'confirm'
    }];

    return inquirer.prompt(question);
};

const askUserToCreateConfig = async (): Promise<boolean> => {
    const launchInit: inquirer.Answers = await confirmLaunchInit();

    if (!launchInit.confirm) {
        return false;
    }

    const { default: initSonarwhalrc } = await import('./wizards/init');

    await initSonarwhalrc({ init: true } as CLIOptions);
    logger.log(`Configuration file .sonarwhalrc was created.`);

    return true;
};

const showMissingAndIncompatiblePackages = (resources: SonarwhalResources) => {
    if (resources.missing.length > 0) {
        logger.log(`The following ${pluralize('package', resources.missing.length)} ${pluralize('is', resources.missing.length)} missing:
    ${resources.missing.join(', ')}`);
    }

    if (resources.incompatible.length > 0) {
        logger.log(`The following ${pluralize('package', resources.incompatible.length)} ${pluralize('is', resources.incompatible.length)} incompatible:
    ${resources.incompatible.join(', ')}`);
    }
};

const askUserToInstallDependencies = async (resources: SonarwhalResources): Promise<boolean> => {
    showMissingAndIncompatiblePackages(resources);

    const dependencies: Array<string> = resources.incompatible.concat(resources.missing);

    const question: Array<object> = [{
        message: `There ${pluralize('is', dependencies.length)} ${dependencies.length} ${pluralize('package', dependencies.length)} from your .sonarwhalrc file not installed or with an incompatible version. Do you want us to try to install/update them?`,
        name: 'confirm',
        type: 'confirm'
    }];

    const answer: inquirer.Answers = await inquirer.prompt(question);

    return answer.confirm;
};

const getUserConfig = (actions: CLIOptions): UserConfig => {
    let config: UserConfig;
    const configPath: string = actions.config || SonarwhalConfig.getFilenameForDirectory(process.cwd());

    if (!configPath) {
        return null;
    }

    debug(`Loading configuration file from ${configPath}.`);
    try {
        const resolvedPath: string = path.resolve(process.cwd(), configPath);

        config = SonarwhalConfig.loadConfigFile(resolvedPath);
    } catch (e) {
        logger.error(e);
        config = null;
    }

    return config;
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

const setUpUserFeedback = (sonarwhalInstance: Sonarwhal, spinner: ORA) => {
    sonarwhalInstance.prependAny((event: string, value: { resource: string }) => {
        const message: string = messages[getEvent(event)];

        if (!message) {
            return;
        }

        spinner.text = message.replace('%url%', cutString(value.resource));
    });
};

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

// HACK: we need this to correctly test the messages in tests/lib/cli.ts.

export let sonarwhal: Sonarwhal = null;

/** Analyzes a website if indicated by `actions`. */
export default async (actions: CLIOptions): Promise<boolean> => {
    if (!actions._) {
        return false;
    }

    const targets: Array<URL> = getAsUris(actions._);

    if (targets.length === 0) {
        return false;
    }

    let userConfig: UserConfig = await getUserConfig(actions);

    if (!userConfig) {
        logger.error(`Couldn't find a valid path to load the configuration file.`);

        const created = await askUserToCreateConfig();

        if (created) {
            userConfig = await getUserConfig(actions);
        } else {
            logger.error(`Unable to find a valid configuration file. Please add a .sonarwhalrc file by running 'sonarwhal --init'. `);

            return false;
        }
    }

    const config = SonarwhalConfig.fromConfig(userConfig, actions);
    const resources = resourceLoader.loadResources(config);

    if (resources.missing.length > 0 || resources.incompatible.length > 0) {
        const missingPackages = resources.missing.map((name) => {
            return `@sonarwhal/${name}`;
        });

        const incompatiblePackages = resources.incompatible.map((name) => {
            return `@sonarwhal/${name}`;
        });

        if (!(await askUserToInstallDependencies(resources) &&
            await installPackages(missingPackages) &&
            await installPackages(incompatiblePackages))) {

            // The user doesn't want to install the dependencies or something went wrong installing them
            return false;
        }
    }

    const invalidConfigRules = SonarwhalConfig.validateRulesConfig(config).invalid;

    if (invalidConfigRules.length > 0) {
        logger.error(`Invalid rule configuration in .sonarwhalrc: ${invalidConfigRules.join(', ')}.`);

        return false;
    }

    sonarwhal = new Sonarwhal(config, resources);

    const start: number = Date.now();
    const spinner: ORA = ora({ spinner: 'line' });
    let exitCode: number = 0;

    if (!actions.debug) {
        spinner.start();
        setUpUserFeedback(sonarwhal, spinner);
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

        await each(sonarwhal.formatters, async (formatter) => {
            await formatter.format(reports, target);
        });
    };

    sonarwhal.on('print', print);

    for (const target of targets) {
        try {
            const results: Array<Problem> = await sonarwhal.executeOn(target);

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

    await sonarwhal.close();

    debug(`Total runtime: ${Date.now() - start}ms`);

    return exitCode === 0;
};
