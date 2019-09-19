import { Identifier, SimpleSupportStatement, SupportStatement } from 'mdn-browser-compat-data/types';
import * as semver from 'semver';

import { mdn } from './browser-compat-data';

export type AlternativeDetails = {
    name: string;
    versionAdded?: string;
    versionRemoved?: string;
};

export type SupportDetails = {
    alternative?: AlternativeDetails;
    versionAdded?: string;
    versionRemoved?: string;
};

export type UnsupportedBrowsers = {
    browsers: string[];
    details: Map<string, SupportDetails>;
};

const enum Support {
    No,
    Yes,
    Unknown
}

type SupportStatus = SupportDetails & {
    support: Support;
};

// Map `browserslist` browser names to MDN ones.
const browserToMDN = new Map([
    ['and_chr', 'chrome_android'],
    ['and_ff', 'firefox_android'],
    ['and_qq', 'qq_android'],
    ['and_uc', 'uc_android'],
    ['android', 'webview_android'],
    ['chrome', 'chrome'],
    ['edge', 'edge'],
    ['edge_mob', 'edge_mobile'],
    ['firefox', 'firefox'],
    ['ie', 'ie'],
    ['ios_saf', 'safari_ios'],
    ['node', 'nodejs'],
    ['opera', 'opera'],
    ['safari', 'safari'],
    ['samsung', 'samsunginternet_android']
]);

const coerce = (version: string): string | semver.SemVer => {
    return semver.coerce(version) || version;
};

const normalizeBrowserName = (name: string) => {
    return browserToMDN.get(name) || name;
};

/**
 * Intepret if the provided statement indicates support for the given browser version.
 */
const isSupported = (support: SimpleSupportStatement, prefix: string, rawVersion: string, unprefixed: string): SupportStatus => {
    const version = coerce(rawVersion);

    // Ignore support that requires users to enable a flag.
    if (support.flags) {
        return { support: Support.Unknown };
    }

    // If feature doesn't match the same prefix, then it's not supported.
    if (prefix !== (support.prefix || '')) {
        return { support: Support.No };
    }

    // If feature doesn't match the alternative name, then it's not supported.
    if (support.alternative_name && `${prefix}${unprefixed}` !== support.alternative_name) {
        return { support: Support.No };
    }

    // If feature was never added, then it's not supported.
    if (support.version_added === false) {
        return { support: Support.No };
    }

    // If a feature was removed before the target version, it's not supported.
    if (typeof support.version_removed === 'string' && semver.lte(coerce(support.version_removed), version)) {
        return { support: Support.No, versionRemoved: support.version_removed };
    }

    /*
     * If feature was added but we don't know when, assume support.
     *
     * Note: This is likely to change to describe the version of the browser
     * which was tested for support (e.g. `version_added = "<=60"`).
     *
     * https://github.com/mdn/browser-compat-data/issues/3021
     */
    if (support.version_added === true) {
        return { support: Support.Yes };
    }

    // If feature was added by the target version, it's supported; if after it's not.
    if (typeof support.version_added === 'string') {
        if (semver.lte(coerce(support.version_added), version)) {
            return { support: Support.Yes };
        }

        return { support: Support.No, versionAdded: support.version_added };
    }

    // Ignore all other cases (e.g. if a feature was removed but we don't know when).
    return { support: Support.Unknown };
};

/**
 * Check if another version of the same property is supported (e.g. with a different prefix).
 */
const getAlternativeDetails = (simpleSupport: SimpleSupportStatement, prefix: string, version: string, unprefixed: string): AlternativeDetails | undefined => {
    const simpleSupportPrefix = simpleSupport.prefix || '';

    if (!simpleSupport.alternative_name && prefix === simpleSupportPrefix) {
        return undefined;
    }

    const status = isSupported(simpleSupport, simpleSupportPrefix, version, simpleSupport.alternative_name || unprefixed);

    if (status.support !== Support.Yes) {
        return undefined;
    }

    const name = simpleSupport.alternative_name || `${simpleSupportPrefix}${unprefixed}`;
    const details: AlternativeDetails = { name };

    if (typeof simpleSupport.version_added === 'string') {
        details.versionAdded = simpleSupport.version_added;
    }

    if (typeof simpleSupport.version_removed === 'string') {
        details.versionRemoved = simpleSupport.version_removed;
    }

    return details;
};

/**
 * Interpret if the provided support statements indicate the given browser version is supported.
 */
const isBrowserSupported = (statement: SupportStatement, prefix: string, version: string, unprefixed: string): SupportStatus => {
    // Convert single entries to an array for consistent handling.
    const browserSupport = Array.isArray(statement) ? statement : [statement];
    let alternative: AlternativeDetails | undefined;
    let support = Support.Unknown;
    let versionAdded: string | undefined;
    let versionRemoved: string | undefined;

    // Items are listed from newest to oldest. The first clear rule wins.
    for (const simpleSupport of browserSupport) {
        const status = isSupported(simpleSupport, prefix, version, unprefixed);

        switch (status.support) {
            case Support.Yes:
                return { support: Support.Yes };
            case Support.No:
                support = Support.No;
                versionAdded = status.versionAdded || versionAdded;
                versionRemoved = status.versionRemoved || versionRemoved;
                alternative = alternative || getAlternativeDetails(simpleSupport, prefix, version, unprefixed);
                break; // Keep looking in case a feature was temporarily removed or is prefixed.
            case Support.Unknown:
            default:
                break;
        }
    }

    if (support === Support.Unknown) {
        support = Support.Yes;
    }

    return {
        alternative,
        support,
        versionAdded,
        versionRemoved
    };
};

/**
 * Retrieve the friendly name of the provided browser.
 * This excludes any version contained in passed browser
 * (e.g. "Internet Explorer" for "ie" or "ie 9").
 */
export const getFriendlyName = (browser: string): string => {
    const [name] = browser.split(' ');
    const data = mdn.browsers[normalizeBrowserName(name)];

    return data.name;
};

/**
 * Return provided browsers which don't support the specified feature.
 * Browsers are an array of strings as generated by `browserslist`:
 * https://github.com/browserslist/browserslist
 *
 * @param feature An MDN feature `Identifier` with `__compat` data.
 * @param browsers A list of target browsers (e.g. `['chrome 74', 'ie 11']`).
 */
export const getUnsupportedBrowsers = (feature: Identifier | undefined, prefix: string, browsers: string[], unprefixed: string): UnsupportedBrowsers | null => {
    if (!feature || !feature.__compat) {
        return null; // Assume support if no matching feature was provided.
    }

    const support = feature.__compat.support;
    const unsupported: string[] = [];
    const details = new Map<string, SupportDetails>();

    for (const browser of browsers) {
        const [name, versionStr] = browser.split(' ');
        const mdnBrowser = normalizeBrowserName(name);
        const browserSupport = support[mdnBrowser];
        const versions = versionStr.split('-'); // Handle 'android 4.4.3-4.4.4'.

        if (!browserSupport) {
            continue;
        }

        for (const version of versions) {
            const status = isBrowserSupported(browserSupport, prefix, version, unprefixed);

            if (status.support === Support.No) {
                const supportDetails: SupportDetails = {};

                if (status.alternative) {
                    supportDetails.alternative = status.alternative;
                }

                if (status.versionAdded) {
                    supportDetails.versionAdded = status.versionAdded;
                }

                if (status.versionRemoved) {
                    supportDetails.versionRemoved = status.versionRemoved;
                }

                details.set(browser, supportDetails);
                unsupported.push(browser);
                break;
            }
        }
    }

    return unsupported.length ? { browsers: unsupported, details } : null;
};
