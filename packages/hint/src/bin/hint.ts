#!/usr/bin/env node

/**
 * @fileoverview Main CLI that is run via the hint command. Based on ESLint.
 */

/* eslint-disable no-process-exit */

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

process.once('unhandledRejection', (r) => {
    // TODO: remove once https://github.com/DefinitelyTyped/DefinitelyTyped/issues/33636 is fixed
    const reason = r as any;
    const source = reason && reason instanceof Error ? reason : reason.error;

    console.error(`Unhandled rejection promise:
    uri: ${source.uri}
    message: ${source.message}
    stack:
${source.stack}`);
    process.exit(1);
});

const run = async () => {
    process.exitCode = await cli.execute(process.argv);

    process.exit(process.exitCode);
};

run();
