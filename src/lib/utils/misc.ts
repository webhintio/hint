import * as fs from 'fs';

import * as pify from 'pify';
import * as stripBom from 'strip-bom';

/** Convenience wrapper for synchronously reading file contents. */
export const readFile = (filePath: string): string => {
    return stripBom(fs.readFileSync(filePath, 'utf8')); // eslint-disable-line no-sync
};

/** Convenience wrapper for asynchronously reading file contents. */
export const readFileAsync = async (filePath: string): Promise<string> => {
    const content = await pify(fs.readFile)(filePath, 'utf8');

    return stripBom(content);
};

/** Convenience wrapper to add a delay using promises. */
export const delay = (millisecs) => {
    return new Promise((resolve) => {
        setTimeout(resolve, millisecs);
    });
};

export const normalizeString = (value: string) => {
    if (typeof value === 'undefined' || value === null) {
        return null;
    }

    return value.toLowerCase().trim();
};

/** Cut a given string adding ` … ` in the middle.
 * The default length is 50 characters.
 */
export const cutString = (txt: string, length: number = 50) => {
    if (txt.length <= length) {
        return txt;
    }

    const partialLength = Math.floor(length - 3) / 2;

    return `${txt.substring(0, partialLength)} … ${txt.substring(txt.length - partialLength, txt.length)}`;
};
