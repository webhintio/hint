import { spawn } from 'child_process';
import { access } from 'fs';
import { resolve as pathResolve } from 'path';

export type LoadOptions = {
    paths?: string[];
};

export type InstallOptions = {
    cwd?: string;
};

export const hasFile = (name: string, cwd = process.cwd()): Promise<boolean> => {
    return new Promise((resolve) => {
        access(pathResolve(cwd, name), (err) => {
            resolve(!err);
        });
    });
};

export const installPackages = (packages: string[], options?: InstallOptions) => {
    return new Promise(async (resolve, reject) => {

        // Build the installation commands.
        const cmd = process.platform === 'win32' ? '.cmd' : '';
        const npm = `npm${cmd} install ${packages.join(' ')} --save-dev --verbose`;
        const yarn = `yarn${cmd} add ${packages.join(' ')} --dev`;

        // Install via `yarn` if `yarn.lock` is present, `npm` otherwise.
        const isUsingYarn = await hasFile('yarn.lock', options && options.cwd);
        const command = isUsingYarn ? yarn : npm;
        const parts = command.split(' ');

        // Actually start the installation.
        const child = spawn(parts[0], parts.slice(1), { cwd: options && options.cwd, stdio: 'inherit' });

        child.on('error', (err) => {
            reject(err);
        });

        child.on('exit', (code) => {
            if (code) {
                reject(code);
            } else {
                resolve();
            }
        });
    });
};

export const loadPackage = <T>(name: string, options?: LoadOptions): T => {
    const path = require.resolve(name, { paths: options && options.paths });

    console.log(`Found ${name} at ${path}`);

    return require(path);
};
