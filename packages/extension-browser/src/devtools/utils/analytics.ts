import { AppInsights } from 'applicationinsights-js';

import { ErrorData } from '../../shared/types';

/** Called to initialize the underlying analytics library. */
export const setup = () => {
    AppInsights.downloadAndSetup!({ instrumentationKey: '8ef2b55b-2ce9-4c33-a09a-2c3ef605c97d' });
};

/** Called when analysis was canceled by the user. */
export const trackCancel = (duration: number) => {
    AppInsights.trackEvent('f12-cancel', undefined, { 'f12-cancel-duration': duration });
};

/** Called when analysis fails due to an error. */
export const trackError = (error: ErrorData) => {
    AppInsights.trackEvent('f12-error', error);
};

/** Called when analysis finished. */
export const trackFinish = (duration: number) => {
    AppInsights.trackEvent('f12-finish', undefined, { 'f12-finish-duration': duration });
};

/** Called when the "Hints" tab was opened by the user. */
export const trackShow = () => {
    AppInsights.trackEvent('f12-show');
};

/** Called when analysis was started by the user. */
export const trackStart = () => {
    AppInsights.trackEvent('f12-start');
};
