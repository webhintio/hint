import * as path from 'path';

import { Package } from '../@types/custom';
import { debug, execa, execWithRetry, packageTask } from '../lib/utils';

/**
 * Fully tests a package
 */
const testPackage = async (pkg: Package) => {
    // Package could be a configuration and nothing needs to be tested
    if (!pkg.content.scripts || !pkg.content.scripts.test) {
        return;
    }

    // npm run lint && npm run build && npm run test-only
    const yarnTest = 'yarn test';

    await execWithRetry(yarnTest, { cwd: path.dirname(pkg.path) });

    pkg.built = true;
    pkg.tested = true;
};

const buildPackages = async (pkgNames: string[], pkgs: Map<string, Package>) => {
    for (const pkgName of pkgNames) {
        const pkg = pkgs.get(pkgName)!;
        const command = 'yarn build';

        if (!pkg.built) {
            await execa(command, { cwd: path.dirname(pkg.path) });
            pkg.built = true;
        }
    }
};

/** Run tests for all the packages that have changed */
export const runTests = () => {
    let tested = 0;

    return packageTask(async (pkg, observer, ctx) => {
        const { packages } = ctx;

        tested++;

        if (!pkg.updated || pkg.ignore) {
            debug(`Skipping tests for "${pkg.name}"`);

            return;
        }

        const buildMessage = `Building dependencies for ${pkg.name}`;

        observer.next(buildMessage);
        debug(buildMessage);

        /**
         * Build all the depedencies manually because there are some packages that need
         * the assets so `tsc -b` is not reliable.
         */
        await buildPackages(pkg.references, packages);

        const testMessage = `Testing ${pkg.name} (${tested} / ${packages.size})`;

        debug(testMessage);
        observer.next(testMessage);

        await testPackage(pkg);
    });
};
