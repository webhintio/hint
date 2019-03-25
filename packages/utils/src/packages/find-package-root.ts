import { readdirSync as readdir } from 'fs';
import { resolve } from 'path';

/**
 * Searches for the first folder that contains the `fileToFind` going up the
 * tree.
 *
 * By default, it looks for `package.json` in the current `__dirname` and goes
 * up the tree until one is found. If none, it throws an `Error`:
 * `No package found`.
 */
export const findPackageRoot = (dirname: string = __dirname, fileToFind: string = 'package.json'): string => {
    const content: string[] = readdir(dirname);

    if (content.includes(fileToFind)) {
        return dirname;
    }

    const parentFolder: string = resolve(dirname, '..');

    if (parentFolder === dirname) {
        throw new Error('No package found');
    }

    return findPackageRoot(parentFolder, fileToFind);
};
