import * as path from 'path';

import * as Configstore from 'configstore';
import * as appInsights from 'applicationinsights';

import { findPackageRoot } from './misc';
import { debug as d } from './debug';

const debug: debug.IDebugger = d(__filename);

const p = path.join(findPackageRoot(), 'package.json');
const pkg = require(p);

const config = new Configstore(pkg.name);

const insightsEnabled = config.get('insight');

let appInsightsClient: appInsights.TelemetryClient = {
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
    enableInsight();
}

export const isEnabled = () => {
    return insightsEnabled;
};

export const enable = () => {
    config.set('insight', true);

    enableInsight();
};

export const disable = () => {
    config.set('insight', false);
};

export const trackException = (error: Error) => {
    appInsightsClient.trackException({ exception: error });
};

export const trackEvent = (name, properties?: {}) => {
    appInsightsClient.trackEvent({ name, properties });
};

export const getClient = () => {
    return appInsightsClient;
};
