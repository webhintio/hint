import * as os from 'os';
import * as url from 'url';

/**
 * Returns the pathname of a URL, normalizing depending on the platform. E.g.:
 *
 * * `file:///c:/projects/` --> `c:/projects/`
 * * `file:///mnt/projects/` --> `/mnt/projects/`
 */
export const getAsPathString = (uri: url.Url) => {

    if (uri.protocol !== 'file:') {
        return uri.pathname;
    }

    const pathname = os.platform() === 'win32' ? uri.pathname.substr(1) : uri.pathname;

    return pathname;
};
