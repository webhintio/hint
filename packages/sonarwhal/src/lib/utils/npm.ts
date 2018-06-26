import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

import * as npmRegistryFetch from 'npm-registry-fetch';

import { NpmPackage } from '../types';
import { debug as d } from './debug';
import * as logger from './logging';
import loadJSONFile from './fs/load-json-file';
import findPackageRoot from './packages/find-package-root';

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

export const installPackages = async (packages: Array<string>): Promise<boolean> => {
    /** Whether or not the package should be installed as devDependencies. */
    let isDev: boolean = false;
    /** Current working directory. */
    const currentWorkingDir = process.cwd();
    /** Wheter or not the process is running in windows */
    const isWindows = process.platform === 'win32';

    /** Command to install the packages. */
    let command: string = `npm install ${packages.join(' ')}`;

    if (packages.length === 0) {
        return Promise.resolve(true);
    }

    const sonarwhalLocalPath = path.join(currentWorkingDir, 'node_modules', 'sonarwhal', 'package.json');

    // Check if sonarwhal is installed locally.
    const global: boolean = !fs.existsSync(sonarwhalLocalPath); // eslint-disable-line no-sync

    if (!global) {
        try {
            const packagePath = findPackageRoot(currentWorkingDir);
            const jsonContent = loadJSONFile(path.join(packagePath, 'package.json'));

            // If `sonarwhal` is a devDependency, then set all packages as devDependencies.
            isDev = jsonContent.devDependencies && jsonContent.devDependencies.hasOwnProperty('sonarwhal');
        } catch (err) {
            // Even if sonarwhal is installed locally, package.json could not exist in the current working directory.
            isDev = false;
        }
    }

    command += global ? ' -g' : '';
    command += isDev ? ' --save-dev' : '';

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
        logger.error(`
There was a problem installing packages.
Please try executing:
    ${!isWindows && global ? 'sudo ' : ''}${command}
            manually to install all the packages.`);

        return false;
    }
};

/** Filters the packages that `startsWith` `initTerm`. */
const filterPackages = (packages: Array<NpmPackage>, initTerm: string) => {
    return packages.filter((pkg) => {
        return pkg.name.startsWith(initTerm);
    });
};

/** Get npm packages from the object returned for npmRegistryFetch.json. */
const getPackages = (result): Array<NpmPackage> => {
    return result.objects.map((obj) => {
        return obj.package;
    });
};

/** Generate a search query to search packages. */
const generateSearchQuery = (searchTerm, from?, size = 100) => {
    return `/-/v1/search?text=${searchTerm}&size=${size}${from ? `&from=${from}` : ''}`;
};

/**
 * Searches all the packages in npm given `searchTerm`.
 */
export const search = async (searchTerm: string): Promise<Array<NpmPackage>> => {
    const result = await npmRegistryFetch.json(generateSearchQuery(searchTerm));

    let total = getPackages(result);

    while (result.total > total.length) {
        const r = await npmRegistryFetch.json(generateSearchQuery(searchTerm, total.length));

        total = total.concat(getPackages(r));
    }


    return total;
};

/** Get core packages from npm. */
export const getOfficialPackages = async (type: string): Promise<Array<NpmPackage>> => {
    const rules = await search(`@sonarwhal/${type}`);

    /*
     * We need to filter the results because the search can
     * include other packages that doesn't start with `@sonarwhal/{type}`.
     */
    return filterPackages(rules, `@sonarwhal/${type}`);
};

/** Get external packages from npm. */
export const getUnnoficialPackages = async (type: string): Promise<Array<NpmPackage>> => {
    const rules = await search(`sonarwhal-${type}`);

    /*
     * We need to filter the results because the search can
     * include other packages that doesn't start with `sonarwhal-{type}`.
     */
    return filterPackages(rules, `sonarwhal-${type}`);
};
