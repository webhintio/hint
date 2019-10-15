import * as path from 'path';

import { Package } from '../@types/custom';
import { debug, execWithRetry, packageTask } from '../lib/utils';
import { Subscriber } from 'rxjs';

const getScript = (scripts: string[], pkg: Package) => {
    const script = scripts.reduce((cmd, script) => {
        if (cmd) {
            return cmd;
        }
        if (pkg.content.scripts && pkg.content.scripts.hasOwnProperty(script)) {
            return script;
        }

        return cmd;
    }, '');

    return script;
};

const buildAndTestPackages = async (pkgNames: string[], pkgs: Map<string, Package>, skipTests: boolean, observer: Subscriber<{}>) => {
    for (const pkgName of pkgNames) {
        const pkg = pkgs.get(pkgName)!;

        if (pkg.references.length > 0) {
            await buildAndTestPackages(pkg.references, pkgs, skipTests, observer);
        }

        /**
         * Packages are tested at the same time they are built. Even if
         * `skipTests` is `true`, `pkg.tested` is marked as `true` when
         * the package has been processed (build or test) so it's safe
         * to check this and return accordingly.
         */
        if (pkg.tested) {
            debug(`Package "${pkg.name} already build/tested"`);

            continue;
        }

        /**
         * `-release` scripts have higher priority than regular ones as those should
         * generate different output that should be ready for publishing later in the
         * process.
         */
        const buildScript = getScript(['build-release', 'build'], pkg);
        const testScript = getScript(['test-release', 'test'], pkg);

        const command = skipTests || !pkg.updated ?
            `yarn ${buildScript}` :
            `yarn ${testScript}`;

        if (!buildScript) {
            // Nothing to build or test
            pkg.tested = true;

            debug(`Package "${pkg.name}" does not have a build and test script`);

            continue;
        }

        const testMessage = `Running "${command}" for "${pkg.name}"`;

        debug(testMessage);
        observer.next(testMessage);

        await execWithRetry(command, { cwd: path.dirname(pkg.path) });

        pkg.tested = true;
    }
};

/** Run tests for all the packages that have changed */
export const runTests = () => {

    return packageTask(async (pkg, observer, ctx) => {
        const { packages } = ctx;
        const { skipTests } = ctx.argv;

        if (!pkg.updated || pkg.ignore) {
            debug(`Skipping build and tests for "${pkg.name}"`);

            return;
        }

        /**
         * Build all the depedencies manually because there are some packages that need
         * the assets so `tsc -b` is not reliable.
         */
        await buildAndTestPackages([...pkg.references, pkg.name], packages, skipTests, observer);
    });
};
