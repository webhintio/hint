import * as fs from 'fs';
import * as path from 'path';
import { URL } from 'url';
import { promisify } from 'util';

import { parse as parseContentTypeHeader } from 'content-type';
import * as shell from 'shelljs';
import * as request from 'request';

import * as stripBom from 'strip-bom';
import * as requireUncached from 'require-uncached';
import * as stripComments from 'strip-json-comments';

import { IAsyncHTMLElement } from '../types';
import { debug as d } from './debug';
const debug: debug.IDebugger = d(__filename);
const processDir = process.cwd();

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

/** Try to determine the resource's file name. */
const getFileName = (resource: string) => {
    return path.basename(resource);
};

/*
 * Try to determine the resource's file extension.
 */
const getFileExtension = (resource: string): string => {
    let url: URL;

    try {
        /*
         * The url needs to be parsed first
         * otherwise the result from path.extname could be incorrect, e.g.: https://sonarwhal.com => '.com'
         */
        url = new URL(resource);
    } catch (err) {
        return path.extname(resource).split('.')
            .pop();
    }

    return path.extname(url.pathname).split('.')
        .pop();
};

/**
 * Remove whitespace from both ends of a header value and lowercase it.
 * If `defaultValue` is provided, it will be return instead of the actual
 * return value if that value is `null`.
 */
const getHeaderValueNormalized = (headers: object, headerName: string, defaultValue?: string) => {
    return normalizeString(headers && headers[normalizeString(headerName)], defaultValue); // eslint-disable-line no-use-before-define, typescript/no-use-before-define
};

