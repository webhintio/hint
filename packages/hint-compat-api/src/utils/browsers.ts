import { UnsupportedBrowsers } from '@hint/utils/dist/src/compat';
import { getFriendlyName } from '@hint/utils/dist/src/compat/browsers';

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
 * Serialize summarized support ranges for provided browsers.
 *
 * ```js
 * joinBrowsers({ browsers: ['edge 15'], browserDetails: new Map([['edge 15', { versionAdded: '18' }]]));
 * // returns 'Edge < 18';
 * ```
 */
export const joinBrowsers = (unsupported: UnsupportedBrowsers): string => {
    const summaries = unsupported.browsers.map((browser) => {
        const name = getFriendlyName(browser);
        const details = unsupported.details.get(browser);

        if (!details) {
            throw new Error(`No details provided for browser: ${name}`);
        }

        if (details.versionAdded && details.versionRemoved) {
            return `${name} ${details.versionRemoved}-${details.versionAdded}`;
        } else if (details.versionAdded) {
            return `${name} < ${details.versionAdded}`;
        } else if (details.versionRemoved) {
            return `${name} ${details.versionRemoved}+`;
        }

        return name;
    });

    return [...new Set(summaries)].sort().join(', ');
};
