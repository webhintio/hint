/**
 * @fileoverview Main CLI object, it reads the configuration (from file and parameters)
 * and passes it to the engine
 */

/*
 * The CLI object should *not* call process.exit() directly. It should only return
 * exit codes. This allows other programs to use the CLI object and still control
 * when the program exits.
 */

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

import * as path from 'path';

import * as ora from 'ora';

import * as Config from './config';
import { debug as d } from './utils/debug';
import { getAsUris } from './utils/get-as-uri';
import { CLIOptions, IConfig, IFormatter, IORA, IProblem, URL } from './types'; //eslint-disable-line no-unused-vars
import { loadJSONFile } from './utils/misc';
import * as logger from './utils/logging';
import { cutString } from './utils/misc';
import { options } from './cli/options';
import { newRule, removeRule } from './cli/rule-generator';
import { initSonarrc } from './cli/sonarrc-generator';
import * as resourceLoader from './utils/resource-loader';
import { Severity } from './types';
import { Sonar } from './sonar';

const debug: debug.IDebugger = d(__filename);
const pkg = loadJSONFile(path.join(__dirname, '../../../package.json'));

const messages = {
    'fetch::end': '%url% downloaded',
    'fetch::start': 'Downloading %url%',
    'manifestfetch::end': '%url% downloaded',
    'manifestfetch::start': 'Downloading %url%',
    'scan::end': 'Finishing...',
    'scan::start': 'Analizing %url%',
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

// ------------------------------------------------------------------------------
// Public
// ------------------------------------------------------------------------------

// HACK: we need this to correctly test the messages in tests/lib/cli.ts.
export let sonar: Sonar = null;

/** Executes the CLI based on an array of arguments that is passed in. */
export const execute = async (args: string | Array<string> | Object): Promise<number> => {

    const format = (formatterName: string, results: IProblem[]) => {
        const formatter: IFormatter = resourceLoader.loadFormatter(formatterName) || resourceLoader.loadFormatter('json');

        formatter.format(results);
    };

    const currentOptions: CLIOptions = options.parse(args);
    const targets: Array<URL> = getAsUris(currentOptions._);

    if (currentOptions.version) { // version from package.json
        logger.log(`v${pkg.version}`);

        return 0;
    }

    if (currentOptions.init) {
        await initSonarrc();

        return 0;
    }

    if (currentOptions.newRule) {
        await newRule();

        return 0;
    }

    if (currentOptions.removeRule) {
        await removeRule();

        return 0;
    }

    if (currentOptions.help || !targets.length) {
        logger.log(options.generateHelp());

        return 0;
    }

    let configPath: string;

    if (!currentOptions.config) {
        configPath = Config.getFilenameForDirectory(process.cwd());
    } else {
        configPath = currentOptions.config;
    }

    const config: IConfig = Config.load(configPath);

    sonar = new Sonar(config);
    const start: number = Date.now();
    const spinner: IORA = ora({ spinner: 'line' });
    let exitCode: number = 0;

    if (!currentOptions.debug) {
        spinner.start();
        setUpUserFeedback(sonar, spinner);
    }

    const endSpinner = (method: string) => {
        if (!currentOptions.debug) {
            spinner[method]();
        }
    };

    for (const target of targets) {
        try {
            // spinner.text = `Scanning ${target.href}`;
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

            format(sonar.formatter, results);
        } catch (e) {
            exitCode = 1;
            endSpinner('fail');
            debug(`Failed to analyze: ${target.href}`);
            debug(e);
        }
    }

    await sonar.close();

    debug(`Total runtime: ${Date.now() - start}ms`);

    return exitCode;
};
