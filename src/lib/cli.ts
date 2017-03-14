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

import * as url from 'url';

import * as shell from 'shelljs';
import * as fileUrl from 'file-url';

import { options } from './ui/options';
import * as log from './util/logging';
import * as Config from './config';
import * as sonar from './sonar';
import * as validator from './config/config-validator';
import * as resourceLoader from './util/resource-loader';

const pkg = require('../../package.json');

const debug = require('debug')('sonar:cli');

// ------------------------------------------------------------------------------
// Private
// ------------------------------------------------------------------------------

/** Removes targets that are not valid, and add `http://` to the ones
    that seem to omit it. */
const getTargets = (targets: Array<string>): Array<url.Url> => {
    return targets.reduce((result: Array<url.Url>, value: string): Array<url.Url> => {
        value = value.trim(); // eslint-disable-line no-param-reassign
        let target = url.parse(value);
        const protocol = target.protocol;

        // If it's a URI.

        // Check if the protocol is HTTP or HTTPS.
        if (protocol === 'http:' || protocol === 'https:' || protocol === 'file:') {
            debug(`Adding valid target: ${url.format(target)}`);
            result.push(target);

            return result;
        }

        // If it's not a URI

        // If it does exist and it's a regular file.
        if (shell.test('-f', value)) {
            target = fileUrl(value);
            debug(`Adding valid target: ${url.format(target)}`);
            result.push(target);

            return result;
        }

        // And it doesn't exist locally, just assume it's a URL.
        if (!shell.test('-e', value)) {
            target = url.parse(`http://${value}`);
            debug(`Adding modified target: ${url.format(target)}`);
            result.push(target);

            return result;
        }

        // If it's not a regular file, ignore it.
        log.error(`Ignoring '${target}' as it's not a valid target`);

        return result;
    }, []);
};

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
        const targets = getTargets(currentOptions._);

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
};
