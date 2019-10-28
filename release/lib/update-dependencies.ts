/**
 * This script finds all the `package.json` files under `packages` related
 * to the hint project. Then it updates any reference to any of these
 * packages if needed.
 *
 */

import { Bump, Context, Package } from '../@types/custom';
import * as semver from 'semver';
import tsort = require('tsort');

import { debug } from '../lib/utils';

/** All the `package.json` properties that need to be updated. */
const propertiesToUpdate = [
    'dependencies',
    'devDependencies',
    'optionalDependencies',
    'peerDependencies'
];

const nonPeerDependencyProperties = [
    'dependencies',
    'devDependencies',
    'optionalDependencies'
];

export const calculatePackageNewVersion = (pkg: Package, bump: Bump): string => {

    if (pkg.ignore) {
        return pkg.content.version;
    }

    if (!pkg.publishedVersion) {
        debug(`${pkg.name} will be published with initial version ${pkg.content.version}`);

        return pkg.content.version;
    }

    const newVersion = semver.inc(pkg.oldVersion, Bump[bump] as semver.ReleaseType)!;

    debug(`Bumping ${pkg.name} from ${pkg.oldVersion} to ${newVersion}`);

    return newVersion;
};

/**
 * Perform a topological sort of the packages in the provided context
 * treating the relationship between a package and each dependency as
 * edges in a directed acyclic graph (DAG).
 */
const getPackagesSortedByDependencies = (ctx: Context): Package[] => {
    const graph = tsort();

    for (const [, pkg] of ctx.packages) {
        /*
         * Include all dependencies except `optionalDependencies` which is
         * used by `hint` to reference configurations, creating a cycle.
         */
        for (const property of nonPeerDependencyProperties) {
            if (!pkg.content[property]) {
                continue;
            }

            for (const dependency of Object.keys(pkg.content[property])) {
                if (!ctx.packages.has(dependency)) {
                    continue; // Only first-party packages need to be sorted.
                }

                graph.add(pkg.name, dependency);
            }
        }
    }

    const sortedPackageNames = graph.sort();

    return sortedPackageNames.map((name) => {
        return ctx.packages.get(name)!; // Names are only added above if in the packages collection.
    });
};

/**
 * Returns a function that will accept the content of a `package.json`
 * and will update the initially given `property` to use the workspace
 * version of each local package.
 * `property` should be one of `propertiesToUpdate`
 *
 */
const updateProperty = (property: string) => {
    return (pkg: Package, packages: Map<string, Package>): void => {
        if (!pkg.content[property]) {
            return;
        }

        const dependencies = Object.keys(pkg.content[property]);

        dependencies.forEach((dependencyName) => {
            const dependency = packages.get(dependencyName);
            const pkgVersion = pkg.content[property][dependencyName];

            if (!dependency) {
                return;
            }

            /**
             * Reference peer dependencies via base major version so we
             * only update in response to breaking changes.
             */
            const dependencyVersion = property === 'peerDependencies' ?
                `^${semver.major(dependency.content.version)}.0.0` :
                `^${dependency.content.version}`;

            /**
             * `version` is "pinned" in the `package.json` so we need to add `^` to do the match.
             *
             * This means we could "downgrade" a `dependency` in a `package.json` if the workspace
             * version is smaller. If this happens this means that something has gone terribly
             * wrong before or the user should make sure to rebase with the latest `master`.
             */
            if (pkgVersion === dependencyVersion) {
                return;
            }

            pkg.content[property][dependencyName] = dependencyVersion;
            pkg.updated = true;

            /*
             * Update the version of this package (`patch`) if it has not been bumped yet
             * (because it has changed versions in its dependencies).
             */
            if (pkg.oldVersion === pkg.content.version) {
                pkg.content.version = calculatePackageNewVersion(pkg, Bump.patch);
            }
        });

        return;
    };
};

export const updateDependencies = (ctx: Context): void => {
    const propertiesUpdater = propertiesToUpdate.map(updateProperty);
    const update = (pkg: Package) => {
        propertiesUpdater.forEach((propertyUpdater) => {
            propertyUpdater(pkg, ctx.packages);
        });
    };

    /*
     * Process packages in reverse dependency order to ensure
     * dependency versions are current when updating nested references.
     */
    const packages = getPackagesSortedByDependencies(ctx).reverse();

    for (const pkg of packages) {
        update(pkg);
    }
};
