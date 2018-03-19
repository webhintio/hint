import * as url from 'url';
import { URL } from 'url'; // this is necessary to avoid TypeScript mixes types.

import * as _ from 'lodash';
import * as fileUrl from 'file-url';

import { debug as d } from './debug';
import * as logger from './logging';
import { isFile, isDirectory, pathExists } from './misc';

const debug: debug.IDebugger = d(__filename);

/**
 * Receives a string and returns a valid Uris that are either:
 * * file:// if they start with the protocol or exist in the file system
 * * http(s):// if they start with this protocol or are not a valid file
 * * null if not valid
 *
 */
export const getAsUri = (source: string): URL => {
    const entry: string = source.trim();
    let target: URL;

    try {
        target = new URL(entry);
    } catch (err) {
        target = new URL(`http://${entry}`);
    }

    const protocol: string = target.protocol;

    /*
     * If it's a URI.
     * Check if the protocol is HTTP or HTTPS.
     */
    if (protocol === 'http:' || protocol === 'https:' || protocol === 'file:') {
        debug(`Adding valid target: ${url.format(target)}`);

        return target;
    }

    /*
     * If it's not a URI
     * If it does exist and it's a regular file.
     */
    if (isFile(entry) || isDirectory(entry)) {
        target = new URL(fileUrl(entry));
        debug(`Adding valid target: ${url.format(target)}`);

        return target;
    }

    target = new URL(`http://${entry}`);

    /*
     * And it doesn't exist locally, and is a valid URL:
     * Except for the case of the well known and used `localhost`,
     * for all other cases the `hostname` needs to contain at least
     * a `.`. Private domains should have `http(s)://` in front.
     */
    if (!pathExists(entry) && (target.hostname === 'localhost' || target.hostname.includes('.'))) {
        debug(`Adding modified target: ${url.format(target)}`);

        return target;
    }

    // If it's not a regular file or looks like a URL, ignore it.
    logger.error(`Ignoring '${entry}' as it's not an existing file nor a valid URL`);

    return null;
};

/**
 * Receives an array of string and returns an array of valid Uris that are either:
 * * file:// if they start with the protocol or exist in the file system
 * * http(s):// if they start with this protocol or are not a valid file
 * * null if not valid
 *
 */
export const getAsUris = (source: Array<string>): Array<URL> => {
    const targets: Array<URL> = source.reduce((uris: Array<URL>, entry: string): Array<URL> => {
        const uri: URL = getAsUri(entry);

        if (uri) {
            uris.push(uri);
        }

        return uris;
    }, []);

    return _.compact(targets);
};
