import * as path from 'path';
import * as fs from 'fs';
import * as esearch from 'npm/lib/search/esearch';
import * as npm from 'npm';
import { promisify } from 'util';
import { spawnSync, SpawnSyncReturns } from 'child_process';

import { NpmPackage } from '../types';
import { debug as d } from './debug';
import * as logger from './logging';

const debug: debug.IDebugger = d(__filename);
const npmLoadAsync = promisify(npm.load);


const packageExists = () => {
    const packagePath: string = path.join(process.cwd(), 'package.json');

    return fs.existsSync(packagePath); // eslint-disable-line no-sync
};

export const installPackages = (packages: Array<string>) => {
    const global: boolean = !packageExists();

    const command: string = `npm install ${packages.join(' ')}${global ? ' -g' : ''}`;

    try {
        debug(`Running command ${command}`);
        logger.log('Installing packages...');

        const result: SpawnSyncReturns<Buffer> = spawnSync(command, { shell: true });

        if (result.status !== 0) {
            throw new Error(result.output[2].toString());
        }

        logger.log('Packages intalled successfully');

        return 0;
    } catch (err) {
        /*
         * There was an error installing packages.
         * Show message to install packages manually.
         */
        logger.error(err);
        logger.error(`Something went wrong installing the packages, please run:
${process.platform !== 'win32' ? 'sudo ' : ''}${command}
to install all the rules.`);

        return 1;
    }
};

const loadNpm = () => {
    return npmLoadAsync({ loaded: false });
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
