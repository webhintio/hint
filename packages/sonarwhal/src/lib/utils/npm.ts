import * as path from 'path';
import * as fs from 'fs';

import { debug as d } from './debug';
import * as logger from './logging';

const debug: debug.IDebugger = d(__filename);

import { spawnSync, SpawnSyncReturns } from 'child_process';

const packageExists = () => {
    const packagePath: string = path.join(process.cwd(), 'package.json');

    return fs.existsSync(packagePath); // eslint-disable-line no-sync
};

export const installPackages = (packages: Array<string>) => {
    const global: boolean = !packageExists();

    const command: string = `npm install ${packages.join(' ')}${global ? ' -g' : ''}`;

    try {
        debug(`Running command ${command}`);

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

export const installCoreRules = (ids: Array<string>) => {
    const npmPackages = ids.map((id) => {
        return `@sonarwhal/rule-${id}`;
    });

    return installPackages(npmPackages);
};
