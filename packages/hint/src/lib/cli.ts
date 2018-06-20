/**
 * @fileoverview Main CLI object, it reads the configuration (from file and parameters)
 * and passes it to the engine
 */

/*
 * The CLI object should *not* call process.exit() directly. It should only return
 * exit codes. This allows other programs to use the CLI object and still control
 * when the program exits.
 */

/*
 * ------------------------------------------------------------------------------
 * Requirements
 * ------------------------------------------------------------------------------
 */
import chalk from 'chalk';
import * as updateNotifier from 'update-notifier';
import * as inquirer from 'inquirer';

import { CLIOptions } from './types';
import * as logger from './utils/logging';
import getHintPackage from './utils/packages/load-hint-package';
import * as insights from './utils/appinsights';
import { debug as d } from './utils/debug';

import { options } from './cli/options';
import { cliActions } from './cli/actions';

const debug: debug.IDebugger = d(__filename);

/** Notify user if the current version of sonarwhal is not up to date. */
const notifyIfNeeded = () => {
    const pkg = getHintPackage();
    /*
     * Fetch and persist comparison result in the background.
     * Check interval is set as one day by default.
     * To test immediately, set `updateCheckInterval` to 0 and pass it in as a param to `updateNotifier`.
     * Comparison result is loaded on the FIRST initiation, but users won't be notified until the SECOND time it runs.
     * Reference:https://github.com/yeoman/update-notifier#how
     */
    const notifier = updateNotifier({
        pkg,
        updateCheckInterval: 1000 * 60 * 60 * 1 // One hour.
    });

    const update = notifier.update;

    if (!update || update.latest === pkg.version) {
        return;
    }

    const changelogUrl: string = `https://webhint.io/about/changelog/`;
    /*
     * No indentation due to the use of `\` to avoid new line.
     * https://stackoverflow.com/a/35428171
     */
    const message: string = `Update available ${chalk.red(update.current)}${chalk.reset(' → ')}${chalk.green(update.latest)}\
\nSee ${chalk.cyan(changelogUrl)} for details`;

    notifier.notify({ message });
};

/** Ask user if he wants to activate the telemetry or not. */
const askForConfirmation = async () => {
    // TODO: What message should we use here?
    const message: string = `Help us make sonarwhal by sending limited usage information (no URLs or code will be captured). To know more about what information will be sent please visit https://sonarwhal.com/docs/user-guide/telemetry`;

    debug(`Prompting telemetry permission.`);

    const question: Array<object> = [{
        message,
        name: 'confirm',
        type: 'confirm'
    }];

    const answer: inquirer.Answers = await inquirer.prompt(question);

    if (answer.confirm) {
        insights.enable();

        insights.trackEvent('FirstRun');

        return;
    }

    insights.disable();
};

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

/** Executes the CLI based on an array of arguments that is passed in. */
export const execute = async (args: string | Array<string> | Object): Promise<number> => {
    let currentOptions: CLIOptions;

    try {
        currentOptions = options.parse(args);
    } catch (e) {
        logger.error(e.message);

        return 1;
    }

    let handled = false;

    notifyIfNeeded();

    if (insights.isEnabled() === void 0) {
        await askForConfirmation();
    }

    while (cliActions.length > 0 && !handled) {
        const action = cliActions.shift();

        /* istanbul ignore next */
        try {
            handled = await action(currentOptions);
        } catch (e) {
            logger.error(e);

            return 1;
        }
    }

    return handled ? 0 : 1;
};
