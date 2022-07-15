import fetch, { RequestInit } from 'node-fetch';

/**
 * Mostly used for legacy support on a breaking change and should be considered
 * deprecated. Need to be in sync with @hint/utils-connector-tools, but it cannot be
 * used because it creates a circular dependency.
 *
 * Required as RequestInit options do not support SSL.
 */
interface IRequestOptions extends RequestInit {
    rejectUnauthorized?: boolean;
    strictSSL?: boolean;
}

/** Convenience wrapper for asynchronously request an URL. */
export const requestAsync = async (url: string, options?: IRequestOptions): Promise<any> => {
    const response = await fetch(url, options);

    return await response.text();
};
