/**
 * @fileoverview Main CLI object, it reads the configuration (from file and parameters) and passes it to the engine
 * @author Anton Molleda (@molant) *
 */


/*
 * The CLI object should *not* call process.exit() directly. It should only return
 * exit codes. This allows other programs to use the CLI object and still control
 * when the program exits.
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const options = require('./ui/options'),
    log = require('./util/logging'),
    Config = require('./config'),
    Sonar = require('./sonar'),

    /*   defaultOptions = require('../conf/cli-options'),
       Plugins = require('./config/plugins'),
       validator = require('./config/config-validator'),
       stringify = require('json-stable-stringify'),
       hash = require('./util/hash'),*/
    pkg = require('../package.json');

const debug = require('debug')('sonar:cli');

module.exports = {
    async execute(args) {
        let currentOptions;

        try {
            currentOptions = options.parse(args);
        } catch (error) {
            log.error(error.message);

            return 1;
        }

        const targets = currentOptions._;

        if (currentOptions.version) { // version from package.json
            log.info(`v${pkg.version}`);
            return 0;
        }

        if (currentOptions.help || !targets.length) {
            log.info(options.generateHelp());
            return 0;
        }

        let config;
        try {
            let configPath;

            if (!currentOptions.config) {
                configPath = Config.getFilenameForDirectory(process.cwd());
            } else {
                configPath = currentOptions.config;
            }

            config = Config.load(configPath);
            // TODO: load formatter here
        } catch (e) {
            debug('Error loading config file');
            debug(`${e}`);
            return 1;
        }


        const sonar = new Sonar(config);
        const start = Date.now();
        for (const target of targets) {
            try {
                const results = await sonar.executeOn(target); // eslint-disable-line no-await-in-loop
                console.log(JSON.stringify(results, null, 2)); // formatter should be used here!
            } catch (err) {
                return 1;
            }
        }

        // TODO: reporting with formatter here
        debug(`Total runtime: ${Date.now() - start}ms`);
        return 0;
    }
};

