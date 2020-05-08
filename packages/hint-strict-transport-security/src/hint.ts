/**
 * @fileoverview Check if responses served over HTTPS also have the Strict-Transport-Security header with a proper value max-age value.
 */
import * as url from 'url';
import { URL } from 'url'; // this is necessary to avoid TypeScript mixes types.

import { isRegularProtocol } from '@hint/utils-network';
import { debug as d } from '@hint/utils-debug';
import { FetchEnd, HintContext, IHint, NetworkData } from 'hint';
import { Severity } from '@hint/utils-types';

import meta from './meta';
import { getMessage } from './i18n.import';

const debug = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class StrictTransportSecurityHint implements IHint {

    public static readonly meta = meta;

    public constructor(context: HintContext) {

        /** The minimum period (in seconds) allowed for `max-age`. */
        let minMaxAgeValue: number;
        /** Whether or not check the preload attribute */
        let checkPreload: boolean;
        /** Endpoint to verify that the domain name has already been included in the `preload list` */
        const statusApiEndPoint = `https://hstspreload.org/api/v2/status?domain=`;
        /** Endpoint to verify that the domain name is qualified to be preloaded */
        const preloadableApiEndPoint = `https://hstspreload.org/api/v2/preloadable?domain=`;
        /** Set of unsupported domains to avoid make unnecessary requests. */
        const unsupportedDomains: Set<string> = new Set();

        /*
         * HACK: Need to do a require here in order to be capable of mocking
         * when testing the hint and `import` doesn't work here.
         */
        const { isHTTPS, requestJSONAsync } = require('@hint/utils-network');
        const { normalizeString } = require('@hint/utils-string');

        const loadHintConfigs = () => {
            minMaxAgeValue = (context.hintOptions && context.hintOptions.minMaxAgeValue) || 10886400; // 18 weeks
            checkPreload = (context.hintOptions && context.hintOptions.checkPreload);
        };

        /*
         * STS header Syntax:
         * Strict-Transport-Security: max-age=<expire-time>
         * Strict-Transport-Security: max-age=<expire-time>; includeSubDomains
         * Strict-Transport-Security: max-age=<expire-time>; preload
         * This function accomplishes the following:
         * "max-age=31536000; includesubdomains; preload" => {"max-age":31536000,"includesubdomains":true,"preload":true}
         */
        const parse = (headerValue: string) => {
            const parsedHeader: { [name: string]: string } = {};
            const directives = headerValue.toLowerCase().split(';');
            const nameValuePairRegex = /^ *([!#$%&'*+.^_`|~0-9A-Za-z-]+) *= *("(?:[~0-9])*"|[!#$%&'*+.^_`|~0-9]+) *$/;
            /*
             * Regex for name-value pairs. E.g.: max-age=31536000
             * Modified usage of https://github.com/jshttp/content-type/blob/64bde0d996ccb4334341662c0c7d25f7b370c4d9/index.js#L23
             */
            const tokenRegex = /^ *[!#$%&'*+.^_`|~0-9A-Za-z-]+$/; // Regex for single tokens. E.g.:  includesubdomains

            for (const directive of directives) {
                const match = tokenRegex.exec(directive) || nameValuePairRegex.exec(directive);

                if (!match) {
                    return {
                        error: {
                            message: getMessage('wrongFormat', context.language),
                            severity: Severity.error
                        }
                    };
                }

                const [matchString, key, value] = match;
                const name = key || matchString.trim();

                if (parsedHeader[name]) {
                    return {
                        error: {
                            message: getMessage('moreThanOneName', context.language),
                            severity: Severity.warning
                        }
                    };
                }

                parsedHeader[name] = value || 'true';
            }

            return { parsedHeader };
        };

        const isUnderAgeLimit = (maxAge: string, limit: number): boolean => {
            return !!maxAge && parseInt(maxAge) < limit;
        };

        const isPreloaded = (hostname: string): Promise<{ [key: string]: any }> => {
            debug(`Waiting to get preload status for ${hostname}`);

            return requestJSONAsync(`${statusApiEndPoint}${hostname}`);
        };

        const issuesToPreload = (hostname: string): Promise<{ [key: string]: any }> => {
            debug(`Waiting to get preload eligibility for ${hostname}`);

            return requestJSONAsync(`${preloadableApiEndPoint}${hostname}`);
        };

        const verifyPreload = async (resource: string): Promise<{ [key: string]: any }> => {
            const originalDomain = new URL(resource).hostname;
            const mainDomain = originalDomain.replace(/^www./, '');
            // Some hostnames in the list include `www.`, e.g., `www.gov.uk`.
            let status: string;
            let issues: { [key: string]: any } = {};

            try {
                ({ status } = await isPreloaded(mainDomain) || await isPreloaded(originalDomain));
            } catch (err) {
                const message = getMessage('errorPreloadStatus', context.language);

                debug(message, err);
                context.report(resource, message, { severity: Severity.error });

                return issues;
            }

            debug(`Received preload status for ${resource}.`);

            if (!status) {
                const message = getMessage('errorPreloadStatus', context.language);

                debug(message);
                context.report(resource, message, { severity: Severity.warning });

                return issues;
            }

            if (status !== 'preloaded') {
                try {
                    issues = await issuesToPreload(mainDomain);
                } catch (err) {
                    const message = getMessage('errorPreloadEligibility', context.language);

                    debug(message, err);
                    context.report(resource, message, { severity: Severity.error });
                }

                debug(`Received preload eligibility for ${resource}.`);
            }

            return issues;
        };

        const validate = async ({ element, resource, response }: FetchEnd) => {
            if (!isRegularProtocol(resource)) {
                debug(`Check does not apply for non HTTP(s) URIs`);

                return;
            }

            const headerValue: string = normalizeString(response.headers && response.headers['strict-transport-security']);

            if (!isHTTPS(resource) && headerValue) {
                const message = getMessage('noOverHTTP', context.language);

                context.report(resource, message, {
                    codeLanguage: 'http',
                    codeSnippet: `Strict-Transport-Security: ${headerValue}`,
                    element,
                    severity: Severity.warning
                });

                return;
            }

            if (!isHTTPS(resource) && !headerValue) {
                const urlObject = new URL(resource);

                if (unsupportedDomains.has(urlObject.host)) {
                    debug(`${resource} ignored because the domain ${urlObject.host} does not support HTTPS.`);

                    return;
                }

                const httpsResource = url.format({ ...urlObject, protocol: `https` });

                try {
                    const networkData: NetworkData = await context.fetchContent(httpsResource);

                    if (!networkData || !networkData.response) {
                        return;
                    }

                    if (networkData.response.statusCode === 200) {
                        validate({
                            element: null,
                            request: networkData.request,
                            resource: httpsResource,
                            response: networkData.response
                        });
                    }
                } catch (err) {
                    // HTTPS site can't be fetched, do nothing.
                    debug(`${resource} doesn't support HTTPS`);

                    /*
                     * If the HTTPS resource can't be fetched,
                     * add the domain to the unsupported list.
                     */
                    unsupportedDomains.add(urlObject.host);
                }

                return;
            }

            // Check if the header `Strict-Transport-Security` is sent for resources served over HTTPS.
            if (!headerValue) {
                context.report(
                    resource,
                    getMessage('noHeader', context.language),
                    {
                        element,
                        severity: Severity.error
                    });

                return;
            }
            // Parse header and report repetitive attributes

            const { error, parsedHeader } = parse(headerValue);

            if (error) {
                context.report(
                    resource,
                    error.message,
                    {
                        element,
                        severity: error.severity
                    });

                return;
            }

            // Required to make TS happy
            if (!parsedHeader) {
                return;
            }

            // Verify preload attribute
            if (checkPreload && parsedHeader.preload) {
                const { errors } = await verifyPreload(resource);

                if (errors) {
                    for (const error of errors) {
                        context.report(resource, error.message, { element, severity: Severity.error });
                    }

                    return;
                }
            }

            const maxAge = parsedHeader['max-age'];

            // Check if header `Strict-Transport-Security` contains `max-age` directive.
            if (!maxAge) {
                const message = getMessage('requiresMaxAge', context.language);

                context.report(resource, message, { element, severity: Severity.error });

                return;
            }

            // Check if the `max-age` value is smaller than the minimum of max-age defined
            if (isUnderAgeLimit(maxAge, minMaxAgeValue)) {
                const message = getMessage('wrongMaxAge', context.language, minMaxAgeValue.toString());

                context.report(resource, message, {
                    codeLanguage: 'http',
                    codeSnippet: `Strict-Transport-Security: ${headerValue}`,
                    element,
                    severity: Severity.warning
                });

                return;
            }
        };

        loadHintConfigs();

        context.on('fetch::end::*', validate);
    }
}
