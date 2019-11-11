import { Config, ErrorData, Results } from '../../shared/types';

import { getUpdatedActivity, initTelemetry, updateTelemetry, trackEvent } from '@hint/utils-telemetry';
import { determineHintStatus } from './hints';
import * as localstore from './storage';

const manifest = require('../../manifest.json');
const activityKey = 'webhint-activity';
const storageKey = 'webhint-telemetry';
const alreadyOptInKey = 'webhint-already-opt-in';

/** Check if telemetry is enabled */
export const enabled = (storage = localstore) => {
    return !!storage.getItem(storageKey);
};

initTelemetry({
    defaultProperties: { 'extension-version': manifest.version },
    enabled: enabled(),
    post: async (url, data) => {
        const response = await fetch(url, { body: data, method: 'POST' });

        return response.status;
    }
});

/**
 * Return true if the user has not respond yet
 * to opt-in.
 */
export const showOptIn = (storage = localstore) => {
    return storage.getItem(storageKey) === undefined;
};

/** Called to initialize the underlying analytics library. */
export const setup = (storage = localstore) => {
    const telemetry = storage.getItem(storageKey);

    if (!telemetry) {
        console.log('telemetry disabled');
        updateTelemetry(false);

        return;
    }

    console.log('telemetry enabled');
    updateTelemetry(true);
};

/** Enables telemetry */
export const enable = (storage = localstore) => {
    storage.setItem(storageKey, true);

    setup(storage);

    // If it is the first time the user enable telemetry
    if (!storage.getItem(alreadyOptInKey)) {
        storage.setItem(alreadyOptInKey, true);
        trackEvent('f12-telemetry');
    }
};

/** Disables telemetry */
export const disable = (storage = localstore) => {
    storage.setItem(storageKey, false);

    setup(storage);
};

/**
 * Report once per UTC day that a user is active (has run a scan).
 * Data includes `last28Days` (e.g. `"1001100110011001100110011001"`)
 * and `lastUpdated` (e.g. `"2019-10-04T00:00:00.000Z"`).
 */
const trackActive = (storage = localstore) => {
    // Don't count a user as active if telemetry is disabled.
    if (!enabled(storage)) {
        return;
    }

    const activity = getUpdatedActivity(storage.getItem(activityKey));

    if (activity) {
        storage.setItem(activityKey, activity);
        trackEvent('f12-activity', activity);
    }
};

/** Called when analysis was canceled by the user. */
export const trackCancel = (duration: number) => {
    trackEvent('f12-cancel', undefined, { 'f12-cancel-duration': duration });
};

/** Called when analysis fails due to an error. */
export const trackError = (error: ErrorData) => {
    // Drop the error stack as it can contain filesystem paths.
    trackEvent('f12-error', { message: error.message });
};

/** Called when analysis finished. */
export const trackFinish = (config: Config, results: Results, duration: number) => {
    // Extract hint status from config and results, discarding user-provided data.
    const properties = determineHintStatus(config, results);

    trackEvent('f12-finish', properties, { 'f12-finish-duration': duration });
};

/** Called when the "Hints" tab was opened by the user. */
export const trackShow = () => {
    trackEvent('f12-show');
};

/** Called when analysis was started by the user. */
export const trackStart = () => {
    trackEvent('f12-start');
    trackActive();
};

/** Called when analysis fails to complete in the allotted time. */
export const trackTimeout = (duration: number) => {
    trackEvent('f12-timeout', undefined, { 'f12-timeout-duration': duration });
};
