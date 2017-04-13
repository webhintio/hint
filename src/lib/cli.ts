/**
 * @fileoverview Main CLI object, it reads the configuration (from file and parameters)
 * and passes it to the engine
 * @author Anton Molleda (@molant)
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
import * as logger from './util/logging';
import * as resourceLoader from './util/resource-loader';
import * as sonar from './sonar';
import * as validator from './config/config-validator';
import { Severity } from './interfaces';
import { debug as d } from './util/debug';
import { getAsUris } from './util/get-as-uri';
import { loadJSONFile } from './util/file-loader';
import { options } from './ui/options';

const debug = d(__filename);
const pkg = loadJSONFile(path.join(__dirname, '../../../package.json'));

// ------------------------------------------------------------------------------
// Public
// ------------------------------------------------------------------------------

export const cli = {
    /** Executes the CLI based on an array of arguments that is passed in. */
    execute: async (args: string | Array<string> | Object): Promise<number> => {

        const format = (results) => {
            const formatters = resourceLoader.getFormatters();

            formatters.forEach((formatter) => {
                formatter.format(results);
            });
        };

        const currentOptions = options.parse(args);
        const targets = getAsUris(currentOptions._);

        if (currentOptions.version) { // version from package.json
            logger.log(`v${pkg.version}`);

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

                format(results);

                if (hasError) {
                    exitCode = 1;

                }
            } catch (e) {
                exitCode = 1;
                debug(`Failed to analyze: ${target.href}`);
            }
        }

        debug(`Total runtime: ${Date.now() - start}ms`);

        return exitCode;

    }
};
