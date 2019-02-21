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

import * as insights from '../lib/utils/app-insights';
import * as configStore from '../lib/utils/config-store';

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
        const configured = insights.isConfigured();

        insights.enable();

        if (!configured) {
            if (!alreadyRun) {
                insights.trackEvent('FirstRun');
            } else {
                insights.trackEvent('SecondRun');
            }
        }
    } else {
        insights.disable();
    }
}

/*
 * ------------------------------------------------------------------------------
 * Requirements
 * ------------------------------------------------------------------------------
 * Now we can safely include the other modules that use debug.
 */
import * as cli from '../lib/cli';
import { trackException, sendPendingData } from '../lib/utils/app-insights';

/*
 * ------------------------------------------------------------------------------
 * Execution
 * ------------------------------------------------------------------------------
 */

process.once('uncaughtException', async (err) => {
    console.error(err.message);
    console.error(err.stack);
    trackException(err);
    await sendPendingData();
    process.exit(1);
});

process.once('unhandledRejection', async (reason) => {
    const source = reason.error ? reason.error : reason;

    trackException(source);
    await sendPendingData();
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
