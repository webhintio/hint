#!/usr/bin/env node

/**
 * @fileoverview Main CLI that is run via the sonar command. Based on ESLint.
 */

/* eslint no-console:off, no-process-exit:off */

/*
 * ------------------------------------------------------------------------------
 * Helpers
 * ------------------------------------------------------------------------------
 */

const debug = (process.argv.includes('--debug'));

import * as d from 'debug';

// This initialization needs to be done *before* other requires in order to work.
if (debug) {
    d.enable('sonar:*');
}

/*
 * ------------------------------------------------------------------------------
 * Requirements
 * ------------------------------------------------------------------------------
 * Now we can safely include the other modules that use debug.
 */
import * as cli from '../lib/cli';

/*
 * ------------------------------------------------------------------------------
 * Execution
 * ------------------------------------------------------------------------------
 */

process.once('uncaughtException', (err) => {
    console.error(err.message);
    console.error(err.stack);
    process.exit(1);
});

process.once('unhandledRejection', (reason, promise) => {
    console.error(`Unhandled rejection at: Promise ${promise}, reason: ${reason}`);
    process.exit(1);
});

const run = async () => {
    process.exitCode = await cli.execute(process.argv);
    if (debug) {
        console.log(`Exit code: ${process.exitCode}`);
    }
    process.exit(process.exitCode);
};

run();
