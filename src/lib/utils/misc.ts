import * as fs from 'fs';
import * as url from 'url';
import { promisify } from 'util';

import * as stripBom from 'strip-bom';

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

/** Convenience wrapper to add a delay using promises. */
export const delay = (millisecs) => {
    return new Promise((resolve) => {
        setTimeout(resolve, millisecs);
    });
};

/** Convenience function to check if a resource uses a specific protocol. */

export const hasProtocol = (resource: string, protocol: string): boolean => {
    return url.parse(resource).protocol === protocol;
};

/** Convenience function to check if a resource is a data URI. */
export const isDataURI = (resource: string): boolean => {
    return hasProtocol(resource, 'data:');
};

/** Convenience function to check if a resource is a local file. */
export const isLocalFile = (resource: string): boolean => {
    return hasProtocol(resource, 'file:');
};

/** Remove whitespace from both ends of a string and lowercase it. */
export const normalizeString = (value: string) => {
    if (typeof value === 'undefined' || value === null) {
        return null;
    }

    return value.toLowerCase().trim();
};

/** Convenience wrapper for synchronously reading file contents. */
export const readFile = (filePath: string): string => {
    return stripBom(fs.readFileSync(filePath, 'utf8')); // eslint-disable-line no-sync
};

/** Convenience wrapper for asynchronously reading file contents. */
export const readFileAsync = async (filePath: string): Promise<string> => {
    const content = await promisify(fs.readFile)(filePath, 'utf8');

    return stripBom(content);
};
