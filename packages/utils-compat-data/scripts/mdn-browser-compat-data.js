const fs = require('fs');
const mdn = require('@mdn/browser-compat-data');
const path = require('path');
const extraData = require('./extra-data');
const filename = path.resolve(`${__dirname}/../src/browser-compat-data.ts`);

/**
 * @typedef {import('@mdn/browser-compat-data/types').Browsers} Browsers
 * @typedef {import('@mdn/browser-compat-data/types').CompatStatement} CompatStatement
 * @typedef {import('@mdn/browser-compat-data/types').Identifier} Identifier
 * @typedef {import('@mdn/browser-compat-data/types').SimpleSupportStatement} SimpleSupportStatement
 * @typedef {import('@mdn/browser-compat-data/types').SupportBlock} SupportBlock
 */

/**
 * @param {any} target
 * @param {any} source
 */
const merge = (target, source, path = '') => {
    for (const [key, value] of Object.entries(source)) {
        if (target[key] && value && typeof value === 'object' && !Array.isArray(value)) {
            merge(target[key], value, `${path}${key}.`);
        } else if (!target[key] && !path.includes('__compat')) {
            // values outside of a '__compat' block are expected to align with actual MDN data.
            throw new Error(`No match for ${key} in MDN data at ${path}`);
        } else {
            target[key] = value;
        }
    }
};

/**
 * Determine if a given support statement qualifies as "always supported" by
 * the specified browser.
 *
 * @param {string} browserName
 * @param {SimpleSupportStatement} supportStatement
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

    if (version === '1' || version === '1.0') {
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
 * @param {SupportBlock} support
 * @returns {SimpleSupportStatement[]}
 */
const getSupportStatements = (browserName, support) => {
    const browserData = support[browserName] || [];

    return Array.isArray(browserData) ? browserData : [browserData];
};

/**
 * Determine if a feature is supported by all min-browsers.
 *
 * @param {CompatStatement} compat
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
 * @param {CompatStatement} compat
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
 * @param {SupportBlock} support
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
 * @param {SupportBlock} support
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
 * @param {SupportBlock} support
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
 * @param {Identifier} data
 */
const removeFeatureData = (data) => {
    if (!data.__compat) {
        return;
    }

    const compat = data.__compat;
    const support = data.__compat.support;

    // Description is not needed for analysis.
    delete compat.description;
    // Status is not needed for analysis.
    delete data.__compat.status;

    // Remove unnecessary data per-browser.
    for (const browserName of Object.keys(support)) {
        removeFlaggedSupport(browserName, support);
        removeUniversalSupport(browserName, support);
        removeSupportNotes(browserName, support);
    }

    // Remove unnecessary data cross-browser.
    if (isFeatureUniversallySupported(compat) || isFeatureUniversallyUnsupported(compat)) {
        // __compat is the only property left.
        if (Object.keys(data).length === 1) {
            delete data.__compat;
        } else {
            delete /** @type {any} */(data.__compat).support;
        }
    }
};

/**
 * Remove all features and data which are unnecessary for analysis.
 * E.g. feature is universally supported or universally unsupported.
 *
 * @param {Identifier} data
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
 * @param {Browsers} browsers
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

// Copy extra data
merge(data, extraData);

// TODO: drop `browsers` after `hint-compat-api` uses new util methods.
removeBrowserDetails(data.browsers);
removeFeatures(data.css);
removeFeatures(data.html);

const code = `/* eslint-disable */
import { Browsers, PrimaryIdentifier } from '@mdn/browser-compat-data/types';

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
