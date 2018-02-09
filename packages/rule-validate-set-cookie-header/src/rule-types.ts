/** Parsed Set Cookie Header. */

export type ParsedSetCookieHeader = {
    domain?: string;
    expires?: string;
    httponly?: boolean;
    'max-age'?: string;
    name: string;
    path?: string;
    resource?: string;
    samesite?: boolean;
    secure?: boolean;
    value: string;
};
