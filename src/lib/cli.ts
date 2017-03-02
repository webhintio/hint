/**
 * @fileoverview Main CLI object, it reads the configuration (from file and parameters) and passes it to the engine
 * @author Anton Molleda (@molant) *
 */

/*
 * The CLI object should *not* call process.exit() directly. It should only return
 * exit codes. This allows other programs to use the CLI object and still control
 * when the program exits.
 */

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

const options = require('./ui/options'),
    log = require('./util/logging'),
    Config = require('./config'),
    sonar = require('./sonar'),
    validator = require('./config/config-validator'),
    pkg = require('../package.json');
import * as  resourceLoader from './util/resource-loader';

const debug = require('debug')('sonar:cli');


/** Executes the CLI based on an array of arguments that is passed in. */
export const execute = async (args: string | Array<string> | Object): Promise<number> => {
        const format = (results) => {
            const formatters = resourceLoader.getFormatters();

            formatters.forEach((formatter) => {
                formatter(results);
            });
        };

        const currentOptions = options.parse(args);

        const targets = currentOptions._;

        if (currentOptions.version) { // version from package.json
            log.info(`v${pkg.version}`);

            return 0;
        }

        if (currentOptions.help || !targets.length) {
            log.info(options.generateHelp());

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
            log.error('Configuration not valid');

            return 1;
        }

        const engine = sonar.create(config);

        const start = Date.now();

        for (const target of targets) {
            const results = await engine.executeOn(target); // eslint-disable-line no-await-in-loop

            format(results);
        }

        debug(`Total runtime: ${Date.now() - start}ms`);

        return 0;
    }


