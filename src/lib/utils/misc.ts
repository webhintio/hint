import * as fs from 'fs';
import * as path from 'path';
import * as url from 'url';

import { parse as parseContentTypeHeader } from 'content-type';
import { promisify } from 'util';

import * as stripBom from 'strip-bom';
import * as requireUncached from 'require-uncached';
import * as stripComments from 'strip-json-comments';
import * as requestAsync from 'request-promise';

import { IAsyncHTMLElement } from '../types';
import { debug as d } from './debug';
const debug: debug.IDebugger = d(__filename);

// const readdir = promisify(fs.readdir);
const readdir = fs.readdirSync; // eslint-disable-line no-sync

/**
 * Cut a given string adding ` … ` in the middle.
 * The default length is 50 characters.
 */
const cutString = (txt: string, length: number = 50): string => {
    if (txt.length <= length) {
        return txt;
    }

    const partialLength: number = Math.floor(length - 3) / 2;

    return `${txt.substring(0, partialLength)} … ${txt.substring(txt.length - partialLength, txt.length)}`;
};

/** Convenience wrapper to add a delay using promises. */
const delay = (millisecs: number): Promise<object> => {
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

/** Convenience function to check if a resource is a HTMLDocument. */
const isHTMLDocument = (targetURL: string, responseHeaders: object): boolean => {

    // If it's a local file, just presume it's a HTML document.

    if (isLocalFile(targetURL)) {
        return true;
    }

    // Otherwise, check.

    const contentTypeHeaderValue: string = responseHeaders['content-type'];
    let mediaType: string;

    try {
        mediaType = parseContentTypeHeader(contentTypeHeaderValue).type;
    } catch (e) {
        return false;
    }

    return mediaType === 'text/html';
};

/** Convenience function to check if a resource is served over HTTPS. */
const isHTTPS = (resource: string): boolean => {
    return hasProtocol(resource, 'https:');
};

/**
 * Remove whitespace from both ends of a string and lowercase it.
 *  If `defaultValue` is provided, it will return it if the return
 *  value would be `null`.
 */
const normalizeString = (value: string, defaultValue?: string): string => {
    if (typeof value === 'undefined' || value === null) {
        return typeof defaultValue !== 'undefined' ? defaultValue : null;
    }

    return value.toLowerCase().trim();
};

/** Convenience function to check if a uri's protocol is http/https if specified. */
const isRegularProtocol = (uri: string): boolean => {
    const normalizedUri = normalizeString(uri);
    const protocol = url.parse(normalizedUri).protocol;

    /*
     * Ignore cases such as `javascript:void(0)`,
     * `data:text/html,...`, `file://` etc.
     *
     * Note: `null` is when the protocol is not
     * specified (e.g.: test.html).
     */

    if (![null, 'http:', 'https:'].includes(protocol)) {
        debug(`Ignore protocol: ${protocol}`);

        return false;
    }

    return true;
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
    const content: string = await promisify(fs.readFile)(filePath, 'utf8');

    return stripBom(content);
};

/** Request response in the json format from an endpoint */
const requestJSONAsync = (uri: string) => {
    return requestAsync({
        json: true,
        uri
    });
};

/** Convenience wrapper for asynchronously write a file. */
const writeFileAsync = async (filePath: string, data: string): Promise<void> => {
    await promisify(fs.writeFile)(filePath, data, { encoding: 'utf8' });
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

/**
 * Searches for the first folder that contains the `fileToFind` going up the
 * tree.
 *
 * By default, it looks for `package.json` in the current `__dirname` and goes
 * up the tree until one is found. If none, it throws an `Error`:
 * `No package found`.
 */
const findPackageRoot = (dirname: string = __dirname, fileToFind: string = 'package.json') => {
    const content: Array<string> = readdir(dirname);

    if (content.includes(fileToFind)) {
        return dirname;
    }

    const parentFolder: string = path.resolve(dirname, '..');

    if (parentFolder === dirname) {
        throw new Error('No package found');
    }

    return findPackageRoot(parentFolder, fileToFind);
};

const hasAttributeWithValue = (element: IAsyncHTMLElement, nodeName: string, attribute: string, value: string): boolean => {
    if (!element || element.nodeName.toLowerCase() !== nodeName.toLowerCase()) {
        return false;
    }

    const relAttribute: string = element.getAttribute(attribute);

    if (!relAttribute) {
        return false;
    }

    const rels: Array<string> = relAttribute.toLowerCase()
        .split(' ');

    return rels.some((rel) => {
        return rel === value;
    });
};

export {
    cutString,
    delay,
    findPackageRoot,
    hasAttributeWithValue,
    hasProtocol,
    isDataURI,
    isHTMLDocument,
    isHTTPS,
    isLocalFile,
    isRegularProtocol,
    loadJSFile,
    loadJSONFile,
    normalizeString,
    readFile,
    readFileAsync,
    requestJSONAsync,
    writeFileAsync
};
