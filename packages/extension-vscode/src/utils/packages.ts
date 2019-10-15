import { hasFile } from './fs';
import { run } from './process';

export type LoadOptions = {
    paths?: string[];
};

export type InstallOptions = {
    cwd?: string;
};

// Use `eval('require')` to keep this dynamic even after bundling with webpack.
const _require = eval('require'); // eslint-disable-line no-eval

/**
 * Initialize a package.json file in the specified directory.
 */
export const createPackageJson = async (cwd: string) => {
    const cmd = process.platform === 'win32' ? '.cmd' : '';

    await run(`npm${cmd} init -y`, { cwd });
};

/**
 * Install the provided packages to the specified location.
 * Uses `yarn` if `yarn.lock` exists, `npm` otherwise.
 */
export const installPackages = async (packages: string[], options?: InstallOptions) => {
    const isUsingYarn = await hasFile('yarn.lock', options && options.cwd);
    const cmd = process.platform === 'win32' ? '.cmd' : '';
    const npm = `npm${cmd} install ${packages.join(' ')} --save-dev --verbose`;
    const yarn = `yarn${cmd} add ${packages.join(' ')} --dev`;
    const command = isUsingYarn ? yarn : npm;

    await run(command, options);
};

/**
 * Load the provided packages from the specified location.
 * Always performs a dynamic load, even if bundled with webpack, to ensure
 * locally installed versions of packages such as `hint` are used instead of
 * being bundle with the extension itself. This avoids needing to update the
 * extension every time webhint updates.
 */
/* istanbul ignore next */
export const loadPackage = <T>(name: string, options?: LoadOptions): T => {
    const path = _require.resolve(name, { paths: options && options.paths });

    console.log(`Found ${name} at ${path}`);

    return _require(path);
};
