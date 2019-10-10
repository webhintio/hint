import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

import * as npmRegistryFetch from 'npm-registry-fetch';

import { NpmPackage, NpmSearchResults } from './types/npm';
import { debug as d } from './debug';
import * as logger from './logging';
import { cwd, loadJSONFile } from './fs';
import { findPackageRoot } from './packages';
import { hasYarnLock } from './has-yarnlock';

const debug: debug.IDebugger = d(__filename);

const install = (command: string) => {
    return new Promise((resolve, reject) => {
        const npmInstall = spawn(command, [], { shell: true, stdio: 'inherit' });

        npmInstall.on('error', (err) => {
            return reject(err);
        });

        npmInstall.on('exit', (code) => {
            if (code !== 0) {
                return reject();
            }

            return resolve(true);
        });
    });
};

/** Install the given packages. */
export const installPackages = async (packages: string[]): Promise<boolean> => {
    /** Whether or not the package should be installed as devDependencies. */
    let isDev = false;
    /** Current working directory. */
    const currentWorkingDir = cwd();
    /** Whether or not the process is running in windows */
    const isWindows = process.platform === 'win32';

    if (packages.length === 0) {
        return Promise.resolve(true);
    }

    const hintLocalPath = path.join(currentWorkingDir, 'node_modules', 'hint', 'package.json');

    // Check if hint is installed locally.
    const global: boolean = !fs.existsSync(hintLocalPath); // eslint-disable-line no-sync

    /** package manager to install the packages. */
    const packageManagerChoice = (!global && await hasYarnLock(currentWorkingDir)) ? 'yarn' : 'npm';

    if (!global) {
        try {
            const packagePath = findPackageRoot(currentWorkingDir);
            const jsonContent = loadJSONFile(path.join(packagePath, 'package.json'));

            // If `hint` is a devDependency, then set all packages as devDependencies.
            isDev = jsonContent.devDependencies && jsonContent.devDependencies.hasOwnProperty('hint');
        } catch (err) {
            // Even if `hint` is installed locally, package.json could not exist in the current working directory.
            isDev = false;
        }

    }

    const installCommand = {
        npm: `npm install${global ? ' --global' : ''}${isDev ? ' --save-dev' : ''}`,
        yarn: `yarn add${isDev ? ' --dev' : ''}`
    };

    const command = `${installCommand[packageManagerChoice]} ${packages.join(' ')}`;

    try {
        debug(`Running command ${command}`);
        logger.log('Installing packages...');

        await install(command);

        return true;
    } catch (err) {
        debug(err);
        /*
         * There was an error installing packages.
         * Show message to install packages manually (maybe permissions error?).
         */
        /* istanbul ignore next */
        logger.error(`
There was a problem installing packages.
Please try executing:
    ${!isWindows && global ? 'sudo ' : ''}${command}
            manually to install all the packages.`);

        return false;
    }
};

/** Filters the packages that `startsWith` `initTerm`. */
const filterPackages = (packages: NpmPackage[], initTerm: string) => {
    return packages.filter((pkg) => {
        return pkg.name.startsWith(initTerm);
    });
};

/** Get npm packages from the object returned for npmRegistryFetch.json. */
const getPackages = (result: NpmSearchResults): NpmPackage[] => {
    return result.objects.map((obj) => {
        return obj.package;
    });
};

/** Generate a search query to search packages. */
const generateSearchQuery = (searchTerm: string, from?: number, size = 100) => {
    return `/-/v1/search?text=${searchTerm}&size=${size}${from ? `&from=${from}` : ''}`;
};

/**
 * Searches all the packages in npm given `searchTerm`.
 */
export const search = async (searchTerm: string): Promise<NpmPackage[]> => {
    const result = (await npmRegistryFetch.json(generateSearchQuery(searchTerm))) as NpmSearchResults;

    let total = getPackages(result);

    while (result.total > total.length) {
        const r = (await npmRegistryFetch.json(generateSearchQuery(searchTerm, total.length))) as NpmSearchResults;

        total = total.concat(getPackages(r));
    }

    return total;
};

/** Get core packages from npm. */
export const getOfficialPackages = async (type: string): Promise<NpmPackage[]> => {
    const hints = await search(`@hint/${type}`);

    /*
     * We need to filter the results because the search can
     * include other packages that doesn't start with `@hint/{type}`.
     */
    return filterPackages(hints, `@hint/${type}`);
};

/** Get external packages from npm. */
export const getUnnoficialPackages = async (type: string): Promise<NpmPackage[]> => {
    const hints = await search(`hint-${type}`);

    /*
     * We need to filter the results because the search can
     * include other packages that doesn't start with `hint-{type}`.
     */
    return filterPackages(hints, `hint-${type}`);
};
