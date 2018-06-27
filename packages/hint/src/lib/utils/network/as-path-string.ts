import { platform } from 'os';
import { URL } from 'url';

/**
 * Returns the pathname of a URL, normalizing depending on the platform. E.g.:
 *
 * * `file:///c:/projects/` --> `c:/projects/`
 * * `file:///mnt/projects/` --> `/mnt/projects/`
 */
export default (uri: URL) => {

    if (uri.protocol !== 'file:') {
        return uri.pathname;
    }

    const pathname = platform() === 'win32' ?
        uri.pathname.substr(1) :
        uri.pathname;

    return pathname;
};
