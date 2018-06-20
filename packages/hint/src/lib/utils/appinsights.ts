import * as Configstore from 'configstore';
import * as appInsights from 'applicationinsights';

import { getSonarwhalPackage } from './misc';
import { debug as d } from './debug';

const debug: debug.IDebugger = d(__filename);

const pkg = getSonarwhalPackage();

const config = new Configstore(pkg.name);

const insightsEnabled = config.get('insight');

let appInsightsClient: appInsights.TelemetryClient = {
    flush(options) {
        options.callback();
    },
    trackEvent() { },
    trackException() { }
} as any;

export const enableInsight = () => {
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
    debug('Enabling Application Insights');
    enableInsight();
} else {
    debug('Application Insight disabled');
}

/**
 * Return if Application insights is enabled or not.
 */
export const isEnabled = () => {
    return insightsEnabled;
};

/**
 * Enable Application Insight.
 */
export const enable = () => {
    config.set('insight', true);

    enableInsight();
};

/**
 * Disable Application Insights for the future.
 */
export const disable = () => {
    config.set('insight', false);
};

/**
 * Send pending data to Application Insights.
 */
export const sendPendingData = (isAppCrashing = true) => {
    return new Promise((resolve) => {
        appInsightsClient.flush({
            callback: () => {
                resolve();
            },
            isAppCrashing
        });
    });
};

/**
 * Track an exception in Application Insights.
 */
export const trackException = (error: Error) => {
    appInsightsClient.trackException({ exception: error });
};

/**
 * Track an event in Application Insights.
 */
export const trackEvent = (name, properties?: {}) => {
    appInsightsClient.trackEvent({ name, properties });
};

/**
 * Return the Application Insights client.
 */
export const getClient = () => {
    return appInsightsClient;
};
