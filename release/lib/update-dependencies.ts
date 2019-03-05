/**
 * This script finds all the `package.json` files under `packages` related
 * to the hint project. Then it updates any reference to any of these
 * packages if needed.
 *
 */

import { Context, Package } from '../@types/custom';

/** All the `package.json` properties that need to be updated. */
const propertiesToUpdate = [
    'dependencies',
    'devDependencies',
    'optionalDependencies',
    'peerDependencies'
];

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

            const dependencyVersion = `^${dependency.content.version}`;

            /**
             * `version` is "pinned" in the `package.json` so we need to add `^` to do the match.
             *
             * This means we could "downgrade" a `dependency` in a `package.json` if the workspace
             * version is smaller. If this happens this means that something has gone terribly
             * wrong before or the user should make sure to rebase with the latest `master`.
             */
            if (pkgVersion !== dependencyVersion) {
                pkg.content[property][dependencyName] = dependencyVersion;
                pkg.updated = true;
            }
        });

        return;
    };
};

const updateDependencies = (ctx: Context): void => {

    const propertiesUpdater = propertiesToUpdate.map(updateProperty);
    const update = (pkg: Package) => {
        propertiesUpdater.forEach((propertyUpdater) => {
            propertyUpdater(pkg, ctx.packages);
        });
    };

    const { packages } = ctx;

    for (const [, pkg] of packages) {
        update(pkg);
    }
};

export default updateDependencies;
