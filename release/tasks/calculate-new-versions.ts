import { Context, Bump, Tag } from '../@types/custom';

import updateDependencies from '../lib/update-dependencies';
import calculatePackageNewVersion from '../lib/calculate-package-new-version';

/**
 *
 * @param tag The tag of the commit
 */
const getBumpTypeForTag = (tag: Tag): Bump => {

    switch (tag) {
        case 'Docs': return Bump.none;
        case 'Build': return Bump.none;
        case 'Update': return Bump.patch;
        case 'Upgrade': return Bump.patch;
        case 'Chore': return Bump.patch;
        case 'Fix': return Bump.patch;
        case 'New': return Bump.minor;
        case 'Breaking': return Bump.major;
        default: return Bump.none;
    }
};

/**
 * Bumps the version of each package:
 *
 * 1. Use the commit history of each package calculates the new version bump
 * 2. Update the inter dependencies of each package
 * 3. Update the versions of all the packages (`patch`) that do not have any commits but
 *    have changed versions in their dependencies
 */
export const calculateNewVersions = (ctx: Context) => {

    const { packages } = ctx;

    // Step 1: Use the commit history of each package calculates the new version bump
    packages.forEach((pkg) => {

        const bumpType = pkg.commits.reduce((currentBump, commit) => {
            const bump = getBumpTypeForTag(commit.tag);

            return Math.max(currentBump, bump);
        }, Bump.none);

        if (bumpType === Bump.none) {
            return;
        }

        pkg.updated = true;
        pkg.content.version = calculatePackageNewVersion(pkg, bumpType);
    });

    // Step 2: Update the inter dependencies of each package
    updateDependencies(ctx);

    /*
     * Step 3: Update the versions of all the packages (`patch`) that have not been bumped but
     * have changed versions in their dependencies
     */
    packages.forEach((pkg) => {
        if (pkg.oldVersion === pkg.content.version && pkg.updated) {
            pkg.content.version = calculatePackageNewVersion(pkg, Bump.patch);
        }
    });
};
