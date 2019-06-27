import { ApplicationInsights } from '@microsoft/applicationinsights-web-basic';

import { Config, ErrorData, Results } from '../../shared/types';

import { determineHintStatus } from './hints';

const manifest = require('../../manifest.json');

const instrumentationKey = '8ef2b55b-2ce9-4c33-a09a-2c3ef605c97d';

let appInsights: ApplicationInsights;

const trackEvent = (name: string, properties: { [key: string]: string } = {}, measurements?: { [key: string]: number }) => {
    if (!appInsights) {
        return;
    }

    properties['extension-version'] = manifest.version;

    appInsights.track({
        baseData: {
            measurements,
            name,
            properties
        },
        baseType: 'EventData',
        name: `Microsoft.ApplicationInsights.${instrumentationKey}.Event`
    });
};

/** Called to initialize the underlying analytics library. */
export const setup = () => {
    appInsights = new ApplicationInsights({ instrumentationKey });
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
};

/** Called when analysis fails to complete in the allotted time. */
export const trackTimeout = (duration: number) => {
    trackEvent('f12-timeout', undefined, { 'f12-timeout-duration': duration });
};
