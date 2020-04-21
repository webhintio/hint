const fs = require('fs');
const path = require('path');
const snykSnapshotPath = require.resolve('../src/snyk-snapshot.json');
const snyk = require(snykSnapshotPath);

/**
 * @typedef { import('../src/types').Vulnerability } Vulnerability
 */

/**
 * Get a list of names for packages which can be detected by `js-library-detector`.
 *
 * @param { string } libraryDetectorSource
 * @returns { string[] }
 */
const getDetectablePackages = (libraryDetectorSource) => {
    /** @type { RegExpMatchArray | null } */
    let match = null;

    /** @type { string[] } */
    const packageNames = [];
    const rxPackageName = /\bnpm: '([^']+)'/g;

    // eslint-disable-next-line no-cond-assign
    while (match = rxPackageName.exec(libraryDetectorSource)) {
        const [, packageName] = match;

        packageNames.push(packageName);
    }

    if (!packageNames.length) {
        throw new Error('Unable to determine packages detected by `js-library-detector.');
    }

    return packageNames;
};

/**
 * Trim snyk data to detectable packages with info used by `hint-no-vulnerable-libraries`.
 *
 * @param { string[] } includedPackages
 * @param { { [packageName: string]: Vulnerability[] } } npm
 */
const filterSnykData = (includedPackages, npm) => {
    Object.keys(npm).forEach((key) => {
        npm[key] = npm[key].filter((vuln) => {
            return includedPackages.includes(vuln.packageName);
        }).map((vuln) => {
            return {
                packageManager: vuln.packageManager,
                packageName: vuln.packageName,
                semver: vuln.semver,
                severity: vuln.severity
            };
        });
    });
};

fs.readFile(require.resolve('js-library-detector'), 'utf8', (err, data) => {
    if (err) {
        throw err;
    }

    filterSnykData(getDetectablePackages(data), snyk.npm);

    const filename = path.resolve(snykSnapshotPath);

    fs.writeFile(filename, JSON.stringify(snyk), (err) => {
        if (err) {
            throw err;
        }

        console.log(`Created: ${filename} (packed)`);
    });
});
