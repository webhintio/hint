const spawn = require('child_process').spawn;
const globby = require('globby');
const chalk = require('chalk');

/** Execute the `cmd` in a new process. */
const exec = (cmd) => {
    return new Promise((resolve, reject) => {
        console.log(chalk.green(`  ${cmd}`));
        const command = spawn(cmd, [], {
            shell: true,
            stdio: 'inherit'
        });

        command.on('error', (err) => {
            return reject(err);
        });

        command.on('exit', (code) => {
            if (code !== 0) {
                return reject(new Error('NoExitCodeZero'));
            }

            return resolve(true);
        });

    });
};

/**
 * Searches all the `package.json` under `packages` and returns
 * an array with the path and the content of each one.
 * @returns { {packagePath: string, content: string}[] } The packages information
 */
const getPackages = async () => {
    const packagesPaths = await globby([
        `packages/*/package.json`,
        `!packages/**/dist/**/*`,
        `!packages/**/node_modules/**/*` // needed when we are inside a package like extension-vscode
    ], { absolute: true });

    const packages = packagesPaths.map((packagePath) => {
        try {
            const content = require(packagePath);

            return {
                content,
                packagePath
            };
        } catch (e) {
            // This happens if we are creating a new package and switching branches. We can ignore
            return {
                content: '',
                packagePath
            };
        }
    });

    return packages;
};

/**
 * Executes `npm run prebuild` for the given package if present
 * @param { { packagePath: string, content: string } } pkg The package to test
 * @returns { Promise<boolean> } True if `npm run prebuild` executed correctly
 * or if the package does not have that script.
 */
const prebuildPackage = async (pkg) => {
    if (pkg.content &&
        pkg.content.scripts &&
        pkg.content.scripts.prebuild
    ) {
        console.log(chalk.green(`\tPrebuilding...`));
        const cwd = pkg.packagePath.replace('package.json', '');

        return await exec(`cd ${cwd} && npm run prebuild`);
    }

    return true;
};

const prebuildPackages = async () => {
    const packages = await getPackages();
    let ok = true;

    for (const pkg of packages) {
        console.log(chalk.green.bold(`Processing "${pkg.packagePath}"`));
        ok = await prebuildPackage(pkg);

        if (!ok) {
            console.log(chalk.red.bold(`Error prebuilding package "${pkg.packagePath}"`));
        }
    }
};

prebuildPackages();
