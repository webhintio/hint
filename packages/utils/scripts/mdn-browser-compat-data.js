const fs = require('fs');
const mdn = require('mdn-browser-compat-data');
const path = require('path');
const filename = path.resolve(`${__dirname}/../src/compat/browser-compat-data.ts`);

/**
 * Determine if a given support statement qualifies as "always supported" by
 * the specified browser.
 *
 * @param {string} browserName
 * @param {bcd.SimpleSupportStatement} supportStatement
 * @returns {boolean}
 */
const isUniversalSupportStatement = (browserName, supportStatement) => {
    const version = supportStatement.version_added;

    // Flagged or prefixed support isn't "full" support.
    if (supportStatement.flags || supportStatement.prefix) {
        return false;
    }

    if (supportStatement.version_removed) {
        return false;
    }

    if (typeof supportStatement.version_removed === 'string') {
        return false;
    }

    if (typeof version === 'boolean') {
        return version;
    }

    if (version === null) {
        return true; // Count unknown as universal support.
    }

    if (version === '1') {
        return true;
    }

    // Treat features in select minimum browser versions as universally supported.
    switch (browserName) {

        case 'chrome':
        case 'chrome_android':
        case 'opera':
        case 'opera_android':
            return parseInt(version) <= 49;

        case 'edge':
        case 'edge_mobile':
            return version === '12';

        case 'firefox':
        case 'firefox_android':
            return parseInt(version) <= 49;

        case 'ie':
            return parseInt(version) <= 9;

        case 'safari':
        case 'safari_ios':
            return parseInt(version) <= 9;

        case 'webview_android':
            return parseInt(version) <= 4;

        default:
            return false;
    }
};

/**
 * Extract an array of all support statements for the given browser.
 * Used to disambiguate between different data representations.
 *
 * @param {string} browserName
 * @param {bcd.SupportBlock} support
 * @returns {bcd.SimpleSupportStatement[]}
 */
const getSupportStatements = (browserName, support) => {
    const browserData = support[browserName] || [];

    return Array.isArray(browserData) ? browserData : [browserData];
};

/**
 * Determine if a feature is supported by all min-browsers.
 *
 * @param {bcd.CompatStatement} compat
 * @returns {boolean}
 */
const isFeatureUniversallySupported = (compat) => {
    for (const browserName of Object.keys(compat.support)) {
        for (const supportStatement of getSupportStatements(browserName, compat.support)) {
            if (!isUniversalSupportStatement(browserName, supportStatement)) {
                return false;
            }
        }
    }

    return true;
};

/**
 * Determine if a feature is *not* supported anywhere.
 *
 * @param {bcd.CompatStatement} compat
 */
const isFeatureUniversallyUnsupported = (compat) => {
    for (const browserName of Object.keys(compat.support)) {
        const supportStatements = getSupportStatements(browserName, compat.support);

        if (supportStatements.length > 1 || supportStatements[0].version_added) {
            return false;
        }
    }

    return true;
};

/**
 * Remove any `bcd.SimpleSupportStatement` that requires `flags`.
 * Flagged entries are ignored since they must be enabled by end users.
 * Unless the flagged entry is the only entry (in which case it's needed
 * to infer lack of support).
 *
 * @param {string} browserName
 * @param {bcd.SupportBlock} support
 */
const removeFlaggedSupport = (browserName, support) => {
    const supportStatements = getSupportStatements(browserName, support);
    const unflagged = supportStatements.filter((supportStatement) => {
        return !supportStatement.flags;
    });

    if (unflagged.length) {
        support[browserName] = unflagged.length === 1 ? unflagged[0] : unflagged;
    } else {
        support[browserName] = { version_added: false }; // eslint-disable-line camelcase
    }
};

/**
 * Remove all notes as they are not useful for analysis.
 *
 * @param {string} browserName
 * @param {bcd.SupportBlock} support
 */
const removeSupportNotes = (browserName, support) => {
    for (const supportStatement of getSupportStatements(browserName, support)) {
        delete supportStatement.notes;
    }
};

/**
 * Remove all support statements which indicate universal support.
 *
 * @param {string} browserName
 * @param {bcd.SupportBlock} support
 */
const removeUniversalSupport = (browserName, support) => {
    for (const supportStatement of getSupportStatements(browserName, support)) {
        if (isUniversalSupportStatement(browserName, supportStatement)) {
            delete support[browserName];

            return;
        }
    }
};

/**
 * Remove all data about a feature which is unnecessary for analysis.
 *
 * @param {bcd.Identifier} data
 */
const removeFeatureData = (data) => {
    if (!data.__compat) {
        return;
    }

    const compat = data.__compat;
    const support = data.__compat.support;

    // Remove unnecessary data cross-browser.
    if (isFeatureUniversallySupported(compat) || isFeatureUniversallyUnsupported(compat)) {
        delete data.__compat;

        return;
    }

    // Description is not needed for analysis.
    delete compat.description;

    // Remove unnecessary data per-browser.
    for (const browserName of Object.keys(support)) {
        removeFlaggedSupport(browserName, support);
        removeUniversalSupport(browserName, support);
        removeSupportNotes(browserName, support);
    }

    // Remove `__compat` if all browsers have been removed.
    if (!Object.keys(support).length) {
        delete data.__compat;
    }
};

/**
 * Remove all features and data which are unnecessary for analysis.
 * E.g. feature is universally supported or universally unsupported.
 *
 * @param {bcd.Identifier} data
 */
const removeFeatures = (data) => {
    for (const key of Object.keys(data)) {
        if (key === '__compat') {
            removeFeatureData(data);
        } else {
            removeFeatures(data[key]);

            if (!Object.keys(data[key]).length) {
                delete data[key];
            }
        }
    }
};

/**
 * Strip browser details down to name only.
 *
 * @param {bcd.Browsers} browsers
 */
const removeBrowserDetails = (browsers) => {
    for (const browserName of Object.keys(browsers)) {
        browsers[browserName] = /** @type {any} */({ name: browsers[browserName].name });
    }
};

// Remove unnecessary data

const data = {
    browsers: mdn.browsers,
    css: mdn.css,
    html: mdn.html
};

// TODO: drop `browsers` after `hint-compat-api` uses new util methods.
removeBrowserDetails(data.browsers);
removeFeatures(data.css);
removeFeatures(data.html);

const code = `/* eslint-disable */
import { Browsers, PrimaryIdentifier } from 'mdn-browser-compat-data/types';

type Data = {
    browsers: Browsers;
    css: PrimaryIdentifier;
    html: PrimaryIdentifier;
}

export const mdn: Data = ${JSON.stringify(data, null, 4)} as any;
`;

fs.writeFile(filename, code, (err) => {
    if (err) {
        throw err;
    } else {
        console.log(`Created: ${filename}`);
    }
});
