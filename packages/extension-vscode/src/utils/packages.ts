import { hasFile } from './fs';
import { run } from './process';

export type LoadOptions = {
    paths?: string[];
};

export type InstallOptions = {
    cwd?: string;
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
 */
/* istanbul ignore next */
export const loadPackage = <T>(name: string, options?: LoadOptions): T => {
    const path = require.resolve(name, { paths: options && options.paths });

    console.log(`Found ${name} at ${path}`);

    return require(path);
};
