import { getFriendlyName, UnsupportedBrowsers } from '@hint/utils-compat-data';

/**
 * Apply temporary filters to the list of target browsers to reduce
 * false-positives due to incorrect/outdated data. Each of these
 * should be removed once the affected data sources have been updated.
 */
export const filterBrowsers = (browsers: string[]): string[] => {
    return browsers.filter((browser) => {

        // Ignore Android WebView due to outdated data in both browserslist and MDN.
        if (browser.startsWith('android')) {
            return false;
        }

        // Ignore Samsung 4 due to outdated data in MDN.
        if (browser === 'samsung 4') {
            return false;
        }

        // Ignore Safari 5.1 due to `caniuse` reporting incorrect usage data.
        if (browser === 'safari 5.1') {
            return false;
        }

        return true;
    });
};

/**
 * Serialize a supported version range for the provided browser.
 * E.g. when passed `"ie 9", "11"`, returns `"Internet Explorer 11+"`.
 */
export const formatSupported = (browser: string, versionAdded?: string, versionRemoved?: string): string => {
    const browserName = getFriendlyName(browser);

    if (versionAdded && versionRemoved) {
        return `${browserName} ${versionAdded}-${versionRemoved}`;
    } else if (versionAdded && parseFloat(versionAdded) !== 1) {
        return `${browserName} ${versionAdded}+`;
    } else if (versionRemoved) {
        return `${browserName} < ${versionRemoved}`;
    }

    return browserName;
};

/**
 * Serialize an unsupported version range for the provided browser.
 * E.g. when passed `"ie 9", "11"`, returns `"Internet Explorer < 11"`.
 */
export const formatUnsupported = (browser: string, versionAdded?: string, versionRemoved?: string): string => {
    const browserName = getFriendlyName(browser);

    if (versionAdded && versionRemoved) {
        return `${browserName} ${versionRemoved}-${versionAdded}`;
    } else if (versionAdded) {
        return `${browserName} < ${versionAdded}`;
    } else if (versionRemoved) {
        return `${browserName} ${versionRemoved}+`;
    }

    return browserName;
};

/**
 * Serialize summarized support ranges for provided browsers.
 *
 * ```js
 * joinBrowsers({ browsers: ['edge 15'], browserDetails: new Map([['edge 15', { versionAdded: '18' }]]));
 * // returns 'Edge < 18';
 * ```
 */
export const joinBrowsers = (unsupported: UnsupportedBrowsers): string => {
    const summaries = unsupported.browsers.map((browser) => {
        const details = unsupported.details.get(browser);

        if (!details) {
            throw new Error(`No details provided for browser: ${name}`);
        }

        return formatUnsupported(browser, details.versionAdded, details.versionRemoved);
    });

    return [...new Set(summaries)].sort().join(', ');
};
