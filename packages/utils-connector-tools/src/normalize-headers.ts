import { HttpHeaders } from 'hint/src/lib/types';

export const normalizeHeaders = (headers?: HttpHeaders | null) => {
    if (headers) {
        return Object.keys(headers).reduce((result, key) => {
            result[key.toLowerCase()] = headers[key];

            return result;
        }, {} as HttpHeaders);
    }

    return null;
};
