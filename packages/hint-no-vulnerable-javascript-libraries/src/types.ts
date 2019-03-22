/** A snyk.io library entry. */

export type Library = {
    name: string;
    version: string;
    npmPkgName: string;
};

/**
 * A snyk.io vulnerability report (just the pieces used by webhint).
 *
 * Note: to include additional properties in this list, add them here
 * and update `filterSnykData` in `pack-snyk.js` to copy them to the
 * final, packed version of the data.
 */
export type Vulnerability = {
    packageManager: string;
    severity: string;
    semver: {
        vulnerable: string[];
    };
    packageName: string;
};
