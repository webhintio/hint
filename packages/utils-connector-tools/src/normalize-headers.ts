import { HttpHeaders } from 'hint/dist/src/lib/types';

/** Normalize all keys of an `HttpHeader` to lowercase. */
export const normalizeHeaders = (headers?: HttpHeaders | null) => {
    if (headers) {
        return Object.keys(headers).reduce((result, key) => {
            result[key.toLowerCase().trim()] = headers[key];

            return result;
        }, {} as HttpHeaders);
    }

    return null;
};
