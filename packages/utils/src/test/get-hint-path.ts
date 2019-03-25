import { basename, dirname, resolve } from 'path';
import { findPackageRoot } from '../packages';

/**
 * Returns the name of the hint based on:
 * * if it is a single hint package --> Searches for the entry point in
 *   package.json
 * * if it is muti hint package --> Searches the path to the hint that
 *   has the same name as the test file
 */
export const getHintPath = (name: string, multihint?: boolean): string => {
    const dir = dirname(name);
    const root = findPackageRoot(dir);

    if (multihint) {
        const hintName = basename(name);

        return resolve(dir, `../src/${hintName}`);
    }

    return require.resolve(root);
};
