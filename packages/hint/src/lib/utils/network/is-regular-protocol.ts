import { debug as d } from '../debug';
import normalizeString from '../misc/normalize-string';

const debug: debug.IDebugger = d(__filename);
const protocolRegex = /([^:]*):.*/;

/** Convenience function to check if a uri's protocol is http/https if specified. */
export default (uri: string): boolean => {
    const normalizedUri = normalizeString(uri);
    const exec = protocolRegex.exec(normalizedUri!);
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