/** Convenience function to check if a resource uses a specific protocol. */
const hasProtocol = (resource: string, protocol: string): boolean => {
    return new URL(resource).protocol === protocol;
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

    // If it's a local file, presume it's a HTML document.

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

/** Convenience function to check if a resource is served over HTTP. */
const isHTTP = (resource: string): boolean => {
    return hasProtocol(resource, 'http:');
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

const protocolRegex = /([^:]*):.*/;

/** Convenience function to check if a uri's protocol is http/https if specified. */
const isRegularProtocol = (uri: string): boolean => {
    const normalizedUri = normalizeString(uri);
    const exec = protocolRegex.exec(normalizedUri);
    const protocol = exec ? exec[1] : null;

    /*
     * Ignore cases such as `javascript:void(0)`,
     * `data:text/html,...`, `file://` etc.
     *
     * Note: `null` is when the protocol is not
     * specified (e.g.: test.html).
     */

    if (![null, 'http', 'https'].includes(protocol)) {
        debug(`Ignore protocol: ${protocol}`);

        return false;
    }

    return true;
};

/** Normalize String and then replace characters with delimiter */
const normalizeStringByDelimiter = (value: string, delimiter: string) => {
    return normalizeString(value).replace(/[^a-z0-9]/gi, delimiter);
};

/** Return if normalized `source` string includes normalized `included` string. */
const isNormalizedIncluded = (source: string, included: string) => {
    return normalizeString(source).includes(normalizeString(included));
};

/** Convert '-' delimitered string to camel case name. */
const toCamelCase = (value: string) => {
    return value.split('-').reduce((accu: string, w: string) => {
        if (!accu.length) {
            return w.toLocaleLowerCase();
        }

        let current = accu;

        current += w.length ? `${w.charAt(0).toUpperCase()}${w.substr(1).toLowerCase()}` : '';

        return current;
    }, '');
};

/** Convert '-' delimitered string to pascal case name. */
const toPascalCase = (value: string) => {
    return value.split('-').reduce((accu: string, w: string) => {
        let current = accu;

        current += w.length ? `${w.charAt(0).toUpperCase()}${w.substr(1).toLowerCase()}` : '';

        return current;
    }, '');
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

const requestAsync = (options: string | request.Options): Promise<any> => {
    return new Promise((resolve, reject) => {
        // `as any` because typescript complains about the type of options.
        request(options as any, (error, res, body) => {
            if (error) {
                return reject(error);
            }

            return resolve(body);
        });
    });
};

/** Request response in the json format from an endpoint */
const requestJSONAsync = (uri: string, options: object): Promise<any> => {
    const params = Object.assign({
        json: true,
        uri
    }, options);

    return requestAsync(params);
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
const findPackageRoot = (dirname: string = __dirname, fileToFind: string = 'package.json'): string => {
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

/**
 * Find the node_modules folder where sonarwhal is installed as
 * a dependency or returns the sonarwhal node_modules folder if not.
 */
const findNodeModulesRoot = (dirname: string = __dirname): string => {
    const packageRoot = findPackageRoot(dirname);

    const nodeModulesPath = path.join(packageRoot, '..');

    /*
     * If sonarwhal is installed as a dependency
     * then we need to return the parent folder
     * i.e. c:\myproject\node_modules\sonarwhal -> c:\myproject\node_modules
     */
    if (nodeModulesPath.endsWith('node_modules')) {
        return nodeModulesPath;
    }

    /*
     * If we are using directly the sonarwhal project
     * then we need to return the node_modules folder
     * inside sonarwhal
     * i.e. c:\sonarwhal -> c:\sonarwhal\node_modules
     */
    return path.join(packageRoot, 'node_modules');
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

/** Check if a path is a file and exists. */
const isFile = (filePath: string): boolean => {
    return shell.test('-f', filePath);
};

/** Check if a path is a directory and exists*/
const isDirectory = (directoryPath: string): boolean => {
    return shell.test('-d', directoryPath);
};

/** Check if a path exists */
const pathExists = (pathString: string): boolean => {
    return shell.test('-e', pathString);
};

/**
 * Returns if the rule that is going to be created is an official.
 *
 * To do this we search the first `package.json` starting in `porcess.cwd()`
 * and go up the tree. If the name is `sonarwhal` then it's an official one.
 * If not or no `package.json` are found, then it isn't.
 */
const isOfficial = async (): Promise<boolean> => {
    try {
        const pkg = JSON.parse(await readFileAsync(path.join(findPackageRoot(processDir), 'package.json')));

        return pkg.name === '@sonarwhal/monorepo';
    } catch (e) {
        // No `package.json` was found, so it's not official
        return false;
    }
};

/**
 * Returns the package found in the given `pathString` or an
 * exception if no package is found
 */
const getPackage = (pathString: string) => {
    return require(`${pathString}/package.json`);
};

/** Returns an object that represents the `package.json` version of `sonarwhal` */
const getSonarwhalPackage = () => {
    return require(path.join(__dirname, '../../../../package.json'));
};

/**
 * Returns the same object but with all the properties lower cased. This is
 * helpful when working with `headers`.
 */
const toLowerCaseKeys = (obj) => {
    const entries = Object.entries(obj);

    return entries.reduce((lowerCased, [key, value]) => {
        lowerCased[key.toLowerCase()] = value;

        return lowerCased;
    }, {});
};

export {
    cutString,
    delay,
    isNormalizedIncluded,
    findNodeModulesRoot,
    findPackageRoot,
    getFileExtension,
    getFileName,
    getHeaderValueNormalized,
    getPackage,
    getSonarwhalPackage,
    hasAttributeWithValue,
    hasProtocol,
    isDataURI,
    isDirectory,
    isFile,
    isHTMLDocument,
    isHTTP,
    isHTTPS,
    isLocalFile,
    isOfficial,
    isRegularProtocol,
    loadJSFile,
    loadJSONFile,
    normalizeString,
    normalizeStringByDelimiter,
    pathExists,
    readFile,
    readFileAsync,
    requestJSONAsync,
    requestAsync,
    toCamelCase,
    toPascalCase,
    toLowerCaseKeys,
    writeFileAsync
};
