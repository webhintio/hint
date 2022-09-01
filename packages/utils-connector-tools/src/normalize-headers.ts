import { HttpHeaders } from '@hint/utils-types';

// Normalize all keys of an `HttpHeader` to lowercase.
export const normalizeHeaders = (headers?: HttpHeaders | null) => {
    if (headers) {
        return Object.keys(headers).reduce((result, key) => {
            /**
             * CDP combines duplicated headers and instead of separate
             * the values with `,` it uses `\n`:
             *  - https://github.com/puppeteer/puppeteer/issues/5244
             *
             * Additionally, some architectures can send duplicate headers
             * with the same value (https://github.com/webhintio/hint/issues/750#issuecomment-562874029).
             *
             * We remove the duplicate values for easier processing.
             */
            const values = new Set(headers[key]?.split('\n'));

            result[key.toLowerCase().trim()] = Array.from(values).join(', ');

            return result;
        }, {} as HttpHeaders);
    }

    return null;
};
