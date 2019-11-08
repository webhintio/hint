import { Config, ErrorData, Results } from '../../shared/types';

import { getUpdatedActivity, initTelemetry, updateTelemetry, trackEvent } from '@hint/utils-telemetry';
import { determineHintStatus } from './hints';
import * as storage from './storage';

const manifest = require('../../manifest.json');
const activityKey = 'webhint-activity';
const storageKey = 'webhint-telemetry';
const alreadyOptInKey = 'webhint-already-opt-in';

const instrumentationKey = '8ef2b55b-2ce9-4c33-a09a-2c3ef605c97d';

/** Check if telemetry is enabled */
export const enabled = (s = storage) => {
    return !!s.getItem(storageKey);
};

initTelemetry({
    defaultProperties: { 'extension-version': manifest.version },
    enabled: enabled(),
    instrumentationKey,
    post: async (url, data) => {
        const response = await fetch(url, { body: data, method: 'POST' });

        return response.status;
    }
});

/**
 * Return true if the user has not respond yet
 * to opt-in.
 */
export const showOptIn = (s = storage) => {
    return s.getItem(storageKey) === undefined;
};

/** Called to initialize the underlying analytics library. */
export const setup = (s = storage) => {
    const telemetry = s.getItem(storageKey);

    if (!telemetry) {
        console.log('telemetry disabled');
        updateTelemetry(false);

        return;
    }

    console.log('telemetry enabled');
    updateTelemetry(true);
};

/** Enables telemetry */
export const enable = (s = storage) => {
    s.setItem(storageKey, true);

    setup(s);

    // If it is the first time the user enable telemetry
    if (!s.getItem(alreadyOptInKey)) {
        s.setItem(alreadyOptInKey, true);
        trackEvent('f12-telemetry');
    }
};

/** Disables telemetry */
export const disable = (s = storage) => {
    s.setItem(storageKey, false);

    setup(s);
};

/**
 * Report once per UTC day that a user is active (has run a scan).
 * Data includes `last28Days` (e.g. `"1001100110011001100110011001"`)
 * and `lastUpdated` (e.g. `"2019-10-04T00:00:00.000Z"`).
 */
const trackActive = (s = storage) => {
    // Don't count a user as active if telemetry is disabled.
    if (!enabled(s)) {
        return;
    }

    const activity = getUpdatedActivity(s.getItem(activityKey));

    if (activity) {
        s.setItem(activityKey, activity);
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
