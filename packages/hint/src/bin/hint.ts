#!/usr/bin/env node

/**
 * @fileoverview Main CLI that is run via the hint command. Based on ESLint.
 */

/* eslint-disable no-process-exit, no-process-env */

/*
 * ------------------------------------------------------------------------------
 * Helpers
 * ------------------------------------------------------------------------------
 */

const tracking = (/--tracking[=\s]+([^\s]*)/i).exec(process.argv.join(' '));

import { configStore, appInsights } from '@hint/utils';

const trackingEnv = process.env.HINT_TRACKING;
let enableTracking;

if (tracking) {
    enableTracking = tracking[1] === 'on';
} else if (trackingEnv) {
    enableTracking = trackingEnv === 'on';
}

if (typeof enableTracking !== 'undefined') {
    if (enableTracking) {
        const alreadyRun: boolean = configStore.get('run');
        const configured = appInsights.isConfigured();

        appInsights.enable();

        if (!configured) {
            if (!alreadyRun) {
                appInsights.trackEvent('FirstRun');
            } else {
                appInsights.trackEvent('SecondRun');
            }
        }
    } else {
        appInsights.disable();
    }
}

/*
 * ------------------------------------------------------------------------------
 * Requirements
 * ------------------------------------------------------------------------------
 * Now we can safely include the other modules that use debug.
 */
import * as cli from '../lib/cli';
const { trackException, sendPendingData } = appInsights;

/*
 * ------------------------------------------------------------------------------
 * Execution
 * ------------------------------------------------------------------------------
 */

process.once('uncaughtException', async (err) => {
    console.error(err.message);
    console.error(err.stack);
    trackException(err);
    await sendPendingData(true);
    process.exit(1);
});

process.once('unhandledRejection', async (r) => {
    // TODO: remove once https://github.com/DefinitelyTyped/DefinitelyTyped/issues/33636 is fixed
    const reason = r as any;
    const source = reason && reason instanceof Error ? reason : reason.error;

    trackException(source);
    await sendPendingData(true);
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
