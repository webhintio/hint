import * as fs from 'fs';
import * as url from 'url';
import { promisify } from 'util';

import * as stripBom from 'strip-bom';
import * as requireUncached from 'require-uncached';
import * as stripComments from 'strip-json-comments';

import { debug as d } from './debug';
const debug = d(__filename);

/** Cut a given string adding ` … ` in the middle.
 * The default length is 50 characters.
 */
const cutString = (txt: string, length: number = 50) => {
    if (txt.length <= length) {
        return txt;
    }

    const partialLength = Math.floor(length - 3) / 2;

    return `${txt.substring(0, partialLength)} … ${txt.substring(txt.length - partialLength, txt.length)}`;
};

/** Convenience wrapper to add a delay using promises. */
const delay = (millisecs) => {
    return new Promise((resolve) => {
        setTimeout(resolve, millisecs);
    });
};

/** Convenience function to check if a resource uses a specific protocol. */
const hasProtocol = (resource: string, protocol: string): boolean => {
    return url.parse(resource).protocol === protocol;
};

/** Convenience function to check if a resource is a data URI. */
const isDataURI = (resource: string): boolean => {
    return hasProtocol(resource, 'data:');
};

/** Convenience function to check if a resource is a local file. */
const isLocalFile = (resource: string): boolean => {
    return hasProtocol(resource, 'file:');
};

/** Remove whitespace from both ends of a string and lowercase it.
 *  If `defaultValue` is provided, it will return it if the return
 *  value would be `null`. */
const normalizeString = (value: string, defaultValue?: string) => {
    if (typeof value === 'undefined' || value === null) {
        return typeof defaultValue !== 'undefined' ? defaultValue : null;
    }

    return value.toLowerCase().trim();
};

/** Normalize String and then replace characters with delimiter */
export const normalizeStringByDelimiter = (value: string, delimiter: string) => {
    return normalizeString(value).replace(/[^a-z0-9]/gi, delimiter);
};

/** Convenience wrapper for synchronously reading file contents. */
const readFile = (filePath: string): string => {
    return stripBom(fs.readFileSync(filePath, 'utf8')); // eslint-disable-line no-sync
};

/** Convenience wrapper for asynchronously reading file contents. */
const readFileAsync = async (filePath: string): Promise<string> => {
    const content = await promisify(fs.readFile)(filePath, 'utf8');

    return stripBom(content);
};


/** Loads a JSON a file. */
const loadJSONFile = (filePath: string) => {
    debug(`Loading JSON file: ${filePath}`);

    return JSON.parse(stripComments(readFile(filePath)));
};

/** Loads a JavaScript file. */
const loadJSFile = (filePath: string): any => {
    debug(`Loading JS file: ${filePath}`);

    return requireUncached(filePath);
};

export {
    cutString,
    delay,
    hasProtocol,
    isDataURI,
    isLocalFile,
    loadJSFile,
    loadJSONFile,
    normalizeString,
    readFile,
    readFileAsync
};
