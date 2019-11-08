import { normalizeString } from '@hint/utils-string';
import { HttpHeaders } from '@hint/utils-types';

/**
 * Remove whitespace from both ends of a header value and lowercase it.
 * If `defaultValue` is provided, it will be return instead of the actual
 * return value if that value is `null`.
 */
export const normalizeHeaderValue = (headers: HttpHeaders, headerName: string, defaultValue?: string) => {
    return normalizeString(headers && headers[normalizeString(headerName) || ''], defaultValue);
};
