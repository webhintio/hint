import fetch, { RequestInit } from 'node-fetch';
import * as https from 'https';

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
export const requestAsync = async (url: string, options: IRequestOptions = {}): Promise<any> => {
    let isHTTPS = false;

    if (url.startsWith('https')) {
        isHTTPS = true;
    }

    if (options.strictSSL || isHTTPS) {
        let httpsAgentOptions;

        // This might be set explicitely to false, so we need to validate only if it has a value.
        if (options.rejectUnauthorized !== undefined) {
            httpsAgentOptions = {rejectUnauthorized: options.rejectUnauthorized};
        }

        const httpsAgent = new https.Agent(httpsAgentOptions);

        options.agent = httpsAgent;
    }

    const response = await fetch(url, options);

    return await response.text();
};
