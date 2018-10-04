import * as appInsights from 'applicationinsights';

import * as configStore from './configstore';
import { debug as d } from './debug';

interface IFlushOptions {
    callback: () => void;
}

const debug: debug.IDebugger = d(__filename);
const configStoreKey: string = 'insight';

let insightsEnabled = configStore.get(configStoreKey);

let appInsightsClient: appInsights.TelemetryClient = {
    flush(options: IFlushOptions) {
        debug('Application Insights is not enabled.');
        options.callback();
    },
    trackEvent() {
        debug('Application Insights is not enabled.');
    },
    trackException() {
        debug('Application Insights is not enabled.');
    }
} as any;

export const enableInsight = () => {
    debug('Enabling Application Insights');
    appInsights.setup('8ef2b55b-2ce9-4c33-a09a-2c3ef605c97d')
        .setAutoDependencyCorrelation(true)
        .setAutoCollectRequests(true)
        .setAutoCollectPerformance(true)
        .setAutoCollectExceptions(true)
        .setAutoCollectDependencies(true)
        .setUseDiskRetryCaching(true)
        .setInternalLogging(false, false)
        .start();

    appInsightsClient = appInsights.defaultClient;
};

if (insightsEnabled) {
    enableInsight();
} else {
    debug('Application Insight disabled');
}

/** Check if Application Insights is enabled or not. */
export const isEnabled = () => {
    return insightsEnabled;
};

/** Enable Application Insight. */
export const enable = () => {
    debug('User is enabling Application Insights');
    configStore.set(configStoreKey, true);
    insightsEnabled = true;

    enableInsight();
};

/** Disable Application Insights for the future. */
export const disable = () => {
    debug('User is disabling Application Insights');
    configStore.set(configStoreKey, false);
    insightsEnabled = false;
};

/** Send pending data to Application Insights. */
export const sendPendingData = (isAppCrashing = true) => {
    debug('Sending pending data to Application Insights');

    return new Promise((resolve) => {
        appInsightsClient.flush({
            callback: () => {
                resolve();
            },
            isAppCrashing
        });
    });
};

/** Track an exception in Application Insights. */
export const trackException = (error: Error) => {
    debug(`Sending exception to Application Insights: ${error.toString()}`);
    appInsightsClient.trackException({ exception: error });
};

/** Track an event in Application Insights. */
export const trackEvent = (name: string, properties?: {}) => {
    debug(`Sending event "${name}" to Application Insights with value ${JSON.stringify(properties)}`);
    appInsightsClient.trackEvent({ name, properties: { config: JSON.stringify(properties, null, 2) }});
};

/** Return the Application Insights client. */
export const getClient = () => {
    debug('Getting Application Insights client');

    return appInsightsClient;
};

export const isConfigured = (): boolean => {
    return typeof configStore.get(configStoreKey) !== 'undefined';
};
