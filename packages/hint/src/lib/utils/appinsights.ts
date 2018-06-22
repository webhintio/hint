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
        debug('Application Insights is not enabled.')
        options.callback();
    },
    trackEvent() {
        debug('Application Insights is not enabled.')
    },
    trackException() {
        debug('Application Insights is not enabled.')
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
    debug('User is enabling Application Insights');
    config.set('insight', true);

    enableInsight();
};

/**
 * Disable Application Insights for the future.
 */
export const disable = () => {
    debug('User is disabling Application Insights');
    config.set('insight', false);
};

/**
 * Send pending data to Application Insights.
 */
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

/**
 * Track an exception in Application Insights.
 */
export const trackException = (error: Error) => {
    debug(`Sending exception to Application Insights: ${error.toString()}`);
    appInsightsClient.trackException({ exception: error });
};

/**
 * Track an event in Application Insights.
 */
export const trackEvent = (name, properties?: {}) => {
    debug(`Sending event "${name}" to Application Insights with value ${JSON.stringify(properties)}`);
    appInsightsClient.trackEvent({ name, properties });
};

/**
 * Return the Application Insights client.
 */
export const getClient = () => {
    debug('Getting Application Insights client');

    return appInsightsClient;
};
