/**
 * This script finds all the `package.json` files under `packages` related
 * to the hint project. Then it updates any reference to any of these
 * packages if needed.
 *
 * This should be run before and after a release to make sure everything is
 * OK.
 */

const fs = require('fs');
const path = require('path');
const globby = require('globby');

/** All the `package.json` properties that need to be updated. */
const propertiesToUpdate = [
    'dependencies',
    'devDependencies',
    'optionalDependencies',
    'peerDependencies'
];

/**
 * Finds and loads all the `package.json` files returning 2 maps:
 *
 * * `packages`: The content of each `package.json` indexed by `name`.
 * * `paths`: The routes to each `package.json`. We can predict the
 *   path because some packages don't follow the convention (e.g.:
 *   `extension-browser`).
 *
 */
const initialize = () => {
    const packagesFiles = globby.sync([
        '**/*/package.json',
        '!**/*/fixtures'
    ], { gitignore: true });

    const _paths = new Map();
    const _packages = new Map();

    packagesFiles.forEach((pkgFile) => {
        const destination = path.join(process.cwd(), pkgFile);
        const pkg = require(destination);

        _paths.set(pkg.name, destination);
        _packages.set(pkg.name, pkg);
    });

    return {
        packages: _packages,
        paths: _paths
    };
};

const { packages, paths } = initialize();

/**
 * Returns a function that will accept the content of a `package.json`
 * and will update the initially given `property` to use the workspace
 * version of each local package.
 * `property` should be one of `propertiesToUpdate`
 *
 */
const updateProperty = (property) => {
    return (pkg) => {
        if (!pkg[property]) {
            return;
        }

        const dependencies = Object.keys(pkg[property]);
        let updated = false;

        dependencies.forEach((dependencyName) => {
            const dependency = packages.get(dependencyName);
            const pkgVersion = pkg[property][dependencyName];

            if (!dependency) {
                return;
            }

            const dependencyVersion = `^${dependency.version}`;

            /**
             * `version` is "pinned" in the `package.json` so we need to add `^` to do the match.
             *
             * This means we could "downgrade" a `dependency` in a `package.json` if the workspace
             * version is smaller. If this happens this means that something has gone terribly
             * wrong before or the user should make sure to rebase with the latest `master`.
             */
            if (pkgVersion !== dependencyVersion) {
                console.log(`updating ${dependencyName} from "${pkgVersion}" to "${dependencyVersion}" in ${pkg.name}.${property}`);
                pkg[property][dependencyName] = dependencyVersion;
                updated = true;
            }
        });

        if (!updated) {
            return;
        }

        try {
            fs.writeFileSync(paths.get(pkg.name), `${JSON.stringify(pkg, null, 2)}\n`, 'utf-8'); // eslint-disable-line
        } catch (e) {
            console.error(e);
        }
    };
};

const propertiesUpdater = propertiesToUpdate.map(updateProperty);
const updateDependencies = (pkg) => {
    propertiesUpdater.forEach((propertyUpdater) => {
        propertyUpdater(pkg);
    });
};

packages.forEach(updateDependencies);
