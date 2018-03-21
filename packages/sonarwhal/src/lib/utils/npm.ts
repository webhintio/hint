import * as esearch from 'npm/lib/search/esearch';
import * as npm from 'npm';
import { promisify } from 'util';
import { spawnSync, SpawnSyncReturns } from 'child_process';

import { NpmPackage } from '../types';
import { debug as d } from './debug';
import * as logger from './logging';
import { loadJSONFile, findPackageRoot } from './misc';

const debug: debug.IDebugger = d(__filename);
const npmLoadAsync = promisify(npm.load);

export const installPackages = (packages: Array<string>): boolean => {
    /** Whether or not the package should be installed globally. */
    let global: boolean = false;
    /** Whether or not the package should be installed as devDependencies. */
    let isDev: boolean = false;
    /** Path to `package.json`. */
    let packagePath: string;
    /** Current working directory. */
    const currentWorkingDir = process.cwd();
    /** Wheter or not the process is running in windows */
    const isWindows = process.platform === 'win32';

    /** Command to install the packages. */
    let command: string = `npm install ${packages.join(' ')}`;

    if (packages.length === 0) {
        return true;
    }

    try {
        packagePath = findPackageRoot(currentWorkingDir);

        global = packagePath !== currentWorkingDir;
    } catch (error) {
        // `package.json` is not found.
        global = true;
    }

    try {
        if (!global) {
            const jsonContent = loadJSONFile(packagePath);

            // If `sonarwhal` is a devDependency, then set all packages as devDependencies.
            isDev = jsonContent.devDependencies && jsonContent.devDependencies.hasOwnProperty('sonarwhal');

        }

        command += global ? ' -g' : '';
        command += isDev ? ' --save-dev' : '';

        debug(`Running command ${command}`);
        logger.log('Installing packages...');
        logger.log(command);

        const result: SpawnSyncReturns<Buffer> = spawnSync(command, { shell: true });

        if (result.status !== 0) {
            throw new Error(result.output[2].toString());
        }

        logger.log('Packages installed successfully');

        return true;
    } catch (err) {
        debug(err);
        // One of the packages doesn't exists
        logger.error(`Error executing "${command}"`);
        if (err.message.includes('404')) {
            logger.error(`One or more of the packages don't exist`);
        } else {
            /*
             * There was an error installing packages.
             * Show message to install packages manually (maybe permissions error?).
             */
            logger.error(`Try executing:
    ${!isWindows && global ? 'sudo ' : ''}${command}
            manually to install all the packages.`);
        }

        return false;
    }
};

const loadNpm = () => {
    return npmLoadAsync({ loaded: false });
};

/** Filters the packages that `startsWith` `initTerm`. */
const filterPackages = (packages: Array<NpmPackage>, initTerm: string) => {
    return packages.filter((pkg) => {
        return pkg.name.startsWith(initTerm);
    });
};

/**
 * Searches all the packages in npm given `searchTerm`.
 */
export const search = (searchTerm: string): Promise<Array<NpmPackage>> => {
    return new Promise(async (resolve, reject) => {
        await loadNpm();

        const results: Array<NpmPackage> = [];

        const searchOptions = {
            description: true,
            excluded: [],
            include: [searchTerm],
            limit: 1000,
            staleness: 900,
            unicode: false
        };

        esearch(searchOptions)
            .on('data', (data) => {
                results.push(data as NpmPackage);
            })
            .on('error', (err) => {
                reject(err);
            })
            .on('end', () => {
                resolve(results as Array<NpmPackage>);
            });
    });
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
