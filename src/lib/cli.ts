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

import * as Config from './config';
import { debug as d } from './utils/debug';
import { getAsUris } from './utils/get-as-uri';
import { loadJSONFile } from './utils/file-loader';
import * as logger from './utils/logging';
import { options } from './ui/options';
import * as resourceLoader from './utils/resource-loader';
import { Severity } from './types';
import * as sonar from './sonar';
import * as validator from './config/config-validator';

const debug = d(__filename);
const pkg = loadJSONFile(path.join(__dirname, '../../../package.json'));

// ------------------------------------------------------------------------------
// Public
// ------------------------------------------------------------------------------

export const cli = {
    /** Executes the CLI based on an array of arguments that is passed in. */
    execute: async (args: string | Array<string> | Object): Promise<number> => {

        const format = (formatterName, results) => {
            const formatters = resourceLoader.getFormatters();
            const formatter = formatters.get(formatterName) || formatters.get('json');

            formatter.format(results);
        };

        const currentOptions = options.parse(args);
        const targets = getAsUris(currentOptions._);

        if (currentOptions.version) { // version from package.json
            logger.log(`v${pkg.version}`);

            return 0;
        }

        if (currentOptions.init) {
            await Config.generate();

            return 0;
        }

        if (currentOptions.help || !targets.length) {
            logger.log(options.generateHelp());

            return 0;
        }

        let configPath;

        if (!currentOptions.config) {
            configPath = Config.getFilenameForDirectory(process.cwd());
        } else {
            configPath = currentOptions.config;
        }

        const config = Config.load(configPath);

        if (!validator.validateConfig(config)) {
            logger.error('Configuration not valid');

            return 1;
        }

        const engine = await sonar.create(config);
        const start = Date.now();

        let exitCode = 0;

        for (const target of targets) {
            try {
                const results = await engine.executeOn(target); // eslint-disable-line no-await-in-loop
                const hasError = results.some((result) => {
                    return result.severity === Severity.error;
                });

                format(engine.formatter, results);

                if (hasError) {
                    exitCode = 1;

                }
            } catch (e) {
                exitCode = 1;
                debug(`Failed to analyze: ${target.href}`);
            }
        }

        await engine.close();

        debug(`Total runtime: ${Date.now() - start}ms`);

        return exitCode;

    }
};
