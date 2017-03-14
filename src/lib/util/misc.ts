import * as fs from 'fs';
import * as pify from 'pify';
import * as stripBom from 'strip-bom';

/** Convenience wrapper for synchronously reading file contents. */
export const readFile = (filePath: string): string => {
    return stripBom(fs.readFileSync(filePath, 'utf8')); // eslint-disable-line no-sync
};

/** Convenience wrapper for asynchronously reading file contents. */
export const readFileAsync = (filePath: string): Promise<string> => {

    return stripBom(pify(fs.readFile)(filePath, 'utf8'));
};
